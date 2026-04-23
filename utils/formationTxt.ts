/**
 * Importação/exportação de formações em texto customizado (chave=valor).
 * Formato: cabeçalho side=attack|defense, blocos ---hero--- com pares chave=valor.
 */

import type { BattleFormation, Equipment, Hero, HeroPotential, MedalType, UnitType } from '@/types/battle';
import { equipmentDatabase } from '@/data/equipmentData';
import { calculateHeroFinalStats, calculateTotalSoldiers } from '@/utils/heroCalculator';

export interface FormationTxtError {
  line: number;
  message: string;
}

const HERO_SEPARATOR = '---hero---';

const UNIT_ALIASES: Record<string, UnitType> = {
  hastatus: 'hastatus',
  principes: 'principes',
  equites: 'equites',
  sagittarii: 'sagittarii',
  sagittarius: 'sagittarii',
  ballistae: 'ballistae',
  onagers: 'onagers',
  onager: 'onagers',
  none: 'none',
};

const EQUIPMENT_SLOTS = [
  'helmet',
  'armor',
  'weapon',
  'boots',
  'shield',
  'accessory',
  'mount',
  'ring',
  'necklace',
  'belt',
] as const;

type EquipmentSlotKey = (typeof EQUIPMENT_SLOTS)[number];

const MEDAL_SET = new Set<MedalType>(['cicero', 'dentatus', 'leonidas', 'marca-cesar']);

function splitKeyValue(line: string): { key: string; value: string } | null {
  const idx = line.indexOf('=');
  if (idx <= 0) return null;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  if (!key) return null;
  return { key, value };
}

function normalizeUnitType(raw: string): UnitType | null {
  const k = raw.trim().toLowerCase();
  return UNIT_ALIASES[k] ?? null;
}

function parseIntSafe(v: string, field: string, line: number): { ok: true; n: number } | { ok: false; err: FormationTxtError } {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) {
    return { ok: false, err: { line, message: `${field}: número inválido "${v}"` } };
  }
  return { ok: true, n };
}

function parsePotential(v: string, line: number): { ok: true; p: HeroPotential } | { ok: false; err: FormationTxtError } {
  const r = parseIntSafe(v, 'potential', line);
  if (!r.ok) return r;
  if (r.n < 3 || r.n > 8) {
    return { ok: false, err: { line, message: `potential deve estar entre 3 e 8, recebido: ${r.n}` } };
  }
  return { ok: true, p: r.n as HeroPotential };
}

function finalizeHero(hero: Hero): Hero {
  const finalStats = calculateHeroFinalStats(hero);
  const totalSoldiers = calculateTotalSoldiers(hero.troopDistribution);
  return {
    ...hero,
    attack: finalStats.attack,
    defense: finalStats.defense,
    health: finalStats.health,
    speed: finalStats.speed,
    totalTroops: totalSoldiers,
    soldiers: totalSoldiers,
  };
}

function emptyTroopDistribution(): Hero['troopDistribution'] {
  return {
    slot1: { unitType: 'none', quantity: 0 },
    slot2: { unitType: 'none', quantity: 0 },
    slot3: { unitType: 'none', quantity: 0 },
    slot4: { unitType: 'none', quantity: 0 },
    slot5: { unitType: 'none', quantity: 0 },
    slot6: { unitType: 'none', quantity: 0 },
  };
}

function parseMedalsLine(value: string, line: number): { ok: true; medals: MedalType[] } | { ok: false; err: FormationTxtError } {
  if (!value.trim()) return { ok: true, medals: [] };
  const parts = value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const medals: MedalType[] = [];
  for (const p of parts) {
    if (!MEDAL_SET.has(p as MedalType)) {
      return {
        ok: false,
        err: { line, message: `medalha inválida "${p}". Use: cicero, dentatus, leonidas, marca-cesar` },
      };
    }
    medals.push(p as MedalType);
  }
  return { ok: true, medals };
}

function parseEquipmentKey(key: string): EquipmentSlotKey | null {
  const prefix = 'equipment.';
  if (!key.startsWith(prefix)) return null;
  const slot = key.slice(prefix.length) as EquipmentSlotKey;
  if (!EQUIPMENT_SLOTS.includes(slot)) return null;
  return slot;
}

function resolveEquipmentKey(raw: string, line: number): { ok: true; key: string | null } | { ok: false; err: FormationTxtError } {
  const v = raw.trim();
  if (!v || v.toLowerCase() === 'none') return { ok: true, key: null };
  if (equipmentDatabase[v]) return { ok: true, key: v };
  const byName = Object.keys(equipmentDatabase).find((k) => equipmentDatabase[k].name === v);
  if (byName) return { ok: true, key: byName };
  return { ok: false, err: { line, message: `equipamento desconhecido: "${raw}"` } };
}

type DraftHero = {
  id?: string;
  name?: string;
  potential?: number;
  bravery?: number;
  dexterity?: number;
  parry?: number;
  totalTroops?: number;
  legacyMaxTroopCapacity?: number;
  medals: MedalType[];
  equipment: Hero['equipment'];
  troopDistribution: Hero['troopDistribution'];
};

function newDraft(): DraftHero {
  return {
    medals: [],
    equipment: {},
    troopDistribution: emptyTroopDistribution(),
  };
}

function applySlotLine(
  draft: DraftHero,
  key: string,
  value: string,
  line: number
): FormationTxtError | null {
  const m = key.match(/^slot([1-6])\.(unitType|quantity)$/);
  if (!m) return { line, message: `chave de slot inválida: ${key}` };
  const slotKey = `slot${m[1]}` as keyof Hero['troopDistribution'];
  const field = m[2];

  if (field === 'unitType') {
    const ut = normalizeUnitType(value);
    if (!ut) {
      return { line, message: `slot${m[1]}.unitType inválido: "${value}"` };
    }
    draft.troopDistribution[slotKey] = {
      ...draft.troopDistribution[slotKey],
      unitType: ut,
    };
    return null;
  }

  const qty = parseIntSafe(value, `slot${m[1]}.quantity`, line);
  if (!qty.ok) return qty.err;
  if (qty.n < 0) {
    return { line, message: `slot${m[1]}.quantity não pode ser negativo` };
  }
  draft.troopDistribution[slotKey] = {
    ...draft.troopDistribution[slotKey],
    quantity: qty.n,
  };
  return null;
}

function draftToHero(draft: DraftHero, heroIndex: number, errors: FormationTxtError[]): Hero | null {
  const id = draft.id?.trim() || `import-${Date.now()}-${heroIndex}`;
  if (!draft.name?.trim()) {
    errors.push({ line: 0, message: `Herói #${heroIndex + 1}: falta "name"` });
    return null;
  }
  if (draft.potential === undefined) {
    errors.push({ line: 0, message: `Herói "${draft.name}": falta "potential"` });
    return null;
  }
  if (draft.bravery === undefined) {
    errors.push({ line: 0, message: `Herói "${draft.name}": falta "bravery"` });
    return null;
  }
  if (draft.dexterity === undefined) {
    errors.push({ line: 0, message: `Herói "${draft.name}": falta "dexterity"` });
    return null;
  }
  if (draft.parry === undefined) {
    errors.push({ line: 0, message: `Herói "${draft.name}": falta "parry"` });
    return null;
  }
  if (draft.potential < 3 || draft.potential > 8) {
    errors.push({ line: 0, message: `Herói "${draft.name}": potential fora do intervalo 3-8` });
    return null;
  }

  const totalTroops = calculateTotalSoldiers(draft.troopDistribution);
  const importedTotalTroops = draft.totalTroops ?? draft.legacyMaxTroopCapacity ?? totalTroops;

  const hero: Hero = {
    id,
    name: draft.name.trim(),
    potential: draft.potential as HeroPotential,
    bravery: draft.bravery,
    dexterity: draft.dexterity,
    parry: draft.parry,
    attack: 0,
    defense: 0,
    health: 0,
    speed: 0,
    medals: draft.medals,
    equipment: { ...draft.equipment },
    troopDistribution: draft.troopDistribution,
    totalTroops: importedTotalTroops,
    soldiers: 0,
  };

  return finalizeHero(hero);
}

/**
 * Parseia texto completo. `expectedSide` deve bater com side= do arquivo.
 */
