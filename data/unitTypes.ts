/**
 * Tipos de unidades/tropas do Call of Roma
 * Baseado nas informações do jogo
 */

import { UnitType } from '@/types/battle';

export interface UnitData {
  name: string;
  type: UnitType;
  baseDamage: { min: number; max: number };
  baseAttack: number;
  baseHP: number;
  baseDefense: number;
  food: number;
  speed: number;
  load: number;
  faculty: number; // Capacidade de faculdade por unidade
  isSuperior: boolean; // true para tropas superiores, false para inferiores
}

export const unitTypes: Record<UnitType, UnitData> = {
  // Tropas Superiores (status base são somados com equipamentos e acessórios)
  hastatus: {
    name: 'Hastatus',
    type: 'hastatus',
    baseDamage: { min: 3, max: 6 },
    baseAttack: 8,
    baseHP: 60,
    baseDefense: 8,
    food: 4,
    speed: 300,
    load: 40,
    faculty: 1,
    isSuperior: true,
  },
  principes: {
    name: 'Principes',
    type: 'principes',
    baseDamage: { min: 40, max: 60 },
    baseAttack: 19,
    baseHP: 400,
    baseDefense: 16,
    food: 36,
    speed: 600,
    load: 6,
    faculty: 6,
    isSuperior: true,
  },
  equites: {
    name: 'Equites',
    type: 'equites',
    baseDamage: { min: 20, max: 25 },
    baseAttack: 16,
    baseHP: 250,
    baseDefense: 16,
    food: 18,
    speed: 900,
    load: 3,
    faculty: 3,
    isSuperior: true,
  },
  
  // Tropas Inferiores (não recebem bônus de equipamentos)
  sagittarii: {
    name: 'Sagittarius',
    type: 'sagittarii',
    baseDamage: { min: 3, max: 5 },
    baseAttack: 9,
    baseHP: 45,
    baseDefense: 5,
    food: 5,
    speed: 250,
    load: 1,
    faculty: 1,
    isSuperior: false,
  },
  ballistae: {
    name: 'Ballistae',
    type: 'ballistae',
    baseDamage: { min: 12, max: 15 },
    baseAttack: 15,
    baseHP: 100,
    baseDefense: 12,
    food: 20,
    speed: 150,
    load: 4,
    faculty: 4,
    isSuperior: false,
  },
  onagers: {
    name: 'Onagers',
    type: 'onagers',
    baseDamage: { min: 50, max: 50 },
    baseAttack: 32,
    baseHP: 600,
    baseDefense: 13,
    food: 150,
    speed: 100,
    load: 8,
    faculty: 8,
    isSuperior: false,
  },
  
  none: {
    name: 'Nenhum',
    type: 'none',
    baseDamage: { min: 0, max: 0 },
    baseAttack: 0,
    baseHP: 0,
    baseDefense: 0,
    food: 0,
    speed: 0,
    load: 0,
    faculty: 0,
    isSuperior: false,
  },
};

export const unitTypeList = Object.values(unitTypes).filter(u => u.type !== 'none');

// Lista de tropas superiores (para slots 1, 2, 3)
export const superiorUnits = unitTypeList.filter(u => u.isSuperior);

// Lista de tropas inferiores (para slots 4, 5, 6)
export const inferiorUnits = unitTypeList.filter(u => !u.isSuperior);
