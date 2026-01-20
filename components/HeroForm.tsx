'use client';
import { Hero, HeroPotential, MedalType, UnitType } from '@/types/battle';
import { useState, useEffect } from 'react';
import { equipmentByType, equipmentDatabase } from '@/data/equipmentData';
import { superiorUnits, inferiorUnits } from '@/data/unitTypes';
import { calculateHeroFinalStats, calculateTotalSoldiers } from '@/utils/heroCalculator';

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
  const [formData, setFormData] = useState<Hero>(hero);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sincroniza com o hero externo quando ele muda (sem efeito em cascata)
  useEffect(() => {
    setFormData(hero);
  }, [hero]);

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
      soldiers: totalSoldiers,
    };
    
    setFormData(finalHero);
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

  const handleEquipmentChange = (slot: 'helmet' | 'armor' | 'weapon' | 'boots' | 'shield' | 'accessory', key: string) => {
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

  const finalStats = calculateHeroFinalStats(formData);
  const totalSoldiers = calculateTotalSoldiers(formData.troopDistribution);
  const currentMedals = formData.medals || [];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200 hover:border-blue-400 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Herói: {formData.name}</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            {isExpanded ? '▼ Recolher' : '▶ Expandir'}
          </button>
          {showRemove && onRemove && (
            <button
              onClick={onRemove}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
            >
              Remover
            </button>
          )}
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Potencial</label>
          <select
            value={formData.potential}
            onChange={(e) => handleChange('potential', parseInt(e.target.value) as HeroPotential)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
          >
            {[3, 4, 5, 6, 7, 8].map((pot) => (
              <option key={pot} value={pot}>
                Pot {pot}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cap. Máx. Tropas</label>
          <input
            type="number"
            value={formData.maxTroopCapacity}
            onChange={(e) => handleChange('maxTroopCapacity', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total de Tropas</label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md">
            <span className="font-semibold text-gray-800">
              {totalSoldiers.toLocaleString()} / {formData.maxTroopCapacity.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Atributos Base */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Atributos Base</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bravura</label>
            <input
              type="number"
              value={formData.bravery}
              onChange={(e) => handleChange('bravery', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destreza</label>
            <input
              type="number"
              value={formData.dexterity}
              onChange={(e) => handleChange('dexterity', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bloqueio</label>
            <input
              type="number"
              value={formData.parry}
              onChange={(e) => handleChange('parry', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Medalhas - Checkboxes */}
      <div className="mb-4">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Medalhas</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {medalOptions.map((medal) => (
            <label key={medal.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentMedals.includes(medal.value)}
                onChange={() => handleMedalToggle(medal.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{medal.label}</span>
            </label>
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Elmo</label>
                <select
                  value={formData.equipment.helmet?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('helmet', key);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Armadura</label>
                <select
                  value={formData.equipment.armor?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('armor', key);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Espada</label>
                <select
                  value={formData.equipment.weapon?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('weapon', key);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Botas</label>
                <select
                  value={formData.equipment.boots?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('boots', key);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Escudo</label>
                <select
                  value={formData.equipment.shield?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('shield', key);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="none">Nenhum</option>
                  {equipmentByType.shield.map((eq) => (
                    <option key={eq.key} value={eq.name}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acessório</label>
                <select
                  value={formData.equipment.accessory?.name || 'none'}
                  onChange={(e) => {
                    const key = Object.keys(equipmentDatabase).find(
                      k => equipmentDatabase[k].name === e.target.value
                    ) || 'none';
                    handleEquipmentChange('accessory', key);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="none">Nenhum</option>
                  {equipmentByType.accessory.map((eq) => (
                    <option key={eq.key} value={eq.name}>
                      {eq.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Distribuição de Tropas (6 slots - 3 superiores e 3 inferiores) */}
          <div className="mb-4">
            <h4 className="text-md font-semibold text-gray-700 mb-2">
              Distribuição de Tropas (Total: {totalSoldiers.toLocaleString()} / {formData.maxTroopCapacity.toLocaleString()})
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Slot {slot.replace('slot', '')} - Tipo
                    </label>
                    <select
                      value={formData.troopDistribution[slot].unitType}
                      onChange={(e) => handleTroopTypeChange(slot, e.target.value as UnitType)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-gray-900 bg-white"
                    >
                      <option value="none">Nenhum</option>
                      {superiorUnits.map((unit) => (
                        <option key={unit.type} value={unit.type}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                    <input
                      type="number"
                      value={formData.troopDistribution[slot].quantity}
                      onChange={(e) => handleTroopQuantityChange(slot, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      min="0"
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
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Slot {slot.replace('slot', '')} - Tipo
                    </label>
                    <select
                      value={formData.troopDistribution[slot].unitType}
                      onChange={(e) => handleTroopTypeChange(slot, e.target.value as UnitType)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 text-gray-900 bg-white"
                    >
                      <option value="none">Nenhum</option>
                      {inferiorUnits.map((unit) => (
                        <option key={unit.type} value={unit.type}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                    <input
                      type="number"
                      value={formData.troopDistribution[slot].quantity}
                      onChange={(e) => handleTroopQuantityChange(slot, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                      min="0"
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
