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
      type: 'necklace',
    name: 'Thor Necklace+9',
    hp: 85,
    defense: 66,
  },
  'ring-thor-9': {
      type: 'ring',
    name: 'Thor Ring+9',
    hp: 103,
    damage: 65,
  },
  'belt-thor-9': {
      type: 'belt',
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
    'steed-thor-9': {
        type: 'mount',
        name: 'Thor Steed+9',
        damage: 35,
        attack: 38,
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
        .filter(([, eq]) => eq.type === 'helmet')
    .map(([key, eq]) => ({ key, ...eq })),
  armor: Object.entries(equipmentDatabase)
      .filter(([, eq]) => eq.type === 'armor')
    .map(([key, eq]) => ({ key, ...eq })),
  weapon: Object.entries(equipmentDatabase)
      .filter(([, eq]) => eq.type === 'weapon')
    .map(([key, eq]) => ({ key, ...eq })),
  boots: Object.entries(equipmentDatabase)
      .filter(([, eq]) => eq.type === 'boots')
    .map(([key, eq]) => ({ key, ...eq })),
  shield: Object.entries(equipmentDatabase)
      .filter(([, eq]) => eq.type === 'shield')
    .map(([key, eq]) => ({ key, ...eq })),
  accessory: Object.entries(equipmentDatabase)
        .filter(([, eq]) => eq.type === 'accessory')
        .map(([key, eq]) => ({ key, ...eq })),
    mount: Object.entries(equipmentDatabase)
        .filter(([, eq]) => eq.type === 'mount')
        .map(([key, eq]) => ({ key, ...eq })),
    ring: Object.entries(equipmentDatabase)
        .filter(([, eq]) => eq.type === 'ring')
        .map(([key, eq]) => ({ key, ...eq })),
    necklace: Object.entries(equipmentDatabase)
        .filter(([, eq]) => eq.type === 'necklace')
        .map(([key, eq]) => ({ key, ...eq })),
    belt: Object.entries(equipmentDatabase)
        .filter(([, eq]) => eq.type === 'belt')
        .map(([key, eq]) => ({ key, ...eq })),
};

/**
 * Identifica o conjunto de um equipamento pela chave
 */
export function getEquipmentSet(key: string): string | null {
    if (key === 'none') return null;

    // Remove prefixos de tipo e sufixos numéricos
    const parts = key.split('-');
    if (parts.length < 2) return null;

    // Remove o primeiro elemento (tipo: helmet, armor, etc)
    const setParts = parts.slice(1);

    // Remove sufixos numéricos como "-9"
    const setKey = setParts.join('-').replace(/-\d+$/, '');

    return setKey || null;
}

/**
 * Mapeamento de conjuntos para seus equipamentos completos
 */
export const equipmentSets: Record<string, {
    name: string;
    equipment: {
        helmet?: string;
        armor?: string;
        weapon?: string;
        boots?: string;
        shield?: string;
        accessory?: string;
        mount?: string;
        ring?: string;
        necklace?: string;
        belt?: string;
    };
}> = {
    'mars': {
        name: 'Marte',
        equipment: {
            helmet: 'helmet-mars',
            armor: 'armor-mars',
            weapon: 'weapon-mars',
            boots: 'boots-mars',
            shield: 'shield-mars',
        },
    },
    'brilliant': {
        name: 'Brilhante',
        equipment: {
            helmet: 'helmet-brilliant',
            armor: 'armor-brilliant',
            weapon: 'weapon-brilliant',
            boots: 'boots-brilliant',
            shield: 'shield-brilliant',
        },
    },
    'vulcan': {
        name: 'Vulcan',
        equipment: {
            helmet: 'helmet-vulcan',
            armor: 'armor-vulcan',
            weapon: 'weapon-vulcan',
            boots: 'boots-vulcan',
            shield: 'shield-vulcan',
        },
    },
    'spartan': {
        name: 'Espartano',
        equipment: {
            helmet: 'helmet-spartan',
            armor: 'armor-spartan',
            weapon: 'weapon-spartan',
            boots: 'boots-spartan',
            shield: 'shield-spartan',
        },
    },
    'lunar': {
        name: 'Lunar',
        equipment: {
            helmet: 'helmet-lunar',
            armor: 'armor-lunar',
            weapon: 'weapon-lunar',
            boots: 'boots-lunar',
            shield: 'shield-lunar',
        },
    },
    'loki': {
        name: 'Loki',
        equipment: {
            helmet: 'helmet-loki',
            armor: 'armor-loki',
            weapon: 'scepter-loki',
            boots: 'boots-loki',
            shield: 'bracer-loki',
        },
    },
    'thor': {
        name: 'Thor',
        equipment: {
            accessory: 'pendant-thor-9',
            mount: 'steed-thor-9',
            ring: 'ring-thor-9',
            necklace: 'necklace-thor-9',
            belt: 'belt-thor-9',
        },
    },
    'neptunus': {
        name: 'Neptunus',
        equipment: {
            helmet: 'helmet-neptunus',
            armor: 'armor-neptunus',
            weapon: 'trident-neptunus',
            boots: 'boots-neptunus',
            shield: 'shield-neptunus',
        },
    },
};

/**
 * Conjuntos de equipamentos (não incluem acessórios)
 */
export const equipmentOnlySets: Record<string, {
    name: string;
    equipment: {
        helmet?: string;
        armor?: string;
        weapon?: string;
        boots?: string;
        shield?: string;
    };
}> = {
    'mars': equipmentSets.mars,
    'brilliant': equipmentSets.brilliant,
    'vulcan': equipmentSets.vulcan,
    'spartan': equipmentSets.spartan,
    'lunar': equipmentSets.lunar,
    'loki': equipmentSets.loki,
    'neptunus': equipmentSets.neptunus,
};

/**
 * Conjuntos de acessórios apenas
 */
export const accessoryOnlySets: Record<string, {
    name: string;
    equipment: {
        accessory?: string;
        mount?: string;
        ring?: string;
        necklace?: string;
        belt?: string;
    };
}> = {
    'thor': equipmentSets.thor,
};

/**
 * Lista de conjuntos de equipamentos para o select master
 */
export const availableEquipmentSets = Object.entries(equipmentOnlySets).map(([key, set]) => ({
    value: key,
    label: set.name,
}));

/**
 * Lista de conjuntos de acessórios para o select master
 */
export const availableAccessorySets = Object.entries(accessoryOnlySets).map(([key, set]) => ({
    value: key,
    label: set.name,
}));

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
