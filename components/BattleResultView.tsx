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

  const positionLabel = (position: number) => {
    if (position === 0) return 'Esquerda';
    if (position === 1) return 'Centro';
    if (position === 2) return 'Direita';
    return `Posição ${position + 1}`;
  };

  const slotLabel = (slotIndex: number) => `slot${String(slotIndex).padStart(2, '0')}`;

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
          <p className="text-sm text-gray-600 mb-1">Tropas de Ataque Restantes (soma dos slots)</p>
          <p className="text-2xl font-bold text-blue-600">
            {result.attackRemainingSoldiers.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Heróis: {result.attackRemainingHeroes}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <p className="text-sm text-gray-600 mb-1">Tropas de Defesa Restantes (soma dos slots)</p>
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
            <p className="text-sm text-gray-600 mb-1">1. Victory Point</p>
            <p className="text-xl font-bold text-gray-800">
              {result.performanceMetrics.victoryPoint}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">2. Offensiveness</p>
            <p className="text-xl font-bold text-gray-800">
              {result.performanceMetrics.offensiveness.toFixed(3)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">3. Defensiveness</p>
            <p className="text-xl font-bold text-gray-800">
              {result.performanceMetrics.defensiveness.toFixed(3)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">4. Usage</p>
            <p className="text-xl font-bold text-gray-800">
              {result.performanceMetrics.usage.toFixed(3)}
            </p>
          </div>
          <div className="bg-linear-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200 md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">5. Participation</p>
            <p className="text-2xl font-bold text-purple-600">
              {result.performanceMetrics.participation.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* Detalhes das Rodadas */}
      {result.details.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detalhes das Rodadas</h3>
          <div className="max-h-144 overflow-y-auto space-y-3">
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

                {round.replacements.length > 0 && (
                  <div className="mt-3 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-xs text-yellow-900">
                    {round.replacements.map((replacement, index) => (
                      <p key={`${replacement.side}-${replacement.position}-${index}`}>
                        {replacement.side === 'attack' ? 'Ataque' : 'Defesa'} {positionLabel(replacement.position)}:{' '}
                        {replacement.replacedHeroName ? `${replacement.replacedHeroName} saiu, ` : ''}
                        entrou <span className="font-semibold">{replacement.enteredHeroName}</span>.
                      </p>
                    ))}
                  </div>
                )}

                {round.matchups.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {round.matchups.map((matchup) => {
                      const attackHero = round.attackHeroes.find(
                        hero => hero.position === matchup.position
                      );
                      const defenseHero = round.defenseHeroes.find(
                        hero => hero.position === matchup.position
                      );
                      return (
                        <div
                          key={`matchup-${round.round}-${matchup.position}`}
                          className="rounded-md border border-gray-200 bg-white p-2"
                        >
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            {positionLabel(matchup.position)}: {matchup.attackHeroName || 'Sem herói'} vs{' '}
                            {matchup.defenseHeroName || 'Sem herói'}
                          </p>
                          <p className="text-[11px] text-gray-500 mb-2">
                            Dano no duelo: Ataque {matchup.attackDamage.toLocaleString()} | Defesa{' '}
                            {matchup.defenseDamage.toLocaleString()}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="rounded border border-blue-200 bg-blue-50 p-2">
                              <p className="text-[11px] font-semibold text-blue-700 mb-1">
                                Ataque: {attackHero?.heroName || 'Sem herói'}
                              </p>
                              {attackHero ? (
                                <>
                                  <p className="text-[11px] text-blue-900 mb-1">
                                    Tropas (final/inicial): {attackHero.soldiersAfter.toLocaleString()} /{' '}
                                    {attackHero.soldiersBefore.toLocaleString()}
                                  </p>
                                  <div className="space-y-1">
                                    {attackHero.slots.map((slot) => (
                                      <p
                                        key={`atk-${attackHero.heroId}-${slot.slotIndex}`}
                                        className="text-[11px] text-blue-900"
                                      >
                                        {slotLabel(slot.slotIndex)}: {slot.before.toLocaleString()} →{' '}
                                        {slot.after.toLocaleString()} (baixas:{' '}
                                        {slot.losses.toLocaleString()})
                                      </p>
                                    ))}
                                  </div>
                                  <div className="mt-2 flex gap-1 flex-wrap">
                                    {attackHero.enteredFromQueue && (
                                      <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                        Reserva entrou
                                      </span>
                                    )}
                                    {attackHero.defeated && (
                                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                        Herói derrotado
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <p className="text-[11px] text-blue-700">Sem combate neste lado.</p>
                              )}
                            </div>

                            <div className="rounded border border-red-200 bg-red-50 p-2">
                              <p className="text-[11px] font-semibold text-red-700 mb-1">
                                Defesa: {defenseHero?.heroName || 'Sem herói'}
                              </p>
                              {defenseHero ? (
                                <>
                                  <p className="text-[11px] text-red-900 mb-1">
                                    Tropas (final/inicial): {defenseHero.soldiersAfter.toLocaleString()} /{' '}
                                    {defenseHero.soldiersBefore.toLocaleString()}
                                  </p>
                                  <div className="space-y-1">
                                    {defenseHero.slots.map((slot) => (
                                      <p
                                        key={`def-${defenseHero.heroId}-${slot.slotIndex}`}
                                        className="text-[11px] text-red-900"
                                      >
                                        {slotLabel(slot.slotIndex)}: {slot.before.toLocaleString()} →{' '}
                                        {slot.after.toLocaleString()} (baixas:{' '}
                                        {slot.losses.toLocaleString()})
                                      </p>
                                    ))}
                                  </div>
                                  <div className="mt-2 flex gap-1 flex-wrap">
                                    {defenseHero.enteredFromQueue && (
                                      <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                                        Reserva entrou
                                      </span>
                                    )}
                                    {defenseHero.defeated && (
                                      <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                        Herói derrotado
                                      </span>
                                    )}
                                  </div>
                                </>
                              ) : (
                                <p className="text-[11px] text-red-700">Sem combate neste lado.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
