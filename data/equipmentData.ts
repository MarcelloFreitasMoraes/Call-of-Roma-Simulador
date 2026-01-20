/**
 * Dados dos equipamentos do Call of Roma
 * Baseado nas informações fornecidas
 */

import { Equipment } from '@/types/battle';

export const equipmentDatabase: Record<string, Equipment> = {
  // Equipamentos de Marte
  'helmet-mars': {
    type: 'helmet',
    name: 'Elmo de Marte',
    hp: 101,
    attack: 52,
    technique: 'CF',
  },
  'armor-mars': {
    type: 'armor',
    name: 'Armadura de Marte',
    hp: 114,
    defense: 65,
    technique: 'AP',
  },
  'weapon-mars': {
    type: 'weapon',
    name: 'Espada de Marte',
    attack: 133,
    damage: 80,
  },
  'boots-mars': {
    type: 'boots',
    name: 'Botas de Marte',
    hp: 32,
    defense: 26,
  },
  'shield-mars': {
    type: 'shield',
    name: 'Escudo de Marte',
    hp: 245,
    defense: 26,
  },
  
  // Equipamentos Brilhantes
  'helmet-brilliant': {
    type: 'helmet',
    name: 'Capacete Brilhante',
    hp: 80,
    attack: 20,
    technique: 'CF',
  },
  'armor-brilliant': {
    type: 'armor',
    name: 'Armadura Brilhante',
    hp: 80,
    defense: 30,
    technique: 'AP',
  },
  'weapon-brilliant': {
    type: 'weapon',
    name: 'Lança Brilhante',
    attack: 65,
    damage: 35,
  },
  'boots-brilliant': {
    type: 'boots',
    name: 'Botas Brilhantes',
    attack: 20,
    damage: 15,
  },
  'shield-brilliant': {
    type: 'shield',
    name: 'Escudo Brilhante',
    hp: 95,
    defense: 40,
  },
  
  // Equipamentos Vulcan
  'helmet-vulcan': {
    type: 'helmet',
    name: 'Capacete Vulcan',
    hp: 78,
    attack: 40,
  },
  'armor-vulcan': {
    type: 'armor',
    name: 'Armadura Vulcan',
    hp: 88,
    defense: 50,
  },
  'weapon-vulcan': {
    type: 'weapon',
    name: 'Espada Vulcan',
    attack: 102,
    damage: 54,
  },
  'boots-vulcan': {
    type: 'boots',
    name: 'Botas Vulcan',
    hp: 25,
    defense: 20,
  },
  'shield-vulcan': {
    type: 'shield',
    name: 'Escudo Vulcan',
    hp: 188,
    defense: 20,
  },
  
  // Equipamentos Espartanos
  'helmet-spartan': {
    type: 'helmet',
    name: 'Chapéu Espartano',
    hp: 131,
    attack: 68,
    technique: 'CF',
  },
  'armor-spartan': {
    type: 'armor',
    name: 'Capa Espartana',
    hp: 148,
    defense: 85,
    technique: 'AP',
  },
  'weapon-spartan': {
    type: 'weapon',
    name: 'Lança Espartana',
    attack: 173,
    damage: 104,
  },
  'boots-spartan': {
    type: 'boots',
    name: 'Caneleiras Espartanas',
    hp: 42,
    defense: 34,
  },
  'shield-spartan': {
    type: 'shield',
    name: 'Escudo Espartano',
    hp: 320,
    defense: 34,
  },
  
  // Equipamentos Lunares
  'helmet-lunar': {
    type: 'helmet',
    name: 'Elmo Lunar',
    hp: 59,
    defense: 20,
  },
  'armor-lunar': {
    type: 'armor',
    name: 'Armadura Lunar',
    hp: 110,
    defense: 20,
    attack: 20,
    damage: 10,
  },
  'weapon-lunar': {
    type: 'weapon',
    name: 'Espada Lunar',
    attack: 20,
    damage: 42,
  },
  'boots-lunar': {
    type: 'boots',
    name: 'Botas Lunar',
    hp: 10,
    defense: 10,
    attack: 20,
    damage: 10,
  },
  'shield-lunar': {
    type: 'shield',
    name: 'Escudo Lunar',
    hp: 60,
    defense: 90,
    attack: 20,
    damage: 10,
  },

  // Conjunto Loki
  'helmet-loki': {
    type: 'helmet',
    name: 'Loki Helmet',
    hp: 356,
    defense: 390,
  },
  'armor-loki': {
    type: 'armor',
    name: 'Loki Armor',
    hp: 450,
    attack: 47,
  },
  'boots-loki': {
    type: 'boots',
    name: 'Loki Boots',
    hp: 230,
    attack: 21,
    defense: 302,
  },
  'bracer-loki': {
    type: 'shield',
    name: 'Loki Bracer',
    hp: 400,
    damage: 48,
  },
  'scepter-loki': {
    type: 'weapon',
    name: 'Loki Scepter',
    attack: 318,
    damage: 230,
  },

  // Conjunto Thor
  'necklace-thor-9': {
    type: 'accessory',
    name: 'Thor Necklace+9',
    hp: 85,
    defense: 66,
  },
  'ring-thor-9': {
    type: 'accessory',
    name: 'Thor Ring+9',
    hp: 103,
    damage: 65,
  },
  'belt-thor-9': {
    type: 'accessory',
    name: 'Thor Belt+9',
    hp: 64,
    defense: 66,
  },
  'pendant-thor-9': {
    type: 'accessory',
    name: 'Thor Pendant+9',
    hp: 108,
    defense: 41,
  },

  // Conjunto Neptunus
  'helmet-neptunus': {
    type: 'helmet',
    name: 'Neptunus Helmet',
    hp: 292,
    defense: 394,
  },
  'armor-neptunus': {
    type: 'armor',
    name: 'Neptunus Armor',
    hp: 398,
    attack: 56,
  },
  'boots-neptunus': {
    type: 'boots',
    name: 'Neptunus Boots',
    hp: 200,
    attack: 29,
    defense: 271,
  },
  'shield-neptunus': {
    type: 'shield',
    name: 'Neptunus Shield',
    hp: 342,
    damage: 57,
  },
  'trident-neptunus': {
    type: 'weapon',
    name: 'Neptunus Trident',
    attack: 281,
    damage: 234,
  },
  
  // Nenhum equipamento
  'none': {
    type: 'none',
    name: 'Nenhum',
  },
};

