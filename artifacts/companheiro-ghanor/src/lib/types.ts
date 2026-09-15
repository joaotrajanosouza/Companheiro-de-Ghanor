export type DurationType = 'permanente' | 'combate' | 'rodada' | 'pagina' | 'usos' | 'manual' | 'instantaneo';
export type TargetType = 'forca' | 'habilidade' | 'ataque' | 'iniciativa' | 'dano' | 'qualquer';

export type Modifier = {
  id: string;
  name: string;
  description: string;
  value: number;
  origin: string;
  target: TargetType;
  durationType: DurationType;
  remainingUses?: number;
  expiresAtPage?: number;
  active: boolean;
  acquiredPage: number;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  bonus: number;
};

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  description: string;
  equipped: boolean;
  consumable: boolean;
};

export type Character = {
  name: string;
  forca: number;
  habilidade: number;
  pvAtual: number;
  pvMax: number;
  pmAtual: number;
  pmMax: number;
  dinheiro: number;
  skills: Skill[];
  inventory: InventoryItem[];
  notes: string;
};

export type PageFavorite = {
  id: string;
  page: number;
  name: string;
};

export type Campaign = {
  version: number;
  id: string;
  name: string;
  currentPage: number;
  pageHistory?: number[];
  pageFavorites?: PageFavorite[];
  createdAt: string;
  updatedAt: string;
};

export type TestRecord = {
  id: string;
  timestamp: string;
  type: string;
  die1: number;
  die2: number;
  attributeValue: number;
  modifierIds: string[];
  total: number;
  success: boolean | null;
  notes: string;
};

export type Enemy = {
  id: string;
  name: string;
  pvAtual: number;
  pvMax: number;
  attackModifier: number;
};

export type CombatActionKind = 'attack' | 'magic' | 'damage' | 'heal' | 'note' | 'enemy_added' | 'roll' | 'round_advance';

export type CombatAction = {
  id: string;
  timestamp: string;
  round: number;
  actor: string;
  target: string;
  kind: CombatActionKind;
  dice?: [number, number];
  modifiers?: string[];
  total?: number;
  resultText: string;
  pvChange?: number;
};

export type CombatRound = {
  round: number;
  actions: CombatAction[];
};

export type Combat = {
  id: string;
  startedAt?: string;
  endedAt?: string;
  round: number;
  enemies: Enemy[];
  rounds?: CombatRound[]; // optional for legacy
  history: string[]; // Legacy
  active: boolean;
};

export type JournalEntry = {
  id: string;
  timestamp: string;
  page: number;
  type: 'nota' | 'escolha' | 'teste' | 'combate' | 'recurso' | 'modificador';
  title: string;
  description: string;
  important: boolean;
};

export type Preferences = {
  muteAudio: boolean;
  disableAnimations: boolean;
  colorTheme: 'light' | 'night';
};

export type GameState = {
  campaign: Campaign;
  character: Character;
  modifiers: Modifier[];
  tests: TestRecord[];
  combats: Combat[];
  journal: JournalEntry[];
  preferences?: Preferences;
};
