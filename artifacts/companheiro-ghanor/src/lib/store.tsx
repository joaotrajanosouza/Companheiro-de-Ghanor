import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { GameState, JournalEntry, Modifier, TestRecord, Combat, Character, Campaign, Preferences, CombatAction, CombatRound } from './types';
import { initialGameState } from './initial-data';

type Action = 
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'UNDO' }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'UPDATE_CAMPAIGN'; payload: Partial<Campaign> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<Preferences> }
  | { type: 'ADD_MODIFIER'; payload: Modifier }
  | { type: 'UPDATE_MODIFIER'; payload: Partial<Modifier> & { id: string } }
  | { type: 'REMOVE_MODIFIER'; payload: string }
  | { type: 'ADD_TEST'; payload: TestRecord }
  | { type: 'ADD_JOURNAL'; payload: JournalEntry }
  | { type: 'START_COMBAT'; payload: Combat }
  | { type: 'UPDATE_COMBAT'; payload: Partial<Combat> & { id: string } }
  | { type: 'ADD_COMBAT_ACTION'; payload: { combatId: string; action: CombatAction } }
  | { type: 'END_COMBAT'; payload: string };

type State = {
  past: GameState[];
  present: GameState;
};

const MAX_HISTORY = 10;

function normalizeState(state: GameState): GameState {
  // Ensure preferences exist
  if (!state.preferences) {
    state.preferences = { muteAudio: false, disableAnimations: false };
  }

  // Normalize combats
  if (state.combats) {
    state.combats = state.combats.map(c => {
      let rounds = c.rounds;
      if (!rounds || rounds.length === 0) {
        // Convert old history to a single round
        rounds = [{
          round: 1,
          actions: c.history.map((h, i) => ({
            id: `legacy-${i}`,
            timestamp: c.startedAt || new Date().toISOString(),
            round: 1,
            actor: 'system',
            target: 'none',
            kind: 'note',
            resultText: h
          }))
        }];
      }
      return {
        ...c,
        startedAt: c.startedAt || new Date().toISOString(),
        rounds
      };
    });
  }
  return state;
}

function gameReducer(state: State, action: Action): State {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    return { past: newPast, present: previous };
  }

  if (action.type === 'SET_STATE') {
    return { past: [], present: normalizeState(action.payload) };
  }

  const pushHistory = (newState: GameState, skipHistory = false): State => {
    if (skipHistory) {
      return { past: state.past, present: { ...newState, campaign: { ...newState.campaign, updatedAt: new Date().toISOString() } } };
    }
    const newPast = [...state.past, state.present].slice(-MAX_HISTORY);
    return { past: newPast, present: { ...newState, campaign: { ...newState.campaign, updatedAt: new Date().toISOString() } } };
  };

  const current = state.present;

  switch (action.type) {
    case 'UPDATE_CHARACTER':
      return pushHistory({ ...current, character: { ...current.character, ...action.payload } });
    
    case 'UPDATE_CAMPAIGN':
      return pushHistory({ ...current, campaign: { ...current.campaign, ...action.payload } });

    case 'UPDATE_PREFERENCES':
      // Don't clutter history with preference toggles
      return pushHistory({ ...current, preferences: { ...current.preferences!, ...action.payload } }, true);

    case 'ADD_MODIFIER':
      return pushHistory({ ...current, modifiers: [...current.modifiers, action.payload] });

    case 'UPDATE_MODIFIER':
      return pushHistory({
        ...current,
        modifiers: current.modifiers.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m)
      });

    case 'REMOVE_MODIFIER':
      return pushHistory({
        ...current,
        modifiers: current.modifiers.filter(m => m.id !== action.payload)
      });

    case 'ADD_TEST':
      return pushHistory({ ...current, tests: [action.payload, ...current.tests] });

    case 'ADD_JOURNAL':
      return pushHistory({ ...current, journal: [action.payload, ...current.journal] });

    case 'START_COMBAT':
      return pushHistory({ ...current, combats: [action.payload, ...current.combats] });

    case 'UPDATE_COMBAT':
      return pushHistory({
        ...current,
        combats: current.combats.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c)
      });

    case 'ADD_COMBAT_ACTION':
      return pushHistory({
        ...current,
        combats: current.combats.map(c => {
          if (c.id !== action.payload.combatId) return c;
          const targetRoundIndex = (c.rounds || []).findIndex(r => r.round === action.payload.action.round);
          
          let newRounds = [...(c.rounds || [])];
          if (targetRoundIndex >= 0) {
            newRounds[targetRoundIndex] = {
              ...newRounds[targetRoundIndex],
              actions: [action.payload.action, ...newRounds[targetRoundIndex].actions]
            };
          } else {
            newRounds = [{ round: action.payload.action.round, actions: [action.payload.action] }, ...newRounds];
          }
          
          return {
            ...c,
            rounds: newRounds
          };
        })
      });

    case 'END_COMBAT':
      return pushHistory({
        ...current,
        combats: current.combats.map(c => c.id === action.payload ? { ...c, active: false, endedAt: new Date().toISOString() } : c)
      });

    default:
      return state;
  }
}

const STORAGE_KEY = 'ghanor_save_state';

const GameStateContext = createContext<{
  state: GameState;
  canUndo: boolean;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    past: [],
    present: initialGameState
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.campaign) {
          dispatch({ type: 'SET_STATE', payload: parsed });
        }
      } catch (e) {
        console.error('Failed to load save', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.present));
  }, [state.present]);

  return (
    <GameStateContext.Provider value={{ 
      state: state.present, 
      canUndo: state.past.length > 0,
      dispatch 
    }}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameStateContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
