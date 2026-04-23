'use client';
import { Hero, HeroPotential, MedalType, UnitType } from '@/types/battle';
import { useState } from 'react';
import { equipmentByType, equipmentDatabase, equipmentOnlySets, accessoryOnlySets, availableEquipmentSets, availableAccessorySets } from '@/data/equipmentData';
import { superiorUnits, inferiorUnits } from '@/data/unitTypes';
import { calculateHeroFinalStats, calculateTotalSoldiers } from '@/utils/heroCalculator';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const selectFieldClass = cn(
  'w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm text-foreground shadow-sm outline-none',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50'
);

interface HeroFormProps {
  hero: Hero;
  onUpdate: (hero: Hero) => void;
  onRemove?: () => void;
  showRemove?: boolean;
}

const medalOptions: { value: MedalType; label: string }[] = [
  { value: 'cicero', label: 'Cícero' },
  { value: 'dentatus', label: 'Dentatus' },
  { value: 'leonidas', label: 'Leonidas' },
  { value: 'marca-cesar', label: 'Marca de César' },
];

export default function HeroForm({ hero, onUpdate, onRemove, showRemove = false }: HeroFormProps) {
  const formData = hero;
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedEquipmentSet = getCurrentEquipmentSet(formData);
  const selectedAccessorySet = getCurrentAccessorySet(formData);

  // Verifica qual conjunto de equipamentos está aplicado
  function getCurrentEquipmentSet(heroData: Hero): string {
    for (const [setKey, setData] of Object.entries(equipmentOnlySets)) {
      let matches = true;
      for (const [slot, expectedKey] of Object.entries(setData.equipment)) {
        const currentKey = Object.keys(equipmentDatabase).find(
          k => equipmentDatabase[k].name === heroData.equipment[slot as keyof typeof heroData.equipment]?.name
        );
        if (currentKey !== expectedKey) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return setKey;
      }
    }
    return 'none';
  }

  // Verifica qual conjunto de acessórios está aplicado
  function getCurrentAccessorySet(heroData: Hero): string {
    for (const [setKey, setData] of Object.entries(accessoryOnlySets)) {
      let matches = true;
      for (const [slot, expectedKey] of Object.entries(setData.equipment)) {
        const currentKey = Object.keys(equipmentDatabase).find(
          k => equipmentDatabase[k].name === heroData.equipment[slot as keyof typeof heroData.equipment]?.name
        );
        if (currentKey !== expectedKey) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return setKey;
      }
    }
    return 'none';
  }

  const updateHero = (updated: Hero) => {
    // Recalcula atributos finais antes de atualizar
    const finalStats = calculateHeroFinalStats(updated);
    const totalSoldiers = calculateTotalSoldiers(updated.troopDistribution);
    
    const finalHero = {
      ...updated,
      attack: finalStats.attack,
      defense: finalStats.defense,
      health: finalStats.health,
      speed: finalStats.speed,
      totalTroops: totalSoldiers,
      soldiers: totalSoldiers,
    };
    
    onUpdate(finalHero);
  };

  const handleChange = (field: keyof Hero, value: string | number) => {
    const updated = { ...formData, [field]: value };
    updateHero(updated);
  };

  const handleMedalToggle = (medal: MedalType) => {
    const currentMedals = formData.medals || [];
    const updatedMedals = currentMedals.includes(medal)
      ? currentMedals.filter(m => m !== medal)
      : [...currentMedals, medal];
    
    const updated = { ...formData, medals: updatedMedals };
    updateHero(updated);
  };

  const handleTroopTypeChange = (slot: keyof Hero['troopDistribution'], unitType: UnitType) => {
    const updated = {
      ...formData,
      troopDistribution: {
        ...formData.troopDistribution,
        [slot]: {
          ...formData.troopDistribution[slot],
          unitType,
        },
      },
    };
    updateHero(updated);
  };

  const handleTroopQuantityChange = (slot: keyof Hero['troopDistribution'], quantity: number) => {
    const updated = {
      ...formData,
      troopDistribution: {
        ...formData.troopDistribution,
        [slot]: {
          ...formData.troopDistribution[slot],
          quantity: Math.max(0, quantity),
        },
      },
    };
    updateHero(updated);
  };

  const handleEquipmentChange = (
    slot: 'helmet' | 'armor' | 'weapon' | 'boots' | 'shield' | 'accessory' | 'mount' | 'ring' | 'necklace' | 'belt',
    key: string
  ) => {
    const equipment = key === 'none' ? undefined : equipmentDatabase[key];
    const updated = {
      ...formData,
      equipment: {
        ...formData.equipment,
        [slot]: equipment,
      },
    };

    updateHero(updated);
  };

  const handleEquipmentSetChange = (setKey: string) => {
    if (setKey === 'none') {
      // Limpa apenas os equipamentos (não os acessórios)
      const updated = {
        ...formData,
        equipment: {
          ...formData.equipment,
          helmet: undefined,
          armor: undefined,
          weapon: undefined,
          boots: undefined,
          shield: undefined,
        },
      };
      updateHero(updated);
      return;
    }

    const set = equipmentOnlySets[setKey];
    if (!set) return;

    // Aplica todos os equipamentos do conjunto (mantém acessórios)
    const updatedEquipment: Hero['equipment'] = { ...formData.equipment };

    for (const [slot, equipmentKey] of Object.entries(set.equipment)) {
      if (equipmentKey && equipmentDatabase[equipmentKey]) {
        updatedEquipment[slot as keyof typeof updatedEquipment] = equipmentDatabase[equipmentKey];
      }
    }

    const updated = {
      ...formData,
      equipment: updatedEquipment,
    };

    updateHero(updated);
  };

  const handleAccessorySetChange = (setKey: string) => {
    if (setKey === 'none') {
      // Limpa apenas os acessórios (não os equipamentos)
      const updated = {
        ...formData,
        equipment: {
          ...formData.equipment,
          accessory: undefined,
          mount: undefined,
          ring: undefined,
          necklace: undefined,
          belt: undefined,
        },
      };
      updateHero(updated);
      return;
    }

    const set = accessoryOnlySets[setKey];
    if (!set) return;

    // Aplica todos os acessórios do conjunto (mantém equipamentos)
    const updatedEquipment: Hero['equipment'] = { ...formData.equipment };

    for (const [slot, equipmentKey] of Object.entries(set.equipment)) {
      if (equipmentKey && equipmentDatabase[equipmentKey]) {
        updatedEquipment[slot as keyof typeof updatedEquipment] = equipmentDatabase[equipmentKey];
      }
    }

    const updated = {
      ...formData,
      equipment: updatedEquipment,
    };

    updateHero(updated);
  };

  const finalStats = calculateHeroFinalStats(formData);
  const totalSoldiers = calculateTotalSoldiers(formData.troopDistribution);
  const currentMedals = formData.medals || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 hover:border-blue-400 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Herói: {formData.name}</h3>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {isExpanded ? '▼ Recolher' : '▶ Expandir'}
          </Button>
          {showRemove && onRemove && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onRemove}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Remover
            </Button>
          )}
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div>
          <Label className="mb-1 block text-gray-700">Nome</Label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="h-9 text-gray-900"
          />
        </div>

        <div>
          <Label className="mb-1 block text-gray-700">Potencial</Label>
          <select
            value={formData.potential}
            onChange={(e) => handleChange('potential', parseInt(e.target.value) as HeroPotential)}
            className={cn(selectFieldClass, 'h-9')}
          >
            {[3, 4, 5, 6, 7, 8].map((pot) => (
              <option key={pot} value={pot}>
                Pot {pot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-1 block text-gray-700">Total de Tropas</Label>
          <div className="h-9 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-800">
            <span className="font-semibold">{formData.totalTroops.toLocaleString()}</span>
            <span className="ml-2 text-xs text-gray-600">(soma dos 6 slots)</span>
          </div>
        </div>

      </div>

      {/* Atributos Base */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Atributos Base</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="mb-1 block text-gray-700">Bravura</Label>
            <Input
              type="number"
              value={formData.bravery}
              onChange={(e) => handleChange('bravery', parseInt(e.target.value) || 0)}
              className="h-9 text-gray-900"
              min={0}
            />
          </div>
          <div>
            <Label className="mb-1 block text-gray-700">Destreza</Label>
            <Input
              type="number"
              value={formData.dexterity}
              onChange={(e) => handleChange('dexterity', parseInt(e.target.value) || 0)}
              className="h-9 text-gray-900"
              min={0}
            />
          </div>
          <div>
            <Label className="mb-1 block text-gray-700">Bloqueio</Label>
            <Input
              type="number"
              value={formData.parry}
              onChange={(e) => handleChange('parry', parseInt(e.target.value) || 0)}
              className="h-9 text-gray-900"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Medalhas - Checkboxes */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Medalhas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {medalOptions.map((medal) => (
            <div key={medal.value} className="flex items-center gap-2">
              <Checkbox
                id={`medal-${medal.value}`}
                checked={currentMedals.includes(medal.value)}
                onCheckedChange={() => handleMedalToggle(medal.value)}
              />
              <Label
                htmlFor={`medal-${medal.value}`}
                className="cursor-pointer font-normal text-gray-700"
              >
                {medal.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Atributos Finais Calculados */}
      <div className="mb-4 bg-blue-50 p-3 rounded-md">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Atributos Finais (Calculados)</h4>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Ataque:</span>
            <span className="ml-2 font-bold text-blue-700">{finalStats.attack}</span>
          </div>
          <div>
            <span className="text-gray-600">Defesa:</span>
            <span className="ml-2 font-bold text-blue-700">{finalStats.defense}</span>
          </div>
          <div>
            <span className="text-gray-600">Vida (HP):</span>
            <span className="ml-2 font-bold text-blue-700">{finalStats.health}</span>
          </div>
          <div>
            <span className="text-gray-600">Velocidade:</span>
            <span className="ml-2 font-bold text-blue-700">{finalStats.speed}</span>
          </div>
        </div>
      </div>

      {/* Seção Expandida */}
      {isExpanded && (
        <>
          {/* Equipamentos */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">Equipamentos</h4>

            {/* Select Master para Conjuntos de Equipamentos */}
            <div className="mb-4">
              <Label className="mb-1 block text-gray-700">
                Aplicar Conjunto de Equipamentos
              </Label>
              <select
                value={selectedEquipmentSet}
                onChange={(e) => handleEquipmentSetChange(e.target.value)}
                className={cn(selectFieldClass, 'h-9')}
              >
                <option value="none">Nenhum conjunto</option>
                {availableEquipmentSets.map((set) => (
                  <option key={set.value} value={set.value}>
                    {set.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Selecione um conjunto para aplicar todos os equipamentos automaticamente.
                Alterar qualquer equipamento individual desmarca o conjunto.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-1 block text-gray-700">Elmo</Label>
                <select
                  value={formData.equipment.helmet?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('helmet', key);
                  }}
                  className={cn(selectFieldClass, 'h-9')}
                >
                  <option value="none">Nenhum</option>
                  {equipmentByType.helmet.map((eq) => (
                    <option key={eq.key} value={eq.name}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-1 block text-gray-700">Armadura</Label>
                <select
                  value={formData.equipment.armor?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('armor', key);
                  }}
                  className={cn(selectFieldClass, 'h-9')}
                >
                  <option value="none">Nenhum</option>
                  {equipmentByType.armor.map((eq) => (
                    <option key={eq.key} value={eq.name}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-1 block text-gray-700">Espada</Label>
                <select
                  value={formData.equipment.weapon?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('weapon', key);
                  }}
                  className={cn(selectFieldClass, 'h-9')}
                >
                  <option value="none">Nenhum</option>
                  {equipmentByType.weapon.map((eq) => (
                    <option key={eq.key} value={eq.name}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-1 block text-gray-700">Botas</Label>
                <select
                  value={formData.equipment.boots?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('boots', key);
                  }}
                  className={cn(selectFieldClass, 'h-9')}
                >
                  <option value="none">Nenhum</option>
                  {equipmentByType.boots.map((eq) => (
                    <option key={eq.key} value={eq.name}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="mb-1 block text-gray-700">Escudo</Label>
                <select
                  value={formData.equipment.shield?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('shield', key);
                  }}
                  className={cn(selectFieldClass, 'h-9')}
                >
                  <option value="none">Nenhum</option>
                  {equipmentByType.shield.map((eq) => (
                    <option key={eq.key} value={eq.name}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Acessórios Separados */}
            <div className="mb-6 py-3">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Acessórios</h4>

              {/* Select Master para Conjuntos de Acessórios */}
              <div className="mb-4">
                <Label className="mb-1 block text-gray-700">
                  Aplicar Conjunto de Acessórios
                </Label>
                <select
                  value={selectedAccessorySet}
                  onChange={(e) => handleAccessorySetChange(e.target.value)}
                  className={cn(selectFieldClass, 'h-9')}
                >
                  <option value="none">Nenhum conjunto</option>
                  {availableAccessorySets.map((set) => (
                    <option key={set.value} value={set.value}>
                      {set.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Selecione um conjunto para aplicar todos os acessórios automaticamente.
                  Alterar qualquer acessório individual desmarca o conjunto.
                </p>
              </div>

              {/* Primeira linha: 3 selects */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <Label className="mb-1 block text-gray-700">Acessório</Label>
                  <select
                    value={formData.equipment.accessory?.name || 'none'}
                    onChange={(e) => {
                      const key = Object.keys(equipmentDatabase).find(
                        k => equipmentDatabase[k].name === e.target.value
                      ) || 'none';
                      handleEquipmentChange('accessory', key);
                    }}
                    className={cn(selectFieldClass, 'h-9')}
                  >
                    <option value="none">Nenhum</option>
                    {equipmentByType.accessory.map((eq) => (
                      <option key={eq.key} value={eq.name}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="mb-1 block text-gray-700">Montaria</Label>
                  <select
                    value={formData.equipment.mount?.name || 'none'}
                    onChange={(e) => {
                      const key = Object.keys(equipmentDatabase).find(
                        k => equipmentDatabase[k].name === e.target.value
                      ) || 'none';
                      handleEquipmentChange('mount', key);
                    }}
                    className={cn(selectFieldClass, 'h-9')}
                  >
                    <option value="none">Nenhum</option>
                    {equipmentByType.mount.map((eq) => (
                      <option key={eq.key} value={eq.name}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="mb-1 block text-gray-700">Anel</Label>
                  <select
                    value={formData.equipment.ring?.name || 'none'}
                    onChange={(e) => {
                      const key = Object.keys(equipmentDatabase).find(
                        k => equipmentDatabase[k].name === e.target.value
                      ) || 'none';
                      handleEquipmentChange('ring', key);
                    }}
                    className={cn(selectFieldClass, 'h-9')}
                  >
                    <option value="none">Nenhum</option>
                    {equipmentByType.ring.map((eq) => (
                      <option key={eq.key} value={eq.name}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Segunda linha: 2 selects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-1 block text-gray-700">Colar</Label>
                  <select
                    value={formData.equipment.necklace?.name || 'none'}
                    onChange={(e) => {
                      const key = Object.keys(equipmentDatabase).find(
                        k => equipmentDatabase[k].name === e.target.value
                      ) || 'none';
                      handleEquipmentChange('necklace', key);
                    }}
                    className={cn(selectFieldClass, 'h-9')}
                  >
                    <option value="none">Nenhum</option>
                    {equipmentByType.necklace.map((eq) => (
                      <option key={eq.key} value={eq.name}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="mb-1 block text-gray-700">Cinto</Label>
                  <select
                    value={formData.equipment.belt?.name || 'none'}
                    onChange={(e) => {
                      const key = Object.keys(equipmentDatabase).find(
                        k => equipmentDatabase[k].name === e.target.value
                      ) || 'none';
                      handleEquipmentChange('belt', key);
                    }}
                    className={cn(selectFieldClass, 'h-9')}
                  >
                    <option value="none">Nenhum</option>
                    {equipmentByType.belt.map((eq) => (
                      <option key={eq.key} value={eq.name}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Distribuição de Tropas (6 slots - 3 superiores e 3 inferiores) */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Distribuição de Tropas (Total: {totalSoldiers.toLocaleString()})
            </h4>
            
            {/* Slots Superiores (1, 2, 3) - Apenas tropas superiores */}
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Slots Superiores (Hastatus, Principes, Equites)
                <span className="text-xs text-gray-500 ml-2">* Recebem bônus de equipamentos</span>
              </p>
              <div className="grid grid-cols-3 gap-4">
                {(['slot1', 'slot2', 'slot3'] as const).map((slot) => (
                  <div key={slot} className="border border-gray-300 rounded-md p-3 bg-blue-50">
                    <Label className="mb-1 block text-xs font-medium text-gray-600">
                      Slot {slot.replace('slot', '')} - Tipo
                    </Label>
                    <select
                      value={formData.troopDistribution[slot].unitType}
                      onChange={(e) => handleTroopTypeChange(slot, e.target.value as UnitType)}
                      className={cn(selectFieldClass, 'mb-2 h-8 text-sm')}
                    >
                      <option value="none">Nenhum</option>
                      {superiorUnits.map((unit) => (
                        <option key={unit.type} value={unit.type}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                    <Label className="mb-1 block text-xs font-medium text-gray-600">Quantidade</Label>
                    <Input
                      type="number"
                      value={formData.troopDistribution[slot].quantity}
                      onChange={(e) => handleTroopQuantityChange(slot, parseInt(e.target.value) || 0)}
                      className="h-8 text-sm text-gray-900"
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Slots Inferiores (4, 5, 6) - Apenas tropas inferiores */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Slots Inferiores (Sagittarius, Ballistae, Onagers)
                <span className="text-xs text-gray-500 ml-2">* Não recebem bônus de equipamentos</span>
              </p>
              <div className="grid grid-cols-3 gap-4">
                {(['slot4', 'slot5', 'slot6'] as const).map((slot) => (
                  <div key={slot} className="border border-gray-300 rounded-md p-3 bg-red-50">
                    <Label className="mb-1 block text-xs font-medium text-gray-600">
                      Slot {slot.replace('slot', '')} - Tipo
                    </Label>
                    <select
                      value={formData.troopDistribution[slot].unitType}
                      onChange={(e) => handleTroopTypeChange(slot, e.target.value as UnitType)}
                      className={cn(selectFieldClass, 'mb-2 h-8 text-sm')}
                    >
                      <option value="none">Nenhum</option>
                      {inferiorUnits.map((unit) => (
                        <option key={unit.type} value={unit.type}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                    <Label className="mb-1 block text-xs font-medium text-gray-600">Quantidade</Label>
                    <Input
                      type="number"
                      value={formData.troopDistribution[slot].quantity}
                      onChange={(e) => handleTroopQuantityChange(slot, parseInt(e.target.value) || 0)}
                      className="h-8 text-sm text-gray-900"
                      min={0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
