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

export type Campaign = {
  version: number;
  id: string;
  name: string;
  currentPage: number;
  createdAt: string;
  updatedAt: string;
};

export type TestRecord = {
  id: string;
  timestamp: string;
  type: string; // e.g. "Teste de Força", "Teste de Habilidade"
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

export type Combat = {
  id: string;
  round: number;
  enemies: Enemy[];
  history: string[];
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

export type GameState = {
  campaign: Campaign;
  character: Character;
  modifiers: Modifier[];
  tests: TestRecord[];
  combats: Combat[];
  journal: JournalEntry[];
};