/**
 * Lista de equipamentos por tipo
 */
export const equipmentByType = {
  helmet: Object.entries(equipmentDatabase)
    .filter(([_, eq]) => eq.type === 'helmet')
    .map(([key, eq]) => ({ key, ...eq })),
  armor: Object.entries(equipmentDatabase)
    .filter(([_, eq]) => eq.type === 'armor')
    .map(([key, eq]) => ({ key, ...eq })),
  weapon: Object.entries(equipmentDatabase)
    .filter(([_, eq]) => eq.type === 'weapon')
    .map(([key, eq]) => ({ key, ...eq })),
  boots: Object.entries(equipmentDatabase)
    .filter(([_, eq]) => eq.type === 'boots')
    .map(([key, eq]) => ({ key, ...eq })),
  shield: Object.entries(equipmentDatabase)
    .filter(([_, eq]) => eq.type === 'shield')
    .map(([key, eq]) => ({ key, ...eq })),
  accessory: Object.entries(equipmentDatabase)
    .filter(([_, eq]) => eq.type === 'accessory')
    .map(([key, eq]) => ({ key, ...eq })),
};

/**
 * Medalhas disponíveis
 */
export const medals = [
  { value: 'none', label: 'Nenhuma' },
  { value: 'cicero', label: 'Cícero' },
  { value: 'dentatus', label: 'Dentatus' },
  { value: 'leonidas', label: 'Leonidas' },
  { value: 'marca-cesar', label: 'Marca de César' },
] as const;
