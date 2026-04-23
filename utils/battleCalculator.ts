/**
 * Calculadora de batalhas para Call of Roma
 * Implementa a lógica de cálculo baseada no sistema de batalhas por turnos
 * Baseado no paper: Coevolutionary Procedural Generation of Battle Formations
 * Implementa:
 * - até 3 heróis ativos por lado (left/center/right)
 * - fila de reposição para heróis extras
 * - combate por divisão (6 slots)
 * - penalidade de retaguarda quando não há linha frontal
 */

import {
  Hero,
  BattleFormation,
  BattleResult,
  BattleRound,
  FormationStats,
  TroopSlot,
  UnitType,
  BattleHeroRoundDetail,
  BattleRoundMatchup,
  BattleRoundReplacementEvent,
} from '@/types/battle';
import { unitTypes } from '@/data/unitTypes';
import { AcademyMax } from '@/utils/academyReference';
import { calculateHeroFinalStats, calculateTotalSoldiers } from './heroCalculator';

interface BattleSlot {
  slotIndex: number;
  unitType: UnitType;
  quantity: number;
  unitData: typeof unitTypes[UnitType];
  attack: number;
  defense: number;
  health: number;
  speed: number;
}

interface BattleHero {
  hero: Hero;
  heroStats: {
    attack: number;
    defense: number;
    health: number;
    speed: number;
  };
  slots: BattleSlot[];
}

interface PlannedSlotDamage {
  target: BattleSlot;
  damage: number;
}

interface BattlefieldSide {
  active: Array<BattleHero | null>;
  queue: BattleHero[];
  usedHeroIds: Set<string>;
}

interface BattleOptions {
  randomizeDamage?: boolean;
  randomSeed?: number;
}

interface HeroRoundSnapshot {
  side: 'attack' | 'defense';
  position: number;
  hero: BattleHero;
  enteredFromQueue: boolean;
  soldiersBefore: number;
  slotsBefore: number[];
}

