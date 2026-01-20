'use client';

import { BattleFormation, Hero } from '@/types/battle';
import { calculateFormationStats } from '@/utils/battleCalculator';
import HeroForm from './HeroForm';

interface FormationEditorProps {
  formation: BattleFormation;
  onUpdate: (formation: BattleFormation) => void;
  title: string;
  color: string;
}

export default function FormationEditor({
  formation,
  onUpdate,
  title,
  color,
}: FormationEditorProps) {
  const addHero = () => {
    const newHero: Hero = {
      id: Date.now().toString(),
      name: `Herói ${formation.heroes.length + 1}`,
      potential: 5,
      bravery: 100,
      dexterity: 100,
      parry: 100,
      attack: 100,
      defense: 100,
      health: 1000,
      speed: 100,
      medals: [],
      equipment: {},
      troopDistribution: {
        slot1: { unitType: 'none', quantity: 0 },
        slot2: { unitType: 'none', quantity: 0 },
        slot3: { unitType: 'none', quantity: 0 },
        slot4: { unitType: 'none', quantity: 0 },
        slot5: { unitType: 'none', quantity: 0 },
        slot6: { unitType: 'none', quantity: 0 },
      },
      maxTroopCapacity: 10000,
      soldiers: 0,
    };
    onUpdate({
      ...formation,
      heroes: [...formation.heroes, newHero],
    });
  };

  const updateHero = (index: number, hero: Hero) => {
    const newHeroes = [...formation.heroes];
    newHeroes[index] = hero;
    onUpdate({ ...formation, heroes: newHeroes });
  };

  const removeHero = (index: number) => {
    const newHeroes = formation.heroes.filter((_, i) => i !== index);
    onUpdate({ ...formation, heroes: newHeroes });
  };

  const stats = calculateFormationStats(formation);

  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl shadow-lg p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <button
          onClick={addHero}
          className="px-4 py-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-md"
        >
          + Adicionar Herói
        </button>
      </div>

      {/* Estatísticas da Formação */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Estatísticas da Formação</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-white/80 text-sm">Total de Soldados</p>
            <p className="text-white text-xl font-bold">{stats.totalSoldiers.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/80 text-sm">Ataque Total</p>
            <p className="text-white text-xl font-bold">{stats.totalAttack.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/80 text-sm">Defesa Total</p>
            <p className="text-white text-xl font-bold">{stats.totalDefense.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/80 text-sm">Vida Total</p>
            <p className="text-white text-xl font-bold">{stats.totalHealth.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-white/80 text-sm">Velocidade Média</p>
            <p className="text-white text-xl font-bold">{Math.round(stats.averageSpeed)}</p>
          </div>
          <div>
            <p className="text-white/80 text-sm">Número de Heróis</p>
            <p className="text-white text-xl font-bold">{stats.heroCount}</p>
          </div>
        </div>
      </div>

      {/* Lista de Heróis */}
      <div className="space-y-4">
        {formation.heroes.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
            <p className="text-white text-lg">Nenhum herói adicionado ainda.</p>
            <p className="text-white/70 text-sm mt-2">Clique em "Adicionar Herói" para começar.</p>
          </div>
        ) : (
          formation.heroes.map((hero, index) => (
            <HeroForm
              key={hero.id}
              hero={hero}
              onUpdate={(updatedHero) => updateHero(index, updatedHero)}
              onRemove={() => removeHero(index)}
              showRemove={formation.heroes.length > 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
