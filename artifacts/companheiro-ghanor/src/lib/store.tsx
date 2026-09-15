import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { GameState, JournalEntry, Modifier, TestRecord, Combat, Character, Campaign } from './types';
import { initialGameState } from './initial-data';

type Action = 
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'UNDO' }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'UPDATE_CAMPAIGN'; payload: Partial<Campaign> }
  | { type: 'ADD_MODIFIER'; payload: Modifier }
  | { type: 'UPDATE_MODIFIER'; payload: Partial<Modifier> & { id: string } }
  | { type: 'REMOVE_MODIFIER'; payload: string }
  | { type: 'ADD_TEST'; payload: TestRecord }
  | { type: 'ADD_JOURNAL'; payload: JournalEntry }
  | { type: 'START_COMBAT'; payload: Combat }
  | { type: 'UPDATE_COMBAT'; payload: Partial<Combat> & { id: string } }
  | { type: 'END_COMBAT'; payload: string };

type State = {
  past: GameState[];
  present: GameState;
};

const MAX_HISTORY = 10;

function gameReducer(state: State, action: Action): State {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    return { past: newPast, present: previous };
  }

  if (action.type === 'SET_STATE') {
    return { past: [], present: action.payload };
  }

  const pushHistory = (newState: GameState): State => {
    const newPast = [...state.past, state.present].slice(-MAX_HISTORY);
    return { past: newPast, present: { ...newState, campaign: { ...newState.campaign, updatedAt: new Date().toISOString() } } };
  };

  const current = state.present;

  switch (action.type) {
    case 'UPDATE_CHARACTER':
      return pushHistory({ ...current, character: { ...current.character, ...action.payload } });
    
    case 'UPDATE_CAMPAIGN':
      return pushHistory({ ...current, campaign: { ...current.campaign, ...action.payload } });

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

    case 'END_COMBAT':
      return pushHistory({
        ...current,
        combats: current.combats.map(c => c.id === action.payload ? { ...c, active: false } : c)
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

  // Load from local storage on mount
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

  // Save to local storage on change
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
