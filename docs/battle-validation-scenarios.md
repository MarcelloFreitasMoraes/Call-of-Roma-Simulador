# Cenários mínimos de verificação da batalha

Este checklist serve para validar manualmente o motor após mudanças.

**Nota:** o simulador aplica um referencial equivalente a estudos militares da Academia no nível máximo (sem exibir percentuais na interface).

## Cenário 1 - 1x1 básico
- Configurar 1 herói no ataque e 1 na defesa.
- Ambos com tropas apenas no slot frontal 1.
- Esperado: batalha encerra em até 501 rodadas no máximo (ou antes, se um lado for eliminado), sem `NaN` nas métricas.

## Cenário 2 - 3x3 com fila (5x5 total)
- Configurar 5 heróis no ataque e 5 na defesa.
- Garantir que 2 de cada lado entrem apenas por reposição.
- Esperado: no máximo 3 heróis ativos simultaneamente por lado e entrada dos reservas após derrota de ativos.
- Esperado nos detalhes: evento explícito de substituição com posição (`Esquerda/Centro/Direita`) e nome do herói que entrou.

## Cenário 3 - Retaguarda sem frente
- Criar herói com tropas apenas nos slots traseiros (4-6).
- Oponente com frente ativa.
- Esperado: dano da retaguarda reduzido (penalidade de 50%) quando não houver tropas frontais vivas.

## Cenário 4 - Métricas do paper
- Executar uma batalha com vencedor claro.
- Esperado: `victoryPoint`, `offensiveness`, `defensiveness`, `usage`, `participation` preenchidos e finitos.

## Cenário 5 - Empate/derrota
- Configurar formações próximas para gerar empate ou derrota de um lado.
- Esperado: `victoryPoint` = 0 no empate; nenhuma métrica com `Infinity`/`NaN`.

## Cenário 6 - Duelo por posição (herói vs herói)
- Criar 3 heróis ativos de cada lado com nomes distintos (A1/A2/A3 vs D1/D2/D3).
- Esperado nos detalhes: cada rodada mostra confronto por posição (`Esquerda`, `Centro`, `Direita`) com `Herói ataque vs herói defesa`.
- Se uma posição estiver vazia, esperado: fallback para alvo ativo mais próximo sem quebrar o cálculo.

## Cenário 7 - Consistência por slot (1..6)
- Em um herói ativo, preencher todos os 6 slots com quantidades conhecidas.
- Esperado nos detalhes: cada slot aparece como `slot01..slot06` com formato `antes -> depois (baixas: X)`.
- Esperado: `antes - depois = perdas` para todos os slots.

## Cenário 8 - Morte de herói na rodada
- Configurar um confronto onde um herói seja eliminado em 1-2 rodadas.
- Esperado nos detalhes: badge/status de `Herói derrotado` para esse herói na rodada da eliminação.
- Esperado: na rodada seguinte, entrada de substituto caso exista fila.

## Cenário 9 - Importar TXT (ataque)
- Baixar modelo na coluna de ataque, preencher `name` e tropas, importar de volta.
- Esperado: lista de heróis substituída conforme arquivo; `side=attack` no arquivo.

## Cenário 10 - Importar TXT (defesa)
- Repetir na coluna de defesa com `side=defense`.
- Esperado: recusa se importar arquivo de ataque na defesa (mensagem de erro clara).

## Cenário 11 - Exportar e round-trip
- Montar formação na UI, usar **Baixar formação**, depois **Importar TXT** no mesmo lado.
- Esperado: mesmos heróis e slots após reimportação.

## Cenário 12 - Compatibilidade de campo totalTroops
- Importar TXT com campo novo `totalTroops` e validar leitura normal.
- Importar TXT legado com `maxTroopCapacity` e validar que a leitura continua funcionando.
- Esperado: em ambos os casos o valor final exibido de tropas é recalculado pela soma dos 6 slots.

## Cenário 13 - Validação de erro
- Remover `potential` ou usar `slot1.unitType=invalido` no TXT.
- Esperado: import bloqueado com lista de erros (linha + mensagem).
