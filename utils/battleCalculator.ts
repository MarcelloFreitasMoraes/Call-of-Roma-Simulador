/**
 * Calculadora de batalhas para Call of Roma
 * Implementa a lógica de cálculo baseada no sistema de batalhas por turnos
 * Baseado no paper: Coevolutionary Procedural Generation of Battle Formations
 */

import { Hero, BattleFormation, BattleResult, BattleRound, FormationStats } from '@/types/battle';

/**
 * Calcula o dano causado por um herói
 */
function calculateDamage(attacker: Hero, defender: Hero): number {
  // Fórmula simplificada: dano = ataque - defesa (mínimo 1)
  const baseDamage = Math.max(1, attacker.attack - defender.defense);
  
  // Multiplicador baseado no número de soldados
  const soldierMultiplier = Math.log10(attacker.soldiers + 1) / 2;
  
  // Dano total
  const totalDamage = Math.floor(baseDamage * (1 + soldierMultiplier));
  
  return totalDamage;
}

/**
 * Calcula o dano total de uma formação contra outra
 */
function calculateFormationDamage(
  attackingFormation: BattleFormation,
  defendingFormation: BattleFormation
): number {
  let totalDamage = 0;
  
  // Cada herói atacante causa dano
  for (const attacker of attackingFormation.heroes) {
    if (attacker.soldiers <= 0) continue;
    
    // Encontra o defensor mais fraco ou distribui o dano
    const weakestDefender = defendingFormation.heroes
      .filter(h => h.soldiers > 0)
      .sort((a, b) => a.defense - b.defense)[0];
    
    if (weakestDefender) {
      totalDamage += calculateDamage(attacker, weakestDefender);
    }
  }
  
  return totalDamage;
}

/**
 * Distribui o dano entre os heróis de uma formação
 */
function distributeDamage(
  formation: BattleFormation,
  totalDamage: number
): void {
  // Distribui o dano proporcionalmente entre os heróis com soldados
  const activeHeroes = formation.heroes.filter(h => h.soldiers > 0);
  
  if (activeHeroes.length === 0) return;
  
  const damagePerHero = Math.floor(totalDamage / activeHeroes.length);
  const remainder = totalDamage % activeHeroes.length;
  
  activeHeroes.forEach((hero, index) => {
    const damage = damagePerHero + (index < remainder ? 1 : 0);
    const soldiersLost = Math.min(
      hero.soldiers,
      Math.floor(damage / Math.max(1, hero.defense))
    );
    hero.soldiers = Math.max(0, hero.soldiers - soldiersLost);
  });
}

/**
 * Calcula uma batalha completa entre duas formações
 */
export function calculateBattle(
  attackFormation: BattleFormation,
  defenseFormation: BattleFormation
): BattleResult {
  // Cria cópias para não modificar os originais
  const attack = JSON.parse(JSON.stringify(attackFormation)) as BattleFormation;
  const defense = JSON.parse(JSON.stringify(defenseFormation)) as BattleFormation;
  
  const maxRounds = 50; // Limite de rodadas para evitar loops infinitos
  const rounds: BattleRound[] = [];
  
  let round = 0;
  
  while (round < maxRounds) {
    round++;
    
    // Conta soldados antes da rodada
    const attackSoldiersBefore = attack.heroes.reduce(
      (sum, h) => sum + h.soldiers,
      0
    );
    const defenseSoldiersBefore = defense.heroes.reduce(
      (sum, h) => sum + h.soldiers,
      0
    );
    
    // Verifica se alguém já perdeu
    if (attackSoldiersBefore === 0 || defenseSoldiersBefore === 0) {
      break;
    }
    
    // Ataque ataca primeiro (baseado em velocidade, mas simplificado)
    const attackDamage = calculateFormationDamage(attack, defense);
    const defenseDamage = calculateFormationDamage(defense, attack);
    
    // Aplica dano
    distributeDamage(defense, attackDamage);
    distributeDamage(attack, defenseDamage);
    
    // Conta soldados depois da rodada
    const attackSoldiersAfter = attack.heroes.reduce(
      (sum, h) => sum + h.soldiers,
      0
    );
    const defenseSoldiersAfter = defense.heroes.reduce(
      (sum, h) => sum + h.soldiers,
      0
    );
    
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
  const finalAttackSoldiers = attack.heroes.reduce(
    (sum, h) => sum + h.soldiers,
    0
  );
  const finalDefenseSoldiers = defense.heroes.reduce(
    (sum, h) => sum + h.soldiers,
    0
  );
  
  const initialAttackSoldiers = attackFormation.heroes.reduce(
    (sum, h) => sum + h.soldiers,
    0
  );
  const initialDefenseSoldiers = defenseFormation.heroes.reduce(
    (sum, h) => sum + h.soldiers,
    0
  );
  
  const attackRemainingHeroes = attack.heroes.filter(h => h.soldiers > 0).length;
  const defenseRemainingHeroes = defense.heroes.filter(h => h.soldiers > 0).length;
  
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
  return {
    totalSoldiers: formation.heroes.reduce((sum, h) => sum + h.soldiers, 0),
    totalAttack: formation.heroes.reduce((sum, h) => sum + h.attack, 0),
    totalDefense: formation.heroes.reduce((sum, h) => sum + h.defense, 0),
    totalHealth: formation.heroes.reduce((sum, h) => sum + h.health, 0),
    averageSpeed:
      formation.heroes.length > 0
        ? formation.heroes.reduce((sum, h) => sum + h.speed, 0) /
          formation.heroes.length
        : 0,
    heroCount: formation.heroes.length,
  };
}
