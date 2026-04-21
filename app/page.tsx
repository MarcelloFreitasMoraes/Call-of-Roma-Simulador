'use client';

import { useState } from 'react';
import { BattleFormation, BattleResult } from '@/types/battle';
import { calculateBattle } from '@/utils/battleCalculator';
import { calculateTotalSoldiers } from '@/utils/heroCalculator';
import FormationEditor from '@/components/FormationEditor';
import BattleResultView from '@/components/BattleResultView';

export default function Home() {
  const [attackFormation, setAttackFormation] = useState<BattleFormation>({
    heroes: [],
    side: 'attack',
  });

  const [defenseFormation, setDefenseFormation] = useState<BattleFormation>({
    heroes: [],
    side: 'defense',
  });

  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

  const handleCalculate = () => {
    const attackTotalSoldiers = attackFormation.heroes.reduce(
      (sum, hero) => sum + calculateTotalSoldiers(hero.troopDistribution),
      0
    );
    const defenseTotalSoldiers = defenseFormation.heroes.reduce(
      (sum, hero) => sum + calculateTotalSoldiers(hero.troopDistribution),
      0
    );

    if (attackFormation.heroes.length === 0 || defenseFormation.heroes.length === 0) {
      alert('Por favor, adicione pelo menos um herói em cada formação!');
      return;
    }

    if (attackTotalSoldiers === 0 || defenseTotalSoldiers === 0) {
      alert('Cada formação precisa ter pelo menos uma tropa para simular a batalha.');
      return;
    }

    const result = calculateBattle(attackFormation, defenseFormation);
    setBattleResult(result);

    // Scroll suave para o resultado
    setTimeout(() => {
      const resultElement = document.getElementById('battle-result');
      if (resultElement) {
        resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold mb-2">⚔️ Call of Roma - Calculadora de Batalhas</h1>
          <p className="text-blue-100 text-lg">
            Baseado no paper: &quot;Coevolutionary Procedural Generation of Battle Formations&quot;
          </p>
          <p className="text-blue-200 text-sm mt-1">SBGames 2014 - André Siqueira Ruela</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Botão de Calcular */}
        <div className="mb-8 text-center">
          <button
            onClick={handleCalculate}
            disabled={
              attackFormation.heroes.length === 0 || defenseFormation.heroes.length === 0
            }
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            🎯 Calcular Batalha
          </button>
        </div>

        {/* Formações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Formação de Ataque */}
          <FormationEditor
            formation={attackFormation}
            onUpdate={setAttackFormation}
            title="⚔️ Formação de Ataque"
            color="from-blue-500 to-blue-700"
          />

          {/* Formação de Defesa */}
          <FormationEditor
            formation={defenseFormation}
            onUpdate={setDefenseFormation}
            title="🛡️ Formação de Defesa"
            color="from-red-500 to-red-700"
          />
        </div>

        {/* Resultado da Batalha */}
        {battleResult && (
          <div id="battle-result" className="mt-8">
            <BattleResultView result={battleResult} />
          </div>
        )}

        {/* Informações sobre o Sistema */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 Sobre o Sistema</h2>
          <div className="prose max-w-none text-gray-700">
            <p className="mb-4">
              Esta calculadora implementa o sistema de batalhas do jogo{' '}
              <strong>Call of Roma</strong>, baseado no paper acadêmico apresentado no SBGames 2014.
            </p>
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              Características do Sistema:
            </h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>
                <strong>Sistema de Batalhas por Turnos:</strong> Simula batalhas baseadas em turnos
                entre duas formações
              </li>
              <li>
                <strong>Múltiplos Heróis:</strong> Cada formação pode ter vários heróis com
                características individuais
              </li>
              <li>
                <strong>5 Métricas de Performance:</strong> Avalia o resultado da batalha usando 5
                medidas diferentes:
              </li>
            </ul>
            <ol className="list-decimal list-inside space-y-2 mb-4 ml-4">
              <li>Victory Point (1 para vitória, 0 para derrota/empate)</li>
              <li>Offensiveness (abatidos por soldado inicial)</li>
              <li>Defensiveness (sobrevivência relativa)</li>
              <li>Usage (proporção de heróis não utilizados)</li>
              <li>Participation (impacto relativo no exército inimigo)</li>
            </ol>
            <p className="text-sm text-gray-600 mt-4">
              <em>
                Baseado em: Ruela, A. S., & Guimarães, F. G. (2014). Coevolutionary Procedural
                Generation of Battle Formations in Massively Multiplayer Online Strategy Games.
                SBGames 2014.
              </em>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Call of Roma Calculadora © 2026 | Desenvolvido com Next.js + TypeScript
          </p>
        </div>
      </footer>
    </div>
  );
}