export function parseFormationTxt(
  text: string,
  expectedSide: 'attack' | 'defense'
): { ok: true; heroes: Hero[] } | { ok: false; errors: FormationTxtError[] } {
  const raw = text.replace(/^\uFEFF/, '');
  const errors: FormationTxtError[] = [];
  let declaredSide: 'attack' | 'defense' | null = null;

  const parts = raw.split(new RegExp(`^${HERO_SEPARATOR}\\s*$`, 'm')).map((p) => p.trim());

  if (parts.length === 0) {
    return { ok: false, errors: [{ line: 1, message: 'Arquivo vazio' }] };
  }

  const headerBlock = parts[0];
  const heroBlocks = parts.slice(1);

  if (heroBlocks.length === 0) {
    return {
      ok: false,
      errors: [{ line: 1, message: `Falta pelo menos um bloco "${HERO_SEPARATOR}" com dados de herói` }],
    };
  }

  const headerLines = headerBlock.split(/\r?\n/);
  for (let i = 0; i < headerLines.length; i++) {
    const lineNum = i + 1;
    const line = headerLines[i].trim();
    if (!line || line.startsWith('#')) continue;
    const kv = splitKeyValue(line);
    if (!kv) {
      errors.push({ line: lineNum, message: `Linha inválida (esperado chave=valor): ${line}` });
      continue;
    }
    if (kv.key === 'side') {
      const s = kv.value.toLowerCase();
      if (s !== 'attack' && s !== 'defense') {
        errors.push({ line: lineNum, message: `side deve ser attack ou defense, recebido: ${kv.value}` });
      } else {
        declaredSide = s;
      }
    } else {
      errors.push({ line: lineNum, message: `No cabeçalho só é permitido side=... (linha: ${kv.key})` });
    }
  }

  if (!declaredSide) {
    errors.push({ line: 1, message: 'Cabeçalho deve conter side=attack ou side=defense' });
  } else if (declaredSide !== expectedSide) {
    errors.push({
      line: 1,
      message: `O arquivo declara side=${declaredSide}, mas você está importando na formação de ${expectedSide}`,
    });
  }

  const heroes: Hero[] = [];
  /** Número da linha física (1-based) da primeira linha do bloco de herói atual */
  let nextPhysicalLine = headerLines.length + 2;

  for (let b = 0; b < heroBlocks.length; b++) {
    const block = heroBlocks[b];
    const blockLines = block.split(/\r?\n/);
    const draft = newDraft();

    for (let i = 0; i < blockLines.length; i++) {
      const lineNum = nextPhysicalLine + i;
      const rawLine = blockLines[i];
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      const kv = splitKeyValue(line);
      if (!kv) {
        errors.push({ line: lineNum, message: `Linha inválida: ${rawLine}` });
        continue;
      }

      const { key, value } = kv;

      if (key === 'id') {
        draft.id = value;
        continue;
      }
      if (key === 'name') {
        draft.name = value;
        continue;
      }
      if (key === 'potential') {
        const p = parsePotential(value, lineNum);
        if (!p.ok) errors.push(p.err);
        else draft.potential = p.p;
        continue;
      }
      if (key === 'bravery') {
        const n = parseIntSafe(value, 'bravery', lineNum);
        if (!n.ok) errors.push(n.err);
        else draft.bravery = n.n;
        continue;
      }
      if (key === 'dexterity') {
        const n = parseIntSafe(value, 'dexterity', lineNum);
        if (!n.ok) errors.push(n.err);
        else draft.dexterity = n.n;
        continue;
      }
      if (key === 'parry') {
        const n = parseIntSafe(value, 'parry', lineNum);
        if (!n.ok) errors.push(n.err);
        else draft.parry = n.n;
        continue;
      }
      if (key === 'totalTroops') {
        const n = parseIntSafe(value, 'totalTroops', lineNum);
        if (!n.ok) errors.push(n.err);
        else if (n.n < 0) errors.push({ line: lineNum, message: 'totalTroops não pode ser negativo' });
        else draft.totalTroops = n.n;
        continue;
      }
      if (key === 'maxTroopCapacity') {
        const n = parseIntSafe(value, 'maxTroopCapacity', lineNum);
        if (!n.ok) errors.push(n.err);
        else if (n.n < 0) errors.push({ line: lineNum, message: 'maxTroopCapacity não pode ser negativo' });
        else draft.legacyMaxTroopCapacity = n.n;
        continue;
      }
      if (key === 'medals') {
        const m = parseMedalsLine(value, lineNum);
        if (!m.ok) errors.push(m.err);
        else draft.medals = m.medals;
        continue;
      }

      const eqSlot = parseEquipmentKey(key);
      if (eqSlot) {
        const resolved = resolveEquipmentKey(value, lineNum);
        if (!resolved.ok) errors.push(resolved.err);
        else if (resolved.key === null) {
          delete draft.equipment[eqSlot];
        } else {
          draft.equipment[eqSlot] = equipmentDatabase[resolved.key];
        }
        continue;
      }

      if (/^slot[1-6]\./.test(key)) {
        const err = applySlotLine(draft, key, value, lineNum);
        if (err) errors.push(err);
        continue;
      }

      errors.push({ line: lineNum, message: `Chave desconhecida: ${key}` });
    }

    nextPhysicalLine += blockLines.length + 1;

    const hero = draftToHero(draft, heroes.length, errors);
    if (hero) heroes.push(hero);
  }

  if (heroes.length === 0) {
    errors.push({ line: 0, message: 'Nenhum herói válido foi encontrado após a validação' });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, heroes };
}

