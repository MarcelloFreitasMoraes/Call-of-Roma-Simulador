/**
 * Tipos e interfaces para o sistema de batalhas do Call of Roma
 * Baseado no paper: Coevolutionary Procedural Generation of Battle Formations
 * SBGames 2014 - André Siqueira Ruela
 */

// Potencial do herói (3 a 8)
export type HeroPotential = 3 | 4 | 5 | 6 | 7 | 8;

// Tipos de medalhas (podem ser múltiplas)
export type MedalType = 'cicero' | 'dentatus' | 'leonidas' | 'marca-cesar';

// Tipos de unidades/tropas
// Tropas Superiores: hastatus, principes, equites
// Tropas Inferiores: sagittarii, ballistae, onagers
export type UnitType = 
  | 'hastatus' | 'principes' | 'equites' // Tropas superiores
  | 'sagittarii' | 'ballistae' | 'onagers' // Tropas inferiores
  | 'none';

// Tipos de equipamentos
export type EquipmentType = 
  | 'helmet' | 'armor' | 'weapon' | 'boots' | 'shield'
  | 'accessory' | 'mount' | 'ring' | 'necklace' | 'belt' // Acessórios separados
  | 'none';

// Equipamento com seus atributos
export interface Equipment {
  type: EquipmentType;
  name: string;
  // Atributos que o equipamento fornece
  hp?: number;
  attack?: number; // Ofensiva
  defense?: number; // Defesa
  damage?: number; // Dano
  technique?: string; // Técnica (CF, AP, etc)
}

// Slot de tropa com tipo e quantidade
export interface TroopSlot {
  unitType: UnitType; // Tipo de unidade
  quantity: number; // Quantidade de tropas
}

// Distribuição de tropas em 6 slots (3 superiores e 3 inferiores)
export interface TroopDistribution {
  slot1: TroopSlot; // Slot superior esquerdo
  slot2: TroopSlot; // Slot superior meio
  slot3: TroopSlot; // Slot superior direito
  slot4: TroopSlot; // Slot inferior esquerdo
  slot5: TroopSlot; // Slot inferior meio
  slot6: TroopSlot; // Slot inferior direito
}

export interface Hero {
  id: string;
  name: string;
  
  // Potencial do herói (3 a 8)
  potential: HeroPotential;
  
  // Atributos base do herói
  bravery: number; // Bravura
  dexterity: number; // Destreza
  parry: number; // Bloqueio
  
  // Características calculadas (derivadas dos atributos + equipamentos + medalhas)
  attack: number; // Ataque (Ofensiva)
  defense: number; // Defesa
  health: number; // Vida/HP
  speed: number; // Velocidade
  
  // Medalhas (múltiplas podem ser selecionadas)
  medals: MedalType[];
  
  // Equipamentos
  equipment: {
    helmet?: Equipment;
    armor?: Equipment;
    weapon?: Equipment;
    boots?: Equipment;
    shield?: Equipment;
    // Acessórios separados
    accessory?: Equipment; // Acessório genérico
    mount?: Equipment; // Montaria
    ring?: Equipment; // Anel
    necklace?: Equipment; // Colar
    belt?: Equipment; // Cinto
  };
  
  // Distribuição de tropas em 6 slots
  troopDistribution: TroopDistribution;
  
  // Total de tropas (soma dos 6 slots)
  totalTroops: number;
  
  // Soldados totais (soma dos 6 slots)
  soldiers: number;
  
  // Habilidades (podem ser expandidos)
  skills?: string[];
}

export interface BattleFormation {
  heroes: Hero[];
  side: 'attack' | 'defense';
}

export interface BattleResult {
  winner: 'attack' | 'defense' | 'draw';
  attackRemainingSoldiers: number;
  defenseRemainingSoldiers: number;
  attackRemainingHeroes: number;
  defenseRemainingHeroes: number;
  // As 5 medidas de performance mencionadas no paper
  performanceMetrics: {
    // 1. Victory Point (1 em vitória, 0 caso contrário)
    victoryPoint: number;
    // 2. Offensiveness: soldados abatidos / soldados iniciais
    offensiveness: number;
    // 3. Defensiveness: soldados restantes / soldados iniciais
    defensiveness: number;
    // 4. Usage: fração de heróis não utilizados na batalha
    usage: number;
    // 5. Participation: abatidos / média de soldados iniciais por herói inimigo
    participation: number;
  };
  rounds: number;
  details: BattleRound[];
}

export interface BattleSlotRoundDetail {
  slotIndex: number;
  unitType: UnitType;
  before: number;
  after: number;
  losses: number;
}

export interface BattleHeroRoundDetail {
  side: 'attack' | 'defense';
  position: number;
  heroId: string;
  heroName: string;
  enteredFromQueue: boolean;
  soldiersBefore: number;
  soldiersAfter: number;
  losses: number;
  defeated: boolean;
  slots: BattleSlotRoundDetail[];
}

export interface BattleRoundReplacementEvent {
  side: 'attack' | 'defense';
  position: number;
  replacedHeroId?: string;
  replacedHeroName?: string;
  enteredHeroId: string;
  enteredHeroName: string;
}

export interface BattleRoundMatchup {
  position: number;
  attackHeroId?: string;
  attackHeroName?: string;
  defenseHeroId?: string;
  defenseHeroName?: string;
  attackDamage: number;
  defenseDamage: number;
}

export interface BattleRound {
  round: number;
  attackSoldiersBefore: number;
  defenseSoldiersBefore: number;
  attackSoldiersAfter: number;
  defenseSoldiersAfter: number;
  damageDealt: {
    attack: number;
    defense: number;
  };
  matchups: BattleRoundMatchup[];
  attackHeroes: BattleHeroRoundDetail[];
  defenseHeroes: BattleHeroRoundDetail[];
  replacements: BattleRoundReplacementEvent[];
}

export interface FormationStats {
  totalSoldiers: number;
  totalAttack: number;
  totalDefense: number;
  totalHealth: number;
  averageSpeed: number;
  heroCount: number;
}
