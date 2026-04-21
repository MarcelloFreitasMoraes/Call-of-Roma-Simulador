/**
 * Exemplos de formações para teste
 * Baseado no contexto do jogo Call of Roma
 */

import { BattleFormation, Hero } from '@/types/battle';

function createExampleHero(
  id: string,
  name: string,
  bravery: number,
  dexterity: number,
  parry: number,
  soldiers: number,
  frontlineUnit: 'hastatus' | 'principes' | 'equites'
): Hero {
  return {
    id,
    name,
    potential: 5,
    bravery,
    dexterity,
    parry,
    attack: bravery,
    defense: parry,
    health: 100,
    speed: dexterity,
    medals: [],
    equipment: {},
    troopDistribution: {
      slot1: { unitType: frontlineUnit, quantity: soldiers },
      slot2: { unitType: 'none', quantity: 0 },
      slot3: { unitType: 'none', quantity: 0 },
      slot4: { unitType: 'none', quantity: 0 },
      slot5: { unitType: 'none', quantity: 0 },
      slot6: { unitType: 'none', quantity: 0 },
    },
    maxTroopCapacity: Math.max(soldiers, 10000),
    soldiers,
  };
}

export const exampleAttackFormation: BattleFormation = {
  side: 'attack',
  heroes: [
    createExampleHero('1', 'Legionário Marcus', 150, 110, 120, 5000, 'hastatus'),
    createExampleHero('2', 'Centurião Gaius', 180, 100, 140, 3000, 'principes'),
    createExampleHero('3', 'Cavaleiro Lucius', 200, 150, 100, 2000, 'equites'),
  ],
};

export const exampleDefenseFormation: BattleFormation = {
  side: 'defense',
  heroes: [
    createExampleHero('4', 'Guardião Tiberius', 120, 90, 180, 4000, 'hastatus'),
    createExampleHero('5', 'Defensor Publius', 100, 80, 200, 3500, 'principes'),
  ],
};
