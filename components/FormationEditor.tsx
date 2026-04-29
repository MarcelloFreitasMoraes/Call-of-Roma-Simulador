'use client';

import { useRef, type ChangeEvent } from 'react';
import { toast } from 'sonner';
import { BattleFormation, Hero } from '@/types/battle';
import { calculateFormationStats } from '@/utils/battleCalculator';
import {
  downloadTextFile,
  generateFormationTemplate,
  parseFormationTxt,
  serializeFormationTxt,
} from '@/utils/formationTxt';
import { Button } from '@/components/ui/button';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      totalTroops: 0,
      arenaCapacity: {
        base: 0,
        fixedBonus: 0,
      },
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

  const handleDownloadTemplate = () => {
    const name = formation.side === 'attack' ? 'ataque-modelo.txt' : 'defesa-modelo.txt';
    downloadTextFile(name, generateFormationTemplate(formation.side));
    toast.success(`Modelo baixado: ${name}`);
  };

  const handleExportFormation = () => {
    if (formation.heroes.length === 0) {
      toast.error('Adicione pelo menos um herói para exportar.');
      return;
    }
    const name = formation.side === 'attack' ? 'formacao-ataque.txt' : 'formacao-defesa.txt';
    const text = serializeFormationTxt(formation);
    downloadTextFile(name, text);
    toast.success(`Arquivo exportado: ${name}`, {
      description: (
        <pre className="max-h-48 overflow-auto text-left wrap-break-word font-mono text-xs whitespace-pre-wrap rounded-md border border-border bg-muted/80 p-2 text-foreground">
          {text}
        </pre>
      ),
      duration: 30_000,
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = parseFormationTxt(text, formation.side);
      if (!parsed.ok) {
        const errText = parsed.errors
          .map((err) => (err.line > 0 ? `Linha ${err.line}: ${err.message}` : err.message))
          .join('\n');
        toast.error('Erro ao importar TXT', {
          description: (
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap font-sans text-sm">{errText}</pre>
          ),
          duration: 20_000,
        });
        return;
      }
      onUpdate({ ...formation, heroes: parsed.heroes });
      toast.success(`Importação concluída: ${parsed.heroes.length} herói(s).`);
    } catch {
      toast.error('Não foi possível ler o arquivo.');
    }
  };

  return (
    <div className={`min-w-0 bg-linear-to-br ${color} rounded-xl shadow-lg p-6`}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={handleFileSelected}
      />

      <header className="mb-6 flex w-full min-w-0 flex-col gap-3">
        {/* Título e Adicionar Herói na mesma linha */}
        <div className="flex min-w-0 flex-row items-start justify-between gap-3">
          <h2 className="min-w-0 flex-1 text-xl font-bold leading-tight text-white sm:text-2xl">
            {title}
          </h2>
          <Button
            type="button"
            onClick={addHero}
            size="sm"
            className="shrink-0 border-0 bg-white text-xs font-semibold text-gray-800 shadow-md hover:bg-gray-100 sm:px-4 sm:text-sm"
          >
            + Adicionar Herói
          </Button>
        </div>
        {/* Botões de arquivo TXT na linha de baixo, lado a lado */}
        <div
          className="flex w-full min-w-0 flex-row flex-wrap justify-end gap-2 sm:flex-nowrap"
          aria-label="Importar e exportar formação em TXT"
        >
          <Button
            type="button"
            onClick={handleImportClick}
            size="sm"
            variant="secondary"
            className="shrink-0 border-0 bg-white/90 text-xs font-semibold text-gray-900 shadow-md hover:bg-white sm:text-sm"
          >
            Importar TXT
          </Button>
          <Button
            type="button"
            onClick={handleExportFormation}
            size="sm"
            variant="secondary"
            className="shrink-0 border-0 bg-white/90 text-xs font-semibold text-gray-900 shadow-md hover:bg-white sm:text-sm"
          >
            Baixar formação
          </Button>
          <Button
            type="button"
            onClick={handleDownloadTemplate}
            size="sm"
            className="shrink-0 border-0 bg-amber-200 text-xs font-semibold text-gray-900 shadow-md hover:bg-amber-100 sm:text-sm"
          >
            Baixar modelo
          </Button>
        </div>
      </header>

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
            <p className="text-white/70 text-sm mt-2">
              Clique em &quot;Adicionar Herói&quot; para começar.
            </p>
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
