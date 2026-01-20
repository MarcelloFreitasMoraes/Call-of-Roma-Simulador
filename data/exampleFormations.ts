/**
 * Exemplos de formações para teste
 * Baseado no contexto do jogo Call of Roma
 */

import { BattleFormation } from '@/types/battle';

export const exampleAttackFormation: BattleFormation = {
  side: 'attack',
  heroes: [
    {
      id: '1',
      name: 'Legionário Marcus',
      attack: 150,
      defense: 120,
      health: 2000,
      speed: 110,
      soldiers: 5000,
    },
    {
      id: '2',
      name: 'Centurião Gaius',
      attack: 180,
      defense: 140,
      health: 2500,
      speed: 100,
      soldiers: 3000,
    },
    {
      id: '3',
      name: 'Cavaleiro Lucius',
      attack: 200,
      defense: 100,
      health: 1800,
      speed: 150,
      soldiers: 2000,
    },
  ],
};

export const exampleDefenseFormation: BattleFormation = {
  side: 'defense',
  heroes: [
    {
      id: '4',
      name: 'Guardião Tiberius',
      attack: 120,
      defense: 180,
      health: 3000,
      speed: 90,
      soldiers: 4000,
    },
    {
      id: '5',
      name: 'Defensor Publius',
      attack: 100,
      defense: 200,
      health: 3500,
      speed: 80,
      soldiers: 3500,
    },
  ],
};
