import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { gameReducer, normalizeState, type Action, type StoreState } from './store';
import type { Combat, CombatAction, GameState } from './types';

const timestamp = '2026-09-15T12:00:00.000Z';

function makeCombat(overrides: Partial<Combat> = {}): Combat {
  return {
    id: 'combat-1',
    startedAt: timestamp,
    round: 1,
    enemies: [],
    rounds: [{ round: 1, actions: [] }],
    history: [],
    active: true,
    ...overrides,
  };
}

function makeGame(combat = makeCombat()): GameState {
  return {
    campaign: {
      version: 1,
      id: 'campaign-1',
      name: 'Teste',
      currentPage: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    character: {
      name: 'Herói',
      forca: 8,
      habilidade: 7,
      pvAtual: 20,
      pvMax: 20,
      pmAtual: 5,
      pmMax: 5,
      dinheiro: 0,
      skills: [],
      inventory: [],
      notes: '',
    },
    modifiers: [],
    tests: [],
    combats: [combat],
    journal: [],
    preferences: { muteAudio: false, disableAnimations: false },
  };
}

function reduce(state: StoreState, action: Action): StoreState {
  return gameReducer(state, action);
}

function action(id: string, round: number, pvChange?: number): CombatAction {
  return {
    id,
    timestamp,
    round,
    actor: 'system',
    target: 'enemy-1',
    kind: pvChange !== undefined && pvChange > 0 ? 'heal' : 'damage',
    resultText: `alteração ${pvChange ?? 0}`,
    pvChange,
  };
}

describe('histórico estruturado de combate', () => {
  it('registra valores arbitrários de dano e cura sem alterar o valor', () => {
    const changes = [-999, -37, -1, 1, 42, 999];
    let state: StoreState = { past: [], present: makeGame() };

    for (const [index, change] of changes.entries()) {
      state = reduce(state, {
        type: 'ADD_COMBAT_ACTION',
        payload: { combatId: 'combat-1', action: action(`pv-${index}`, 1, change) },
      });
    }

    const recorded = state.present.combats[0].rounds![0].actions;
    assert.deepEqual(recorded.map(item => item.pvChange), [...changes].reverse());
    assert.deepEqual(recorded.map(item => item.kind), ['heal', 'heal', 'heal', 'damage', 'damage', 'damage']);
  });

  it('mantém ações de rodadas anteriores ao avançar', () => {
    let state: StoreState = { past: [], present: makeGame() };
    state = reduce(state, {
      type: 'ADD_COMBAT_ACTION',
      payload: { combatId: 'combat-1', action: action('round-1', 1, -4) },
    });
    state = reduce(state, {
      type: 'UPDATE_COMBAT',
      payload: { id: 'combat-1', round: 2 },
    });
    state = reduce(state, {
      type: 'ADD_COMBAT_ACTION',
      payload: { combatId: 'combat-1', action: action('round-2', 2, 3) },
    });

    const combat = state.present.combats[0];
    assert.equal(combat.round, 2);
    assert.deepEqual(combat.rounds!.map(round => round.round), [2, 1]);
    assert.equal(combat.rounds!.find(round => round.round === 1)!.actions[0].id, 'round-1');
  });

  it('preserva ações e detalhes ao encerrar o combate', () => {
    const combat = makeCombat({
      enemies: [{ id: 'enemy-1', name: 'Ogro', pvAtual: 6, pvMax: 18, attackModifier: 3 }],
      rounds: [{ round: 1, actions: [action('hit', 1, -12)] }],
    });
    const ended = reduce(
      { past: [], present: makeGame(combat) },
      { type: 'END_COMBAT', payload: combat.id },
    ).present.combats[0];

    assert.equal(ended.active, false);
    assert.ok(ended.endedAt);
    assert.deepEqual(ended.enemies, combat.enemies);
    assert.deepEqual(ended.rounds, combat.rounds);
  });

  it('migra salvamentos antigos sem perder linhas do histórico', () => {
    const legacy = makeGame(makeCombat({
      startedAt: undefined,
      rounds: undefined,
      history: ['Ogro entrou no combate.', 'Herói causou 7 de dano.'],
      active: false,
    }));
    legacy.preferences = undefined;

    const migrated = normalizeState(legacy, timestamp);
    const migratedCombat = migrated.combats[0];

    assert.equal(migratedCombat.startedAt, timestamp);
    assert.deepEqual(migratedCombat.history, legacy.combats[0].history);
    assert.deepEqual(
      migratedCombat.rounds![0].actions.map(item => item.resultText),
      legacy.combats[0].history,
    );
    assert.deepEqual(migrated.preferences, {
      muteAudio: false,
      disableAnimations: false,
      colorTheme: 'light',
    });
    assert.equal(legacy.combats[0].rounds, undefined);
    assert.equal(legacy.preferences, undefined);
  });

  it('mantém o mesmo combate após exportação, importação e recarga', () => {
    const original = makeGame(makeCombat({
      endedAt: timestamp,
      active: false,
      round: 2,
      enemies: [{ id: 'enemy-1', name: 'Ogro', pvAtual: 2, pvMax: 18, attackModifier: 3 }],
      rounds: [
        { round: 2, actions: [action('heal', 2, 2)] },
        { round: 1, actions: [action('damage', 1, -16)] },
      ],
    }));

    const exported = JSON.stringify(original);
    const imported = normalizeState(JSON.parse(exported), timestamp);
    const reloaded = normalizeState(JSON.parse(JSON.stringify(imported)), timestamp);

    assert.deepEqual(imported.combats, original.combats);
    assert.deepEqual(reloaded.combats, original.combats);
  });
});