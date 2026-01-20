# ⚔️ Call of Roma - Calculadora de Batalhas

Aplicativo web Next.js para cálculo de batalhas do jogo Call of Roma, baseado no paper acadêmico **"Coevolutionary Procedural Generation of Battle Formations in Massively Multiplayer Online Strategy Games"** (SBGames 2014).

## 📋 Sobre o Projeto

Este aplicativo permite calcular o resultado de batalhas entre formações de ataque e defesa no jogo Call of Roma. O sistema implementa:

- **Sistema de Batalhas por Turnos**: Simula batalhas baseadas em turnos entre duas formações
- **Múltiplos Heróis**: Cada formação pode ter vários heróis com características individuais
- **5 Métricas de Performance**: Avalia o resultado da batalha usando 5 medidas diferentes:
  1. Número de soldados sobreviventes do vencedor
  2. Diferença de soldados (ataque - defesa)
  3. Taxa de sobrevivência de soldados
  4. Número de heróis sobreviventes
  5. Eficiência geral

## 🚀 Funcionalidades

- ✅ Configuração de formações de ataque e defesa
- ✅ Adição e remoção de heróis
- ✅ Configuração de atributos dos heróis (ataque, defesa, vida, velocidade, soldados)
- ✅ Cálculo automático de batalhas
- ✅ Visualização detalhada dos resultados
- ✅ Estatísticas em tempo real das formações
- ✅ Histórico de rodadas da batalha
- ✅ Interface moderna e responsiva

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna e responsiva
- **React 19** - Biblioteca UI

## 📦 Instalação

1. Clone o repositório ou navegue até a pasta do projeto:
```bash
cd "Call of Roma Calculadora/call-of-roma-calculator"
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador

## 🏗️ Estrutura do Projeto

```
call-of-roma-calculator/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx             # Página principal
│   └── globals.css          # Estilos globais
├── components/
│   ├── HeroForm.tsx         # Formulário de edição de herói
│   ├── FormationEditor.tsx  # Editor de formação
│   └── BattleResultView.tsx # Visualização de resultados
├── types/
│   └── battle.ts            # Tipos e interfaces TypeScript
├── utils/
│   └── battleCalculator.ts  # Lógica de cálculo de batalhas
└── package.json
```

## 📚 Baseado em

**Paper Acadêmico:**
- Ruela, A. S., & Guimarães, F. G. (2014). *Coevolutionary Procedural Generation of Battle Formations in Massively Multiplayer Online Strategy Games*. SBGames 2014.

**Jogo:**
- Call of Roma (anteriormente conhecido como Caesary)
- Desenvolvido por Heroic Era

## 🎮 Como Usar

1. **Adicione Heróis à Formação de Ataque:**
   - Clique em "+ Adicionar Herói" na seção de Ataque
   - Configure os atributos do herói (nome, ataque, defesa, vida, velocidade, soldados)

2. **Adicione Heróis à Formação de Defesa:**
   - Clique em "+ Adicionar Herói" na seção de Defesa
   - Configure os atributos do herói

3. **Calcule a Batalha:**
   - Clique no botão "🎯 Calcular Batalha"
   - O resultado será exibido abaixo com todas as métricas de performance

4. **Analise os Resultados:**
   - Veja o vencedor da batalha
   - Analise as 5 métricas de performance
   - Revise o histórico detalhado das rodadas

## 📊 Métricas de Performance

O sistema calcula 5 métricas diferentes para avaliar o desempenho da batalha:

1. **Soldados Sobreviventes**: Número total de soldados que restaram do lado vencedor
2. **Diferença de Soldados**: Diferença entre soldados de ataque e defesa restantes
3. **Taxa de Sobrevivência**: Percentual de soldados que sobreviveram da formação vencedora
4. **Heróis Sobreviventes**: Número de heróis que ainda têm soldados vivos
5. **Eficiência Geral**: Combinação ponderada de sobrevivência de soldados e heróis

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria uma build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter

## 📝 Licença

Este projeto é uma implementação educacional baseada no paper acadêmico mencionado.

## 👨‍💻 Desenvolvido com

- Next.js
- TypeScript
- Tailwind CSS
- React

---

**Nota**: Este é um projeto educacional baseado no paper acadêmico sobre geração procedural de formações de batalha para jogos MMORTS.