function escapeValue(s: string): string {
  if (/[\r\n=#]/.test(s)) return JSON.stringify(s);
  return s;
}

function equipmentToDatabaseKey(eq: Equipment | undefined): string {
  if (!eq) return 'none';
  const byRef = Object.keys(equipmentDatabase).find((k) => equipmentDatabase[k] === eq);
  if (byRef) return byRef;
  const byMatch = Object.keys(equipmentDatabase).find((k) => {
    const db = equipmentDatabase[k];
    return db.type === eq.type && db.name === eq.name;
  });
  return byMatch ?? 'none';
}

/**
 * Serializa formação atual (sem comentários longos).
 */
export function serializeFormationTxt(formation: BattleFormation): string {
  const lines: string[] = [
    '# Call of Roma - formação em texto (importação)',
    `# Edite e reimporte. Separador de heróis: ${HERO_SEPARATOR}`,
    `side=${formation.side}`,
    '',
  ];

  for (const hero of formation.heroes) {
    lines.push(HERO_SEPARATOR);
    lines.push(`id=${escapeValue(hero.id)}`);
    lines.push(`name=${escapeValue(hero.name)}`);
    lines.push(`potential=${hero.potential}`);
    lines.push(`bravery=${hero.bravery}`);
    lines.push(`dexterity=${hero.dexterity}`);
    lines.push(`parry=${hero.parry}`);
    lines.push(`totalTroops=${calculateTotalSoldiers(hero.troopDistribution)}`);
    lines.push(`medals=${hero.medals.join(',')}`);

    for (let s = 1; s <= 6; s++) {
      const slotKey = `slot${s}` as keyof Hero['troopDistribution'];
      const slot = hero.troopDistribution[slotKey];
      lines.push(`${slotKey}.unitType=${slot.unitType}`);
      lines.push(`${slotKey}.quantity=${slot.quantity}`);
    }

    for (const slot of EQUIPMENT_SLOTS) {
      const eq = hero.equipment[slot];
      lines.push(`equipment.${slot}=${equipmentToDatabaseKey(eq)}`);
    }

    lines.push('');
  }

  return lines.join('\n').trimEnd() + '\n';
}

/**
 * Modelo vazio com um herói exemplo para preenchimento.
 */
export function generateFormationTemplate(side: 'attack' | 'defense'): string {
  const example = side === 'attack' ? 'Herói Ataque 1' : 'Herói Defesa 1';
  const lines = [
    '# Modelo de formação - preencha os valores e importe',
    `side=${side}`,
    '',
    HERO_SEPARATOR,
    'id=1',
    `name=${example}`,
    'potential=8',
    'bravery=100',
    'dexterity=100',
    'parry=100',
    '# totalTroops será recalculado automaticamente pela soma dos slots',
    'totalTroops=1000',
    '# medals separadas por vírgula: cicero,dentatus,leonidas,marca-cesar',
    'medals=',
    '# Slots 1-3: hastatus | principes | equites | none',
    '# Slots 4-6: sagittarii | ballistae | onagers | none',
    'slot1.unitType=hastatus',
    'slot1.quantity=1000',
    'slot2.unitType=none',
    'slot2.quantity=0',
    'slot3.unitType=none',
    'slot3.quantity=0',
    'slot4.unitType=none',
    'slot4.quantity=0',
    'slot5.unitType=none',
    'slot5.quantity=0',
    'slot6.unitType=none',
    'slot6.quantity=0',
    '# Padrão: conjunto Loki + acessórios Thor +9 (chaves equipmentDatabase)',
    'equipment.helmet=helmet-loki',
    'equipment.armor=armor-loki',
    'equipment.weapon=scepter-loki',
    'equipment.boots=boots-loki',
    'equipment.shield=bracer-loki',
    'equipment.accessory=pendant-thor-9',
    'equipment.mount=steed-thor-9',
    'equipment.ring=ring-thor-9',
    'equipment.necklace=necklace-thor-9',
    'equipment.belt=belt-thor-9',
    '',
    '# Copie o bloco acima para adicionar mais heróis (outro ---hero---)',
  ];
  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
