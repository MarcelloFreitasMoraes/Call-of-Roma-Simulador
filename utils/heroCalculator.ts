/**
 * Utilitários para calcular atributos finais do herói
 * Considera potencial, atributos base, equipamentos e medalhas
 */

import { Hero } from '@/types/battle';

/**
 * Calcula os atributos finais do herói considerando:
 * - Atributos base (bravura, destreza, bloqueio)
 * - Potencial
 * - Equipamentos
 * - Medalhas
 */
export function calculateHeroFinalStats(hero: Hero): {
  attack: number;
  defense: number;
  health: number;
  speed: number;
  totalTroopCapacity: number;
} {
  // Atributos base do herói
  const baseAttack = hero.bravery; // Bravura contribui para ataque
  const baseDefense = hero.parry; // Bloqueio contribui para defesa
  const baseHealth = 100; // HP base
  const baseSpeed = hero.dexterity; // Destreza contribui para velocidade
  
  // Bônus de equipamentos (usa diretamente os atributos do equipamento)
  let equipmentAttack = 0;
  let equipmentDefense = 0;
  let equipmentHealth = 0;
  let equipmentDamage = 0;
  
  if (hero.equipment.helmet) {
    equipmentHealth += hero.equipment.helmet.hp || 0;
    equipmentAttack += hero.equipment.helmet.attack || 0;
  }
  
  if (hero.equipment.armor) {
    equipmentHealth += hero.equipment.armor.hp || 0;
    equipmentDefense += hero.equipment.armor.defense || 0;
  }
  
  if (hero.equipment.weapon) {
    equipmentAttack += hero.equipment.weapon.attack || 0;
    equipmentDamage += hero.equipment.weapon.damage || 0;
  }
  
  if (hero.equipment.boots) {
    equipmentHealth += hero.equipment.boots.hp || 0;
    equipmentDefense += hero.equipment.boots.defense || 0;
    equipmentAttack += hero.equipment.boots.attack || 0;
    equipmentDamage += hero.equipment.boots.damage || 0;
  }
  
  if (hero.equipment.shield) {
    equipmentHealth += hero.equipment.shield.hp || 0;
    equipmentDefense += hero.equipment.shield.defense || 0;
    equipmentAttack += hero.equipment.shield.attack || 0;
    equipmentDamage += hero.equipment.shield.damage || 0;
  }
  
  if (hero.equipment.accessory) {
    equipmentHealth += hero.equipment.accessory.hp || 0;
    equipmentDefense += hero.equipment.accessory.defense || 0;
    equipmentAttack += hero.equipment.accessory.attack || 0;
    equipmentDamage += hero.equipment.accessory.damage || 0;
  }
  
  // Aplicar bônus de medalhas (múltiplas podem ser selecionadas)
  let braveryMultiplier = 1.0;
  let dexterityMultiplier = 1.0;
  let troopCapacityMultiplier = 1.0;
  
  // Cícero: +25% Destreza
  if (hero.medals.includes('cicero')) {
    dexterityMultiplier *= 1.25;
  }
  
  // Dentatus: +25% Bravura
  if (hero.medals.includes('dentatus')) {
    braveryMultiplier *= 1.25;
  }
  
  // Leonidas: +25% Bravura
  if (hero.medals.includes('leonidas')) {
    braveryMultiplier *= 1.25;
  }
  
  // Marca de César: +25% Faculdade
  if (hero.medals.includes('marca-cesar')) {
    troopCapacityMultiplier *= 1.25;
  }
  
  // Calcular atributos finais
  const finalAttack = Math.floor(
    (baseAttack * braveryMultiplier) + equipmentAttack + equipmentDamage
  );
  const finalDefense = Math.floor(
    (baseDefense) + equipmentDefense
  );
  const finalHealth = Math.floor(
    baseHealth + equipmentHealth
  );
  const finalSpeed = Math.floor(
    baseSpeed * dexterityMultiplier
  );
  
  // Capacidade de tropas (faculdade) com bônus de medalha
  const baseTroopCapacity = hero.maxTroopCapacity;
  const finalTroopCapacity = Math.floor(
    baseTroopCapacity * troopCapacityMultiplier
  );
  
  return {
    attack: finalAttack,
    defense: finalDefense,
    health: finalHealth,
    speed: finalSpeed,
    totalTroopCapacity: finalTroopCapacity,
  };
}

/**
 * Calcula o total de soldados dos 6 slots
 */
export function calculateTotalSoldiers(distribution: Hero['troopDistribution']): number {
  return (
    distribution.slot1.quantity +
    distribution.slot2.quantity +
    distribution.slot3.quantity +
    distribution.slot4.quantity +
    distribution.slot5.quantity +
    distribution.slot6.quantity
  );
}

/**
 * Calcula os atributos finais de uma unidade/tropa
 * Tropas superiores recebem bônus de equipamentos e acessórios
 * Tropas inferiores usam apenas os status base
 * 
 * Nota: Esta função deve ser chamada com os dados de unitTypes importados
 */
export function calculateUnitFinalStats(
  unit: { baseAttack: number; baseDefense: number; baseHP: number; isSuperior: boolean } | null,
  heroStats: { attack: number; defense: number; health: number }
): { attack: number; defense: number; health: number } {
  if (!unit) {
    return { attack: 0, defense: 0, health: 0 };
  }
  
  if (unit.isSuperior) {
    // Tropas superiores: status base + bônus de equipamentos e acessórios
    return {
      attack: unit.baseAttack + heroStats.attack,
      defense: unit.baseDefense + heroStats.defense,
      health: unit.baseHP + heroStats.health,
    };
  } else {
    // Tropas inferiores: apenas status base
    return {
      attack: unit.baseAttack,
      defense: unit.baseDefense,
      health: unit.baseHP,
    };
  }
}
