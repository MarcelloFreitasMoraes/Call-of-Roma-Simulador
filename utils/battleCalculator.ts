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

import { Hero, BattleFormation, BattleResult, BattleRound, FormationStats, TroopSlot, UnitType } from '@/types/battle';
import { unitTypes } from '@/data/unitTypes';
import { calculateHeroFinalStats, calculateTotalSoldiers } from './heroCalculator';

/**
 * Representa um slot de batalha com suas tropas e stats calculados
 */
interface BattleSlot {
  slotIndex: number; // 1-6
  unitType: UnitType;
  quantity: number; // Quantidade de tropas no slot
  unitData: typeof unitTypes[UnitType];
  // Stats calculados do slot (considerando equipamentos se for tropa superior)
  attack: number;
  defense: number;
  health: number;
  speed: number;
}

/**
 * Representa um herói em batalha com seus slots
 */
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

/**
 * Calcula os stats de um slot individual
 */
function calculateSlotStats(
  slot: TroopSlot,
  slotIndex: number,
  heroStats: { attack: number; defense: number; health: number }
): BattleSlot {
  const unitData = unitTypes[slot.unitType];
  const isSuperior = slotIndex <= 3; // Slots 1-3 são superiores
  
  let slotAttack = unitData.baseAttack;
  let slotDefense = unitData.baseDefense;
  let slotHealth = unitData.baseHP;
  const slotSpeed = unitData.speed;
  
  // Tropas superiores recebem bônus de equipamentos
  if (isSuperior && slot.unitType !== 'none') {
    slotAttack += heroStats.attack;
    slotDefense += heroStats.defense;
    slotHealth += heroStats.health;
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

/**
 * RNG determinístico opcional para reproducibilidade
 */
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

/**
 * Aproximação de dano baseada nos fatores citados no paper:
 * Offense + Bravery vs Defense + Parry, com dano da unidade em intervalo uniforme.
 */
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
  const rolledDamage = sampleUnitDamage(attackerSlot, randomizeDamage, rng);

  let rearPenalty = 1;
  if (isRearSlot(attackerSlot) && getFrontalSoldiers(attackerHero) === 0) {
    rearPenalty = 0.5;
  }

  const damagePerUnit = Math.max(1, rolledDamage * combatRatio * rearPenalty);
  return Math.floor(damagePerUnit * attackerSlot.quantity);
}

/**
 * Aplica dano a um slot específico
 */
function applyDamageToSlot(slot: BattleSlot, damage: number): void {
  if (slot.quantity <= 0 || slot.unitType === 'none') {
    return;
  }
  
  // Calcula quantas tropas morrem baseado no HP por unidade
  const hpPerUnit = slot.health;
  if (hpPerUnit <= 0) return;
  
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
  const usedHeroIds = new Set(
    active.filter((hero): hero is BattleHero => hero !== null).map(hero => hero.hero.id)
  );

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

function refillActiveSlots(side: BattlefieldSide): void {
  for (let i = 0; i < side.active.length; i++) {
    const current = side.active[i];
    if (current && getHeroSoldiers(current) > 0) {
      continue;
    }

    side.active[i] = null;
    while (side.queue.length > 0) {
      const candidate = side.queue.shift()!;
      if (getHeroSoldiers(candidate) > 0) {
        side.active[i] = candidate;
        side.usedHeroIds.add(candidate.hero.id);
        break;
      }
    }
  }
}

function getActiveHeroes(side: BattlefieldSide): BattleHero[] {
  return side.active.filter((hero): hero is BattleHero => hero !== null && getHeroSoldiers(hero) > 0);
}

function planFormationDamageBySlots(
  attackingSide: BattlefieldSide,
  defendingSide: BattlefieldSide,
  randomizeDamage: boolean,
  rng: () => number
): { totalDamage: number; plannedDamages: PlannedSlotDamage[] } {
  let totalDamage = 0;
  const plannedDamages: PlannedSlotDamage[] = [];
  const attackingHeroes = getActiveHeroes(attackingSide);
  const defendingHeroes = getActiveHeroes(defendingSide);

  for (const attackerHero of attackingHeroes) {
    for (const attackerSlot of attackerHero.slots) {
      if (attackerSlot.quantity <= 0 || attackerSlot.unitType === 'none') {
        continue;
      }
      
      // Foco no alvo mais vulnerável entre heróis ativos
      let weakestDefenderHero: BattleHero | null = null;
      let weakestDefenderSlot: BattleSlot | null = null;
      let weakestDefense = Infinity;
      
      for (const defenderHero of defendingHeroes) {
        for (const defenderSlot of defenderHero.slots) {
          if (defenderSlot.quantity > 0 && defenderSlot.unitType !== 'none') {
            if (defenderSlot.defense < weakestDefense) {
              weakestDefense = defenderSlot.defense;
              weakestDefenderHero = defenderHero;
              weakestDefenderSlot = defenderSlot;
            }
          }
        }
      }
      
      if (weakestDefenderHero && weakestDefenderSlot) {
        const slotDamage = calculateSlotDamage(
          attackerHero,
          attackerSlot,
          weakestDefenderHero,
          weakestDefenderSlot,
          randomizeDamage,
          rng
        );
        totalDamage += slotDamage;
        plannedDamages.push({ target: weakestDefenderSlot, damage: slotDamage });
      }
    }
  }
  
  return { totalDamage, plannedDamages };
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

/**
 * Calcula uma batalha completa entre duas formações
 */
export function calculateBattle(
  attackFormation: BattleFormation,
  defenseFormation: BattleFormation,
  options: BattleOptions = {}
): BattleResult {
  const rng = createRng(options.randomSeed ?? 42);
  const randomizeDamage = options.randomizeDamage ?? true;

  const attackSide = createBattlefieldSide(createBattleHeroes(attackFormation));
  const defenseSide = createBattlefieldSide(createBattleHeroes(defenseFormation));
  
  const maxRounds = 50;
  const rounds: BattleRound[] = [];
  let attackKills = 0;
  let defenseKills = 0;
  let round = 0;
  
  while (round < maxRounds) {
    round++;

    refillActiveSlots(attackSide);
    refillActiveSlots(defenseSide);
    
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
    winner === 'attack'
      ? attackFormation.heroes.length
      : winner === 'defense'
      ? defenseFormation.heroes.length
      : 0;
  const winningUsedHeroes =
    winner === 'attack'
      ? attackSide.usedHeroIds.size
      : winner === 'defense'
      ? defenseSide.usedHeroIds.size
      : 0;

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
    usage:
      winningHeroCount > 0
        ? Math.max(0, (winningHeroCount - winningUsedHeroes) / winningHeroCount)
        : 0,
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

/**
 * Calcula estatísticas de uma formação
 */
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