function calculateSlotStats(
  slot: TroopSlot,
  slotIndex: number,
  heroStats: { attack: number; defense: number; health: number }
): BattleSlot {
  const unitData = unitTypes[slot.unitType];
  const isSuperior = slotIndex <= 3;

  let slotAttack = unitData.baseAttack;
  let slotDefense = unitData.baseDefense;
  let slotHealth = unitData.baseHP;
  const slotSpeed = unitData.speed;

  if (isSuperior && slot.unitType !== 'none') {
    slotAttack += heroStats.attack;
    slotDefense += heroStats.defense;
    slotHealth += heroStats.health;
  }

  if (slot.unitType !== 'none') {
    slotHealth *= AcademyMax.medicationTroopHp;
    slotDefense *= AcademyMax.securityTroopDefense;
    if (slot.unitType === 'hastatus' || slot.unitType === 'principes') {
      slotAttack *= AcademyMax.footpaceInfantryOffense;
    } else if (slot.unitType === 'equites') {
      slotAttack *= AcademyMax.equitationCavalryOffense;
    } else if (slot.unitType === 'sagittarii' || slot.unitType === 'ballistae' || slot.unitType === 'onagers') {
      slotAttack *= AcademyMax.reconnaissanceRearOffense;
    }
  }

  return {
    slotIndex,
    unitType: slot.unitType,
    quantity: slot.quantity,
    unitData,
    attack: slotAttack,
    defense: slotDefense,
    health: slotHealth,
    speed: slotSpeed,
  };
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getHeroSoldiers(battleHero: BattleHero): number {
  return battleHero.slots.reduce((sum, slot) => sum + slot.quantity, 0);
}

function getFrontalSoldiers(battleHero: BattleHero): number {
  return battleHero.slots
    .filter(slot => slot.slotIndex <= 3 && slot.unitType !== 'none')
    .reduce((sum, slot) => sum + slot.quantity, 0);
}

function isRearSlot(slot: BattleSlot): boolean {
  return slot.slotIndex >= 4 && slot.slotIndex <= 6;
}

function sampleUnitDamage(slot: BattleSlot, randomizeDamage: boolean, rng: () => number): number {
  const min = slot.unitData.baseDamage.min;
  const max = slot.unitData.baseDamage.max;
  if (!randomizeDamage || min === max) {
    return (min + max) / 2;
  }
  return min + (max - min) * rng();
}

function calculateSlotDamage(
  attackerHero: BattleHero,
  attackerSlot: BattleSlot,
  defenderHero: BattleHero,
  defenderSlot: BattleSlot,
  randomizeDamage: boolean,
  rng: () => number
): number {
  if (attackerSlot.quantity <= 0 || attackerSlot.unitType === 'none') {
    return 0;
  }

  if (defenderSlot.quantity <= 0 || defenderSlot.unitType === 'none') {
    return 0;
  }

  const offenseTerm = attackerSlot.attack + attackerHero.hero.bravery;
  const defenseTerm = defenderSlot.defense + defenderHero.hero.parry;
  const combatRatio = Math.max(0.15, offenseTerm / Math.max(1, defenseTerm));
  const rolledDamage = sampleUnitDamage(attackerSlot, randomizeDamage, rng) * AcademyMax.armingDamage;

  let rearPenalty = 1;
  if (isRearSlot(attackerSlot) && getFrontalSoldiers(attackerHero) === 0) {
    rearPenalty = 0.5;
  }

  const damagePerUnit = Math.max(1, rolledDamage * combatRatio * rearPenalty);
  return Math.floor(damagePerUnit * attackerSlot.quantity);
}

function applyDamageToSlot(slot: BattleSlot, damage: number): void {
  if (slot.quantity <= 0 || slot.unitType === 'none') {
    return;
  }

  const hpPerUnit = slot.health;
  if (hpPerUnit <= 0) {
    return;
  }

  const unitsKilled = Math.floor(damage / hpPerUnit);
  slot.quantity = Math.max(0, slot.quantity - unitsKilled);
}

function createBattleHeroes(formation: BattleFormation): BattleHero[] {
  return formation.heroes.map(hero => {
    const heroStats = calculateHeroFinalStats(hero);

    const slots: BattleSlot[] = [
      calculateSlotStats(hero.troopDistribution.slot1, 1, heroStats),
      calculateSlotStats(hero.troopDistribution.slot2, 2, heroStats),
      calculateSlotStats(hero.troopDistribution.slot3, 3, heroStats),
      calculateSlotStats(hero.troopDistribution.slot4, 4, heroStats),
      calculateSlotStats(hero.troopDistribution.slot5, 5, heroStats),
      calculateSlotStats(hero.troopDistribution.slot6, 6, heroStats),
    ];

    return {
      hero,
      heroStats,
      slots,
    };
  });
}

function createBattlefieldSide(heroes: BattleHero[]): BattlefieldSide {
  const initialActive = heroes.slice(0, 3);
  const active: Array<BattleHero | null> = [initialActive[0] ?? null, initialActive[1] ?? null, initialActive[2] ?? null];
  const queue = heroes.slice(3);
  const usedHeroIds = new Set(active.filter((hero): hero is BattleHero => hero !== null).map(hero => hero.hero.id));

  return { active, queue, usedHeroIds };
}

function getTotalSoldiersFromSide(side: BattlefieldSide): number {
  const activeSoldiers = side.active
    .filter((hero): hero is BattleHero => hero !== null)
    .reduce((sum, hero) => sum + getHeroSoldiers(hero), 0);
  const queueSoldiers = side.queue.reduce((sum, hero) => sum + getHeroSoldiers(hero), 0);
  return activeSoldiers + queueSoldiers;
}

function getAliveHeroesFromSide(side: BattlefieldSide): number {
  const activeAlive = side.active
    .filter((hero): hero is BattleHero => hero !== null)
    .filter(hero => getHeroSoldiers(hero) > 0).length;
  const queueAlive = side.queue.filter(hero => getHeroSoldiers(hero) > 0).length;
  return activeAlive + queueAlive;
}

function refillActiveSlots(side: BattlefieldSide, sideLabel: 'attack' | 'defense'): BattleRoundReplacementEvent[] {
  const replacementEvents: BattleRoundReplacementEvent[] = [];

  for (let i = 0; i < side.active.length; i++) {
    const current = side.active[i];
    if (current && getHeroSoldiers(current) > 0) {
      continue;
    }

    const replacedHeroId = current?.hero.id;
    const replacedHeroName = current?.hero.name;
    side.active[i] = null;
    while (side.queue.length > 0) {
      const candidate = side.queue.shift()!;
      if (getHeroSoldiers(candidate) > 0) {
        side.active[i] = candidate;
        side.usedHeroIds.add(candidate.hero.id);
        replacementEvents.push({
          side: sideLabel,
          position: i,
          replacedHeroId,
          replacedHeroName,
          enteredHeroId: candidate.hero.id,
          enteredHeroName: candidate.hero.name,
        });
        break;
      }
    }
  }

  return replacementEvents;
}

function getAliveActivePositions(side: BattlefieldSide): number[] {
  return side.active
    .map((hero, position) => ({ hero, position }))
    .filter(({ hero }) => hero !== null && getHeroSoldiers(hero) > 0)
    .map(({ position }) => position);
}

function resolveTargetPosition(side: BattlefieldSide, preferredPosition: number): number | null {
  const alivePositions = getAliveActivePositions(side);
  if (alivePositions.length === 0) {
    return null;
  }

  if (alivePositions.includes(preferredPosition)) {
    return preferredPosition;
  }

  return alivePositions
    .slice()
    .sort((a, b) => Math.abs(a - preferredPosition) - Math.abs(b - preferredPosition) || a - b)[0];
}

function resolveTargetSlot(defenderHero: BattleHero, preferredSlotIndex: number): BattleSlot | null {
  const aliveSlots = defenderHero.slots.filter(slot => slot.quantity > 0 && slot.unitType !== 'none');
  if (aliveSlots.length === 0) {
    return null;
  }

  const sameSlot = aliveSlots.find(slot => slot.slotIndex === preferredSlotIndex);
  if (sameSlot) {
    return sameSlot;
  }

  return aliveSlots
    .slice()
    .sort(
      (a, b) =>
        Math.abs(a.slotIndex - preferredSlotIndex) - Math.abs(b.slotIndex - preferredSlotIndex) ||
        a.slotIndex - b.slotIndex
    )[0];
}

function planFormationDamageBySlots(
  attackingSide: BattlefieldSide,
  defendingSide: BattlefieldSide,
  randomizeDamage: boolean,
  rng: () => number
): { totalDamage: number; plannedDamages: PlannedSlotDamage[]; damageByAttackerPosition: number[] } {
  let totalDamage = 0;
  const plannedDamages: PlannedSlotDamage[] = [];
  const damageByAttackerPosition = [0, 0, 0];

  for (let attackerPosition = 0; attackerPosition < attackingSide.active.length; attackerPosition++) {
    const attackerHero = attackingSide.active[attackerPosition];
    if (!attackerHero || getHeroSoldiers(attackerHero) <= 0) {
      continue;
    }

    const defenderPosition = resolveTargetPosition(defendingSide, attackerPosition);
    if (defenderPosition === null) {
      continue;
    }

    const defenderHero = defendingSide.active[defenderPosition];
    if (!defenderHero || getHeroSoldiers(defenderHero) <= 0) {
      continue;
    }

    for (const attackerSlot of attackerHero.slots) {
      if (attackerSlot.quantity <= 0 || attackerSlot.unitType === 'none') {
        continue;
      }

      const targetSlot = resolveTargetSlot(defenderHero, attackerSlot.slotIndex);
      if (!targetSlot) {
        continue;
      }

      const slotDamage = calculateSlotDamage(attackerHero, attackerSlot, defenderHero, targetSlot, randomizeDamage, rng);
      totalDamage += slotDamage;
      damageByAttackerPosition[attackerPosition] += slotDamage;
      plannedDamages.push({ target: targetSlot, damage: slotDamage });
    }
  }

  return { totalDamage, plannedDamages, damageByAttackerPosition };
}

function applyPlannedDamageToFormation(plannedDamages: PlannedSlotDamage[]): void {
  const accumulatedDamages = new Map<BattleSlot, number>();

  for (const planned of plannedDamages) {
    const current = accumulatedDamages.get(planned.target) ?? 0;
    accumulatedDamages.set(planned.target, current + planned.damage);
  }

  for (const [slot, damage] of accumulatedDamages.entries()) {
    applyDamageToSlot(slot, damage);
  }
}

function collectActiveHeroSnapshots(
  side: BattlefieldSide,
  sideLabel: 'attack' | 'defense',
  enteredHeroIds: Set<string>
): HeroRoundSnapshot[] {
  const snapshots: HeroRoundSnapshot[] = [];

  for (let position = 0; position < side.active.length; position++) {
    const hero = side.active[position];
    if (!hero || getHeroSoldiers(hero) <= 0) {
      continue;
    }

    snapshots.push({
      side: sideLabel,
      position,
      hero,
      enteredFromQueue: enteredHeroIds.has(hero.hero.id),
      soldiersBefore: getHeroSoldiers(hero),
      slotsBefore: hero.slots.map(slot => slot.quantity),
    });
  }

  return snapshots;
}

function buildHeroRoundDetails(snapshots: HeroRoundSnapshot[]): BattleHeroRoundDetail[] {
  return snapshots.map(snapshot => {
    const slots = snapshot.hero.slots.map((slot, slotIdx) => {
      const before = snapshot.slotsBefore[slotIdx] ?? 0;
      const after = slot.quantity;
      return {
        slotIndex: slot.slotIndex,
        unitType: slot.unitType,
        before,
        after,
        losses: Math.max(0, before - after),
      };
    });

    const soldiersAfter = getHeroSoldiers(snapshot.hero);
    return {
      side: snapshot.side,
      position: snapshot.position,
      heroId: snapshot.hero.hero.id,
      heroName: snapshot.hero.hero.name,
      enteredFromQueue: snapshot.enteredFromQueue,
      soldiersBefore: snapshot.soldiersBefore,
      soldiersAfter,
      losses: Math.max(0, snapshot.soldiersBefore - soldiersAfter),
      defeated: snapshot.soldiersBefore > 0 && soldiersAfter === 0,
      slots,
    };
  });
}

function buildRoundMatchups(
  attackSnapshots: HeroRoundSnapshot[],
  defenseSnapshots: HeroRoundSnapshot[],
  attackPlan: { damageByAttackerPosition: number[] },
  defensePlan: { damageByAttackerPosition: number[] }
): BattleRoundMatchup[] {
  const attackByPosition = new Map<number, HeroRoundSnapshot>(attackSnapshots.map(snapshot => [snapshot.position, snapshot]));
  const defenseByPosition = new Map<number, HeroRoundSnapshot>(defenseSnapshots.map(snapshot => [snapshot.position, snapshot]));

  const matchups: BattleRoundMatchup[] = [];
  for (let position = 0; position < 3; position++) {
    const attackHero = attackByPosition.get(position);
    const defenseHero = defenseByPosition.get(position);
    const attackDamage = attackPlan.damageByAttackerPosition[position] ?? 0;
    const defenseDamage = defensePlan.damageByAttackerPosition[position] ?? 0;

    if (!attackHero && !defenseHero && attackDamage === 0 && defenseDamage === 0) {
      continue;
    }

    matchups.push({
      position,
      attackHeroId: attackHero?.hero.hero.id,
      attackHeroName: attackHero?.hero.hero.name,
      defenseHeroId: defenseHero?.hero.hero.id,
      defenseHeroName: defenseHero?.hero.hero.name,
      attackDamage,
      defenseDamage,
    });
  }

  return matchups;
}

export function calculateBattle(
  attackFormation: BattleFormation,
  defenseFormation: BattleFormation,
  options: BattleOptions = {}
): BattleResult {
  const rng = createRng(options.randomSeed ?? 42);
  const randomizeDamage = options.randomizeDamage ?? true;

  const attackSide = createBattlefieldSide(createBattleHeroes(attackFormation));
  const defenseSide = createBattlefieldSide(createBattleHeroes(defenseFormation));

  const maxRounds = 501;
  const rounds: BattleRound[] = [];
  let attackKills = 0;
  let defenseKills = 0;
  let round = 0;

  while (round < maxRounds) {
    round++;

    const attackReplacements = refillActiveSlots(attackSide, 'attack');
    const defenseReplacements = refillActiveSlots(defenseSide, 'defense');
    const replacements: BattleRoundReplacementEvent[] = [...attackReplacements, ...defenseReplacements];

    const enteredAttackHeroIds = new Set(attackReplacements.map(event => event.enteredHeroId));
    const enteredDefenseHeroIds = new Set(defenseReplacements.map(event => event.enteredHeroId));
    const attackSnapshots = collectActiveHeroSnapshots(attackSide, 'attack', enteredAttackHeroIds);
    const defenseSnapshots = collectActiveHeroSnapshots(defenseSide, 'defense', enteredDefenseHeroIds);

    const attackSoldiersBefore = getTotalSoldiersFromSide(attackSide);
    const defenseSoldiersBefore = getTotalSoldiersFromSide(defenseSide);

    if (attackSoldiersBefore === 0 || defenseSoldiersBefore === 0) {
      break;
    }

    const attackPlan = planFormationDamageBySlots(attackSide, defenseSide, randomizeDamage, rng);
    const defensePlan = planFormationDamageBySlots(defenseSide, attackSide, randomizeDamage, rng);

    applyPlannedDamageToFormation(attackPlan.plannedDamages);
    applyPlannedDamageToFormation(defensePlan.plannedDamages);

    const attackSoldiersAfter = getTotalSoldiersFromSide(attackSide);
    const defenseSoldiersAfter = getTotalSoldiersFromSide(defenseSide);
    const attackHeroes = buildHeroRoundDetails(attackSnapshots);
    const defenseHeroes = buildHeroRoundDetails(defenseSnapshots);
    const matchups = buildRoundMatchups(attackSnapshots, defenseSnapshots, attackPlan, defensePlan);

    attackKills += Math.max(0, defenseSoldiersBefore - defenseSoldiersAfter);
    defenseKills += Math.max(0, attackSoldiersBefore - attackSoldiersAfter);

    rounds.push({
      round,
      attackSoldiersBefore,
      defenseSoldiersBefore,
      attackSoldiersAfter,
      defenseSoldiersAfter,
      damageDealt: {
        attack: attackPlan.totalDamage,
        defense: defensePlan.totalDamage,
      },
      matchups,
      attackHeroes,
      defenseHeroes,
      replacements,
    });

    if (attackSoldiersAfter === 0 || defenseSoldiersAfter === 0) {
      break;
    }
  }

  const finalAttackSoldiers = getTotalSoldiersFromSide(attackSide);
  const finalDefenseSoldiers = getTotalSoldiersFromSide(defenseSide);
  const initialAttackSoldiers = attackFormation.heroes.reduce(
    (sum, hero) => sum + calculateTotalSoldiers(hero.troopDistribution),
    0
  );
  const initialDefenseSoldiers = defenseFormation.heroes.reduce(
    (sum, hero) => sum + calculateTotalSoldiers(hero.troopDistribution),
    0
  );
  const attackRemainingHeroes = getAliveHeroesFromSide(attackSide);
  const defenseRemainingHeroes = getAliveHeroesFromSide(defenseSide);

  let winner: 'attack' | 'defense' | 'draw';
  if (finalAttackSoldiers > finalDefenseSoldiers) {
    winner = 'attack';
  } else if (finalDefenseSoldiers > finalAttackSoldiers) {
    winner = 'defense';
  } else {
    winner = 'draw';
  }

  const winningInitialSoldiers =
    winner === 'attack' ? initialAttackSoldiers : winner === 'defense' ? initialDefenseSoldiers : 0;
  const winningFinalSoldiers =
    winner === 'attack' ? finalAttackSoldiers : winner === 'defense' ? finalDefenseSoldiers : 0;
  const winningKills = winner === 'attack' ? attackKills : winner === 'defense' ? defenseKills : 0;
  const winningHeroCount =
    winner === 'attack' ? attackFormation.heroes.length : winner === 'defense' ? defenseFormation.heroes.length : 0;
  const winningUsedHeroes =
    winner === 'attack' ? attackSide.usedHeroIds.size : winner === 'defense' ? defenseSide.usedHeroIds.size : 0;

  const enemyInitialAverage =
    winner === 'attack'
      ? defenseFormation.heroes.length > 0
        ? initialDefenseSoldiers / defenseFormation.heroes.length
        : 0
      : winner === 'defense'
        ? attackFormation.heroes.length > 0
          ? initialAttackSoldiers / attackFormation.heroes.length
          : 0
        : 0;

  const performanceMetrics = {
    victoryPoint: winner === 'draw' ? 0 : 1,
    offensiveness: winningInitialSoldiers > 0 ? winningKills / winningInitialSoldiers : 0,
    defensiveness: winningInitialSoldiers > 0 ? winningFinalSoldiers / winningInitialSoldiers : 0,
    usage: winningHeroCount > 0 ? Math.max(0, (winningHeroCount - winningUsedHeroes) / winningHeroCount) : 0,
    participation: enemyInitialAverage > 0 ? winningKills / enemyInitialAverage : 0,
  };

  return {
    winner,
    attackRemainingSoldiers: finalAttackSoldiers,
    defenseRemainingSoldiers: finalDefenseSoldiers,
    attackRemainingHeroes,
    defenseRemainingHeroes,
    performanceMetrics,
    rounds: round,
    details: rounds,
  };
}

export function calculateFormationStats(formation: BattleFormation): FormationStats {
  const battleHeroes = createBattleHeroes(formation);

  let totalAttack = 0;
  let totalDefense = 0;
  let totalHealth = 0;
  let totalSpeed = 0;
  let speedCount = 0;

  for (const battleHero of battleHeroes) {
    for (const slot of battleHero.slots) {
      if (slot.quantity > 0 && slot.unitType !== 'none') {
        totalAttack += slot.attack * slot.quantity;
        totalDefense += slot.defense * slot.quantity;
        totalHealth += slot.health * slot.quantity;
        totalSpeed += slot.speed;
        speedCount++;
      }
    }
  }

  return {
    totalSoldiers: battleHeroes.reduce((sum, battleHero) => sum + getHeroSoldiers(battleHero), 0),
    totalAttack,
    totalDefense,
    totalHealth,
    averageSpeed: speedCount > 0 ? totalSpeed / speedCount : 0,
    heroCount: formation.heroes.length,
  };
}
