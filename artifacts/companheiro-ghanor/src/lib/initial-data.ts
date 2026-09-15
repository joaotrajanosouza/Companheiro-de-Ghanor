import { GameState } from './types';

export const initialGameState: GameState = {
  campaign: {
    version: 1,
    id: crypto.randomUUID(),
    name: 'A Coroa de Ghanor',
    currentPage: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  character: {
    name: 'Ruff Ghanor',
    forca: 8,
    habilidade: 7,
    pvAtual: 20,
    pvMax: 20,
    pmAtual: 5,
    pmMax: 5,
    dinheiro: 15,
    skills: [
      {
        id: crypto.randomUUID(),
        name: 'Ataque Poderoso',
        description: 'Pode gastar 1 PM para causar +2 de dano no ataque.',
        bonus: 0,
      }
    ],
    inventory: [
      {
        id: crypto.randomUUID(),
        name: 'Espada Longa',
        quantity: 1,
        description: 'Uma espada de aço afiada. +1 em ataques.',
        equipped: true,
        consumable: false,
      },
      {
        id: crypto.randomUUID(),
        name: 'Poção de Cura Menor',
        quantity: 2,
        description: 'Restaura 5 PV.',
        equipped: false,
        consumable: true,
      }
    ],
    customAttributes: [],
    notes: 'Criado no mosteiro de São Arnaldo, treinado pelo prior.',
  },
  modifiers: [
    {
      id: crypto.randomUUID(),
      name: 'Espada Longa',
      description: 'Bônus passivo por empunhar a arma.',
      value: 1,
      origin: 'Equipamento',
      target: 'ataque',
      durationType: 'permanente',
      active: true,
      acquiredPage: 1,
    },
    {
      id: crypto.randomUUID(),
      name: 'Bênção de São Arnaldo',
      description: 'Concede força extra em momentos de necessidade.',
      value: 2,
      origin: 'História',
      target: 'forca',
      durationType: 'usos',
      remainingUses: 1,
      active: false,
      acquiredPage: 1,
    }
  ],
  tests: [],
  combats: [],
  journal: [
    {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      page: 1,
      type: 'nota',
      title: 'Início da Jornada',
      description: 'A aventura começa nos portões do mosteiro.',
      important: true,
    }
  ],
  preferences: {
    muteAudio: false,
    disableAnimations: false,
    colorTheme: 'light'
  }
};
