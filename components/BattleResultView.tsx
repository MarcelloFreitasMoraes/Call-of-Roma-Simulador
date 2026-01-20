'use client';

import { BattleResult } from '@/types/battle';

interface BattleResultViewProps {
  result: BattleResult | null;
}

export default function BattleResultView({ result }: BattleResultViewProps) {
  if (!result) {
    return null;
  }

  const winnerColor =
    result.winner === 'attack'
      ? 'text-green-600'
      : result.winner === 'defense'
      ? 'text-red-600'
      : 'text-yellow-600';

  const winnerBg =
    result.winner === 'attack'
      ? 'bg-green-50 border-green-200'
      : result.winner === 'defense'
      ? 'bg-red-50 border-red-200'
      : 'bg-yellow-50 border-yellow-200';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Resultado da Batalha</h2>

      {/* Vencedor */}
      <div className={`${winnerBg} rounded-lg p-6 mb-6 border-2`}>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Vencedor</p>
          <p className={`text-4xl font-bold ${winnerColor}`}>
            {result.winner === 'attack'
              ? '🏆 Ataque Venceu!'
              : result.winner === 'defense'
              ? '🛡️ Defesa Venceu!'
              : '🤝 Empate!'}
          </p>
          <p className="text-gray-600 mt-2">Rodadas: {result.rounds}</p>
        </div>
      </div>

      {/* Soldados Restantes */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Soldados de Ataque Restantes</p>
          <p className="text-2xl font-bold text-blue-600">
            {result.attackRemainingSoldiers.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Heróis: {result.attackRemainingHeroes}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <p className="text-sm text-gray-600 mb-1">Soldados de Defesa Restantes</p>
          <p className="text-2xl font-bold text-red-600">
            {result.defenseRemainingSoldiers.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Heróis: {result.defenseRemainingHeroes}
          </p>
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Métricas de Performance (5 Medidas)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">1. Soldados Sobreviventes</p>
            <p className="text-xl font-bold text-gray-800">
              {result.performanceMetrics.survivingSoldiers.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">2. Diferença de Soldados</p>
            <p className="text-xl font-bold text-gray-800">
              {result.performanceMetrics.soldierDifference > 0 ? '+' : ''}
              {result.performanceMetrics.soldierDifference.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">3. Taxa de Sobrevivência</p>
            <p className="text-xl font-bold text-gray-800">
              {(result.performanceMetrics.soldierSurvivalRate * 100).toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">4. Heróis Sobreviventes</p>
            <p className="text-xl font-bold text-gray-800">
              {result.performanceMetrics.survivingHeroes}
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200 md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">5. Eficiência Geral</p>
            <p className="text-2xl font-bold text-purple-600">
              {result.performanceMetrics.overallEfficiency.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>

      {/* Detalhes das Rodadas */}
      {result.details.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detalhes das Rodadas</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {result.details.slice(0, 10).map((round) => (
              <div
                key={round.round}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">Rodada {round.round}</span>
                  <span className="text-gray-500">
                    Dano Ataque: {round.damageDealt.attack.toLocaleString()} | Dano Defesa:{' '}
                    {round.damageDealt.defense.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-blue-600 font-medium">Ataque:</span>{' '}
                    {round.attackSoldiersBefore.toLocaleString()} →{' '}
                    {round.attackSoldiersAfter.toLocaleString()}
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">Defesa:</span>{' '}
                    {round.defenseSoldiersBefore.toLocaleString()} →{' '}
                    {round.defenseSoldiersAfter.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
            {result.details.length > 10 && (
              <p className="text-center text-gray-500 text-sm mt-2">
                ... e mais {result.details.length - 10} rodadas
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
