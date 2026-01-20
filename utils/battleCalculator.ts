/**
 * Calculadora de batalhas para Call of Roma
 * Implementa a lógica de cálculo baseada no sistema de batalhas por turnos
 * Baseado no paper: Coevolutionary Procedural Generation of Battle Formations
 * Melhorado para calcular por slot individual (como no replay do jogo)
 */

import { Hero, BattleFormation, BattleResult, BattleRound, FormationStats, TroopSlot, UnitType } from '@/types/battle';
import { unitTypes } from '@/data/unitTypes';
import { calculateHeroFinalStats } from './heroCalculator';

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
  let slotSpeed = unitData.speed;
  
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
 * Calcula o dano causado por um slot atacante contra um slot defensor
 */
function calculateSlotDamage(attackerSlot: BattleSlot, defenderSlot: BattleSlot): number {
  if (attackerSlot.quantity <= 0 || attackerSlot.unitType === 'none') {
    return 0;
  }
  
  if (defenderSlot.quantity <= 0 || defenderSlot.unitType === 'none') {
    return 0;
  }
  
  // Dano base = ataque - defesa (mínimo 1)
  const baseDamage = Math.max(1, attackerSlot.attack - defenderSlot.defense);
  
  // Dano por unidade (considerando o dano base da unidade)
  const unitDamage = (attackerSlot.unitData.baseDamage.min + attackerSlot.unitData.baseDamage.max) / 2;
  
  // Multiplicador baseado no número de tropas no slot
  const quantityMultiplier = Math.log10(attackerSlot.quantity + 1) / 2;
  
  // Dano total do slot
  const totalDamage = Math.floor((baseDamage + unitDamage) * (1 + quantityMultiplier) * attackerSlot.quantity);
  
  return totalDamage;
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

/**
 * Converte uma formação em heróis de batalha com slots calculados
 */
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

/**
 * Calcula o total de soldados de uma formação de batalha
 */
function getTotalSoldiers(battleHeroes: BattleHero[]): number {
  return battleHeroes.reduce((total, battleHero) => {
    return total + battleHero.slots.reduce((sum, slot) => sum + slot.quantity, 0);
  }, 0);
}

/**
 * Calcula o dano total de uma formação contra outra (por slot)
 */
function calculateFormationDamageBySlots(
  attackingHeroes: BattleHero[],
  defendingHeroes: BattleHero[]
): number {
  let totalDamage = 0;
  
  // Cada herói atacante
  for (const attackerHero of attackingHeroes) {
    // Cada slot do herói atacante
    for (const attackerSlot of attackerHero.slots) {
      if (attackerSlot.quantity <= 0 || attackerSlot.unitType === 'none') {
        continue;
      }
      
      // Encontra o slot defensor mais fraco (menor defesa)
      let weakestDefenderSlot: BattleSlot | null = null;
      let weakestDefense = Infinity;
      
      for (const defenderHero of defendingHeroes) {
        for (const defenderSlot of defenderHero.slots) {
          if (defenderSlot.quantity > 0 && defenderSlot.unitType !== 'none') {
            if (defenderSlot.defense < weakestDefense) {
              weakestDefense = defenderSlot.defense;
              weakestDefenderSlot = defenderSlot;
            }
          }
        }
      }
      
      if (weakestDefenderSlot) {
        const slotDamage = calculateSlotDamage(attackerSlot, weakestDefenderSlot);
        totalDamage += slotDamage;
      }
    }
  }
  
  return totalDamage;
}

/**
 * Distribui dano entre os slots de uma formação
 */
function distributeDamageToFormation(
  battleHeroes: BattleHero[],
  totalDamage: number
): void {
  // Coleta todos os slots ativos
  const activeSlots: BattleSlot[] = [];
  for (const battleHero of battleHeroes) {
    for (const slot of battleHero.slots) {
      if (slot.quantity > 0 && slot.unitType !== 'none') {
        activeSlots.push(slot);
      }
    }
  }
  
  if (activeSlots.length === 0) return;
  
  // Distribui dano proporcionalmente baseado na quantidade de tropas
  const totalTroops = activeSlots.reduce((sum, slot) => sum + slot.quantity, 0);
  
  if (totalTroops === 0) return;
  
  let remainingDamage = totalDamage;
  
  for (const slot of activeSlots) {
    const damageRatio = slot.quantity / totalTroops;
    const slotDamage = Math.floor(totalDamage * damageRatio);
    applyDamageToSlot(slot, slotDamage);
    remainingDamage -= slotDamage;
  }
  
  // Aplica dano restante ao primeiro slot ativo (se houver)
  if (remainingDamage > 0 && activeSlots.length > 0) {
    applyDamageToSlot(activeSlots[0], remainingDamage);
  }
}

/**
 * Calcula uma batalha completa entre duas formações (por slot)
 */
export function calculateBattle(
  attackFormation: BattleFormation,
  defenseFormation: BattleFormation
): BattleResult {
  // Cria heróis de batalha com slots calculados
  let attackHeroes = createBattleHeroes(attackFormation);
  let defenseHeroes = createBattleHeroes(defenseFormation);
  
  const maxRounds = 50;
  const rounds: BattleRound[] = [];
  
  let round = 0;
  
  while (round < maxRounds) {
    round++;
    
    // Conta soldados antes da rodada
    const attackSoldiersBefore = getTotalSoldiers(attackHeroes);
    const defenseSoldiersBefore = getTotalSoldiers(defenseHeroes);
    
    // Verifica se alguém já perdeu
    if (attackSoldiersBefore === 0 || defenseSoldiersBefore === 0) {
      break;
    }
    
    // Calcula dano por slot
    const attackDamage = calculateFormationDamageBySlots(attackHeroes, defenseHeroes);
    const defenseDamage = calculateFormationDamageBySlots(defenseHeroes, attackHeroes);
    
    // Aplica dano aos slots
    distributeDamageToFormation(defenseHeroes, attackDamage);
    distributeDamageToFormation(attackHeroes, defenseDamage);
    
    // Conta soldados depois da rodada
    const attackSoldiersAfter = getTotalSoldiers(attackHeroes);
    const defenseSoldiersAfter = getTotalSoldiers(defenseHeroes);
    
    rounds.push({
      round,
      attackSoldiersBefore,
      defenseSoldiersBefore,
      attackSoldiersAfter,
      defenseSoldiersAfter,
      damageDealt: {
        attack: attackDamage,
        defense: defenseDamage,
      },
    });
    
    // Verifica se alguém perdeu
    if (attackSoldiersAfter === 0 || defenseSoldiersAfter === 0) {
      break;
    }
  }
  
  // Calcula resultados finais
  const finalAttackSoldiers = getTotalSoldiers(attackHeroes);
  const finalDefenseSoldiers = getTotalSoldiers(defenseHeroes);
  
  const initialAttackSoldiers = getTotalSoldiers(createBattleHeroes(attackFormation));
  const initialDefenseSoldiers = getTotalSoldiers(createBattleHeroes(defenseFormation));
  
  const attackRemainingHeroes = attackHeroes.filter(bh => 
    getTotalSoldiers([bh]) > 0
  ).length;
  const defenseRemainingHeroes = defenseHeroes.filter(bh => 
    getTotalSoldiers([bh]) > 0
  ).length;
  
  // Determina vencedor
  let winner: 'attack' | 'defense' | 'draw';
  if (finalAttackSoldiers > finalDefenseSoldiers) {
    winner = 'attack';
  } else if (finalDefenseSoldiers > finalAttackSoldiers) {
    winner = 'defense';
  } else {
    winner = 'draw';
  }
  
  // Calcula as 5 medidas de performance (baseado no paper)
  const performanceMetrics = {
    // 1. Número de soldados sobreviventes do vencedor
    survivingSoldiers:
      winner === 'attack'
        ? finalAttackSoldiers
        : winner === 'defense'
        ? finalDefenseSoldiers
        : 0,
    // 2. Diferença de soldados (ataque - defesa)
    soldierDifference: finalAttackSoldiers - finalDefenseSoldiers,
    // 3. Taxa de sobrevivência de soldados do vencedor
    soldierSurvivalRate:
      winner === 'attack'
        ? finalAttackSoldiers / initialAttackSoldiers
        : winner === 'defense'
        ? finalDefenseSoldiers / initialDefenseSoldiers
        : 0,
    // 4. Número de heróis sobreviventes do vencedor
    survivingHeroes:
      winner === 'attack'
        ? attackRemainingHeroes
        : winner === 'defense'
        ? defenseRemainingHeroes
        : 0,
    // 5. Eficiência geral (combinação ponderada)
    overallEfficiency:
      winner === 'attack'
        ? (finalAttackSoldiers / initialAttackSoldiers) *
          (attackRemainingHeroes / attackFormation.heroes.length) *
          100
        : winner === 'defense'
        ? (finalDefenseSoldiers / initialDefenseSoldiers) *
          (defenseRemainingHeroes / defenseFormation.heroes.length) *
          100
        : 0,
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
    totalSoldiers: getTotalSoldiers(battleHeroes),
    totalAttack,
    totalDefense,
    totalHealth,
    averageSpeed: speedCount > 0 ? totalSpeed / speedCount : 0,
    heroCount: formation.heroes.length,
  };
}
