import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { GameState, JournalEntry, Modifier, TestRecord, Combat, Character, Campaign, Preferences, CombatAction, PageFavorite, CustomAttribute } from './types';
import { initialGameState } from './initial-data';

export type Action =
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'UNDO' }
  | { type: 'UPDATE_CHARACTER'; payload: Partial<Character> }
  | { type: 'ADD_CUSTOM_ATTRIBUTE'; payload: CustomAttribute }
  | { type: 'UPDATE_CUSTOM_ATTRIBUTE'; payload: Partial<Pick<CustomAttribute, 'name' | 'value'>> & { id: string } }
  | { type: 'REMOVE_CUSTOM_ATTRIBUTE'; payload: string }
  | { type: 'UPDATE_CAMPAIGN'; payload: Partial<Campaign> }
  | { type: 'CLEAR_PAGE_HISTORY' }
  | { type: 'ADD_PAGE_FAVORITE'; payload: PageFavorite }
  | { type: 'UPDATE_PAGE_FAVORITE'; payload: Pick<PageFavorite, 'id' | 'name'> }
  | { type: 'REMOVE_PAGE_FAVORITE'; payload: string }
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

export type StoreState = {
  past: GameState[];
  present: GameState;
};

const MAX_HISTORY = 10;
const MAX_PAGE_HISTORY = 12;

export function normalizeState(state: GameState, now = new Date().toISOString()): GameState {
  const savedPageHistory = Array.isArray(state.campaign.pageHistory)
    ? state.campaign.pageHistory.filter(page => Number.isInteger(page) && page > 0)
    : [];
  const pageHistory = savedPageHistory.at(-1) === state.campaign.currentPage
    ? savedPageHistory
    : [...savedPageHistory, state.campaign.currentPage];
  const seenAttributeIds = new Set<string>();
  const seenAttributeNames = new Set<string>();
  const customAttributes = Array.isArray(state.character.customAttributes)
    ? state.character.customAttributes.filter(attribute => {
        if (
          typeof attribute?.id !== 'string'
          || attribute.id.length === 0
          || typeof attribute.name !== 'string'
          || attribute.name.trim().length === 0
          || !Number.isFinite(attribute.value)
        ) {
          return false;
        }
        const normalizedName = attribute.name.trim().toLocaleLowerCase('pt-BR');
        if (seenAttributeIds.has(attribute.id) || seenAttributeNames.has(normalizedName)) return false;
        seenAttributeIds.add(attribute.id);
        seenAttributeNames.add(normalizedName);
        return true;
      }).map(attribute => ({ ...attribute, name: attribute.name.trim() }))
    : [];
  const customAttributeIds = new Set(customAttributes.map(attribute => attribute.id));

  return {
    ...state,
    campaign: {
      ...state.campaign,
      pageHistory: pageHistory.slice(-MAX_PAGE_HISTORY),
      pageFavorites: Array.isArray(state.campaign.pageFavorites)
        ? state.campaign.pageFavorites.filter(favorite =>
            typeof favorite?.id === 'string'
            && favorite.id.length > 0
            && Number.isInteger(favorite.page)
            && favorite.page > 0
            && typeof favorite.name === 'string'
            && favorite.name.trim().length > 0
          ).map(favorite => ({ ...favorite, name: favorite.name.trim() }))
        : [],
    },
    character: {
      ...state.character,
      customAttributes,
    },
    preferences: {
      muteAudio: false,
      disableAnimations: false,
      colorTheme: 'light',
      ...state.preferences,
    },
    modifiers: (state.modifiers ?? []).filter(modifier =>
      !modifier.target.startsWith('atributo:')
      || customAttributeIds.has(modifier.target.slice('atributo:'.length))
    ),
    combats: (state.combats ?? []).map(c => {
      const startedAt = c.startedAt ?? now;
      const history = c.history ?? [];
      const rounds = c.rounds?.length
        ? c.rounds.map(round => ({
            ...round,
            actions: [...round.actions],
          }))
        : [{
            round: 1,
            actions: history.map((resultText, index) => ({
              id: `legacy-${index}`,
              timestamp: startedAt,
              round: 1,
              actor: 'system',
              target: 'none',
              kind: 'note' as const,
              resultText,
            })),
          }];

      return { ...c, history: [...history], startedAt, rounds };
    }),
  };
}

