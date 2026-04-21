# Cenários mínimos de verificação da batalha

Este checklist serve para validar manualmente o motor após mudanças.

## Cenário 1 - 1x1 básico
- Configurar 1 herói no ataque e 1 na defesa.
- Ambos com tropas apenas no slot frontal 1.
- Esperado: batalha encerra em até 50 rodadas, sem `NaN` nas métricas.

## Cenário 2 - 3x3 com fila (5x5 total)
- Configurar 5 heróis no ataque e 5 na defesa.
- Garantir que 2 de cada lado entrem apenas por reposição.
- Esperado: no máximo 3 heróis ativos simultaneamente por lado e entrada dos reservas após derrota de ativos.

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