export function gameReducer(state: StoreState, action: Action): StoreState {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    const newPast = state.past.slice(0, state.past.length - 1);
    return { past: newPast, present: previous };
  }

  if (action.type === 'SET_STATE') {
    return { past: [], present: normalizeState(action.payload) };
  }

  const pushHistory = (newState: GameState, skipHistory = false): StoreState => {
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

    case 'ADD_CUSTOM_ATTRIBUTE':
      if (
        action.payload.name.trim().length === 0
        || !Number.isFinite(action.payload.value)
        || current.character.customAttributes.some(attribute =>
          attribute.name.toLocaleLowerCase('pt-BR')
            === action.payload.name.trim().toLocaleLowerCase('pt-BR')
        )
      ) {
        return state;
      }
      return pushHistory({
        ...current,
        character: {
          ...current.character,
          customAttributes: [...current.character.customAttributes, {
            ...action.payload,
            name: action.payload.name.trim(),
          }],
        },
      });

    case 'UPDATE_CUSTOM_ATTRIBUTE':
      if (
        (action.payload.name !== undefined && (
          action.payload.name.trim().length === 0
          || current.character.customAttributes.some(attribute =>
            attribute.id !== action.payload.id
            && attribute.name.toLocaleLowerCase('pt-BR')
              === action.payload.name!.trim().toLocaleLowerCase('pt-BR')
          )
        ))
        || (action.payload.value !== undefined && !Number.isFinite(action.payload.value))
      ) {
        return state;
      }
      return pushHistory({
        ...current,
        character: {
          ...current.character,
          customAttributes: current.character.customAttributes.map(attribute =>
            attribute.id === action.payload.id
              ? { ...attribute, ...action.payload, name: action.payload.name?.trim() ?? attribute.name }
              : attribute
          ),
        },
      });

    case 'REMOVE_CUSTOM_ATTRIBUTE':
      return pushHistory({
        ...current,
        character: {
          ...current.character,
          customAttributes: current.character.customAttributes.filter(attribute => attribute.id !== action.payload),
        },
        modifiers: current.modifiers.filter(modifier => modifier.target !== `atributo:${action.payload}`),
      });
    
    case 'UPDATE_CAMPAIGN':
      {
        const currentPage = action.payload.currentPage;
        const existingPageHistory = current.campaign.pageHistory ?? [current.campaign.currentPage];
        const pageHistory = currentPage !== undefined && existingPageHistory.at(-1) !== currentPage
          ? [...existingPageHistory, currentPage].slice(-MAX_PAGE_HISTORY)
          : existingPageHistory;

        return pushHistory({
          ...current,
          campaign: { ...current.campaign, ...action.payload, pageHistory },
        });
      }

    case 'CLEAR_PAGE_HISTORY':
      return pushHistory({
        ...current,
        campaign: { ...current.campaign, pageHistory: [current.campaign.currentPage] },
      });

    case 'ADD_PAGE_FAVORITE':
      return pushHistory({
        ...current,
        campaign: {
          ...current.campaign,
          pageFavorites: [...(current.campaign.pageFavorites ?? []), action.payload],
        },
      });

    case 'UPDATE_PAGE_FAVORITE':
      return pushHistory({
        ...current,
        campaign: {
          ...current.campaign,
          pageFavorites: (current.campaign.pageFavorites ?? []).map(favorite =>
            favorite.id === action.payload.id
              ? { ...favorite, name: action.payload.name.trim() }
              : favorite
          ),
        },
      });

    case 'REMOVE_PAGE_FAVORITE':
      return pushHistory({
        ...current,
        campaign: {
          ...current.campaign,
          pageFavorites: (current.campaign.pageFavorites ?? []).filter(favorite => favorite.id !== action.payload),
        },
      });

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

function getInitialStoreState(): StoreState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.campaign) {
        return { past: [], present: normalizeState(parsed) };
      }
    }
  } catch (error) {
    console.error('Failed to load save', error);
  }

  return { past: [], present: initialGameState };
}

const GameStateContext = createContext<{
  state: GameState;
  canUndo: boolean;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, undefined, getInitialStoreState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.present));
  }, [state.present]);

  useEffect(() => {
    const isNight = state.present.preferences?.colorTheme === 'night';
    document.documentElement.classList.toggle('dark', isNight);
    document.documentElement.style.colorScheme = isNight ? 'dark' : 'light';
  }, [state.present.preferences?.colorTheme]);

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
