import { useState } from "react";
import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sword, Plus, Heart, User, Skull, ChevronRight, Activity, MessageSquare, History, Dices, ChevronDown, ChevronUp } from "lucide-react";
import { Enemy, CombatAction } from "@/lib/types";
import { DiceRoller } from "@/components/dice-roller";

function ActionDisplay({ action }: { action: CombatAction }) {
  if (action.kind === 'attack' || action.kind === 'magic') {
    return (
      <div className="p-3 bg-card rounded border border-border/50 shadow-sm text-sm">
        <div className="font-bold flex items-center gap-2 mb-1">
          <Dices className="h-4 w-4 text-accent" /> 
          <span className={action.kind === 'magic' ? 'text-sky-700' : 'text-primary'}>
            {action.kind === 'attack' ? 'Ataque' : 'Magia'}
          </span> 
          <span className="text-muted-foreground font-normal">→ Total:</span>
          <span className="text-lg text-accent">{action.total}</span>
        </div>
        <div className="text-muted-foreground text-xs font-mono leading-relaxed">{action.resultText}</div>
      </div>
    );
  }
  if (action.kind === 'damage') {
    return (
      <div className="p-3 bg-card rounded border border-border/50 shadow-sm text-sm">
        <div className="text-destructive font-bold flex items-center gap-2">
          <Sword className="h-4 w-4" /> 
          <span className="leading-relaxed">{action.resultText}</span>
        </div>
      </div>
    );
  }
  if (action.kind === 'heal') {
    return (
      <div className="p-3 bg-card rounded border border-border/50 shadow-sm text-sm">
        <div className="text-success font-bold flex items-center gap-2">
          <Plus className="h-4 w-4" /> 
          <span className="leading-relaxed">{action.resultText}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="p-3 bg-card rounded border border-border/50 shadow-sm text-sm">
      <div className="text-muted-foreground flex items-start gap-2">
        <MessageSquare className="h-4 w-4 mt-0.5 shrink-0" /> 
        <span className="leading-relaxed">{action.resultText}</span>
      </div>
    </div>
  );
}

function EnemyRow({ 
  enemy, 
  isSelected, 
  onSelect, 
  onUpdatePV 
}: { 
  enemy: Enemy; 
  isSelected: boolean; 
  onSelect: () => void; 
  onUpdatePV: (id: string, amount: number) => void;
}) {
  const isDead = enemy.pvAtual <= 0;
  const [dmg, setDmg] = useState<number | ''>('');
  const [heal, setHeal] = useState<number | ''>('');

  return (
    <Card className={`game-surface-sunken transition-all ${isDead ? "opacity-60 grayscale" : ""} ${isSelected ? 'ring-2 ring-primary shadow-lg shadow-primary/30' : ''}`}>
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center">
          <div 
            className="flex-1 p-4 cursor-pointer hover:bg-foreground/5 transition-colors"
            onClick={onSelect}
          >
            <h4 className="font-bold text-xl font-serif flex items-center gap-2">
              {isSelected && <ChevronRight className="h-5 w-5 text-primary" />}
              {enemy.name}
            </h4>
            <span className="text-sm text-muted-foreground flex items-center mt-1">
              <Sword className="h-3 w-3 mr-1"/> Ataque: {enemy.attackModifier > 0 ? `+${enemy.attackModifier}` : enemy.attackModifier}
            </span>
          </div>
          
          <div className="p-4 bg-secondary/30 border-t sm:border-t-0 sm:border-l border-border/50 flex flex-col items-center gap-3 justify-center">
            <div className="text-center min-w-[4rem] bg-background py-1 px-3 rounded border border-border shadow-inner">
              <span className="text-2xl font-bold block leading-none">{enemy.pvAtual}</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{enemy.pvMax} MAX</span>
            </div>
            
            {!isDead && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    placeholder="Dano" 
                    value={dmg} 
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setDmg(isNaN(val) ? '' : val);
                    }} 
                    className="w-16 h-8 text-xs bg-background text-center px-1" 
                  />
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-8 w-8 shrink-0" 
                    onClick={() => { 
                      if(typeof dmg === 'number' && !isNaN(dmg)) { 
                        onUpdatePV(enemy.id, -dmg); 
                        setDmg(''); 
                      } 
                    }}
                  >
                    <Sword className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Input 
                    type="number" 
                    placeholder="Cura" 
                    value={heal} 
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setHeal(isNaN(val) ? '' : val);
                    }} 
                    className="w-16 h-8 text-xs bg-background text-center px-1" 
                  />
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 shrink-0 text-success border-success/50 hover:bg-success/10"
                    onClick={() => { 
                      if(typeof heal === 'number' && !isNaN(heal)) { 
                        onUpdatePV(enemy.id, heal); 
                        setHeal(''); 
                      } 
                    }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Combat() {
  const { state, dispatch } = useGame();
  
  const activeCombat = state.combats.find(c => c.active);
  const [newEnemyName, setNewEnemyName] = useState("");
  const [newEnemyPV, setNewEnemyPV] = useState(10);
  const [newEnemyAtk, setNewEnemyAtk] = useState(0);

  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'attack' | 'magic'>('attack');
  const [manualDamage, setManualDamage] = useState<number | ''>('');
  const [manualHeal, setManualHeal] = useState<number | ''>('');
  const [combatNote, setCombatNote] = useState("");
  const [rolling, setRolling] = useState(false);
  const [manualD1, setManualD1] = useState<number | ''>('');
  const [manualD2, setManualD2] = useState<number | ''>('');
  
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});

  const activeModifiers = state.modifiers.filter(m => m.active);

  const startCombat = () => {
    dispatch({
      type: "START_COMBAT",
      payload: {
        id: crypto.randomUUID(),
        startedAt: new Date().toISOString(),
        round: 1,
        enemies: [],
        rounds: [{ round: 1, actions: [] }],
        history: [],
        active: true
      }
    });
  };

  const endCombat = () => {
    if (activeCombat) {
      dispatch({ type: "END_COMBAT", payload: activeCombat.id });
    }
  };

  const toggleHistory = (id: string) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addAction = (action: Partial<CombatAction>) => {
    if (!activeCombat) return;
    const fullAction: CombatAction = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      round: activeCombat.round,
      actor: action.actor || 'system',
      target: action.target || 'none',
      kind: action.kind || 'note',
      resultText: action.resultText || '',
      ...action
    };

    dispatch({
      type: 'ADD_COMBAT_ACTION',
      payload: { combatId: activeCombat.id, action: fullAction }
    });
  };

  const addEnemy = () => {
    if (!activeCombat || !newEnemyName) return;
    const enemy: Enemy = {
      id: crypto.randomUUID(),
      name: newEnemyName,
      pvAtual: newEnemyPV,
      pvMax: newEnemyPV,
      attackModifier: newEnemyAtk
    };
    dispatch({
      type: "UPDATE_COMBAT",
      payload: {
        id: activeCombat.id,
        enemies: [...activeCombat.enemies, enemy],
      }
    });
    addAction({
      actor: 'system',
      kind: 'enemy_added',
      resultText: `${enemy.name} entrou no combate.`
    });
    setNewEnemyName("");
  };

  const updateEnemyPV = (enemyId: string, amount: number) => {
    if (!activeCombat) return;
    const enemy = activeCombat.enemies.find(e => e.id === enemyId);
    if (!enemy) return;

    const newPV = Math.max(0, Math.min(enemy.pvMax, enemy.pvAtual + amount));
    const actualChange = newPV - enemy.pvAtual;
    if (actualChange === 0) return;

    const enemies = activeCombat.enemies.map(e => e.id === enemyId ? { ...e, pvAtual: newPV } : e);
    
    dispatch({
      type: "UPDATE_COMBAT",
      payload: { id: activeCombat.id, enemies }
    });

    addAction({
      actor: 'system',
      target: enemy.id,
      kind: amount < 0 ? 'damage' : 'heal',
      pvChange: actualChange,
      resultText: amount < 0 ? `${enemy.name} sofreu ${Math.abs(actualChange)} de dano.` : `${enemy.name} recuperou ${actualChange} PV.`
    });
  };

  const nextRound = () => {
    if (!activeCombat) return;
    dispatch({
      type: "UPDATE_COMBAT",
      payload: { id: activeCombat.id, round: activeCombat.round + 1 }
    });
    addAction({
      actor: 'system',
      kind: 'round_advance',
      round: activeCombat.round + 1,
      resultText: `Rodada ${activeCombat.round + 1} iniciada.`
    });
  };

  const handlePlayerDamageOrHeal = (amount: number, type: 'damage' | 'heal') => {
    const newPV = type === 'damage' 
      ? Math.max(0, state.character.pvAtual - amount)
      : Math.min(state.character.pvMax, state.character.pvAtual + amount);
      
    const actualChange = newPV - state.character.pvAtual;
    if (actualChange === 0) return;

    dispatch({
      type: "UPDATE_CHARACTER",
      payload: { pvAtual: newPV }
    });

    if (activeCombat) {
      addAction({
        actor: 'system',
        target: 'hero',
        kind: type,
        pvChange: actualChange,
        resultText: type === 'damage' ? `${state.character.name} sofreu ${Math.abs(actualChange)} de dano.` : `${state.character.name} recuperou ${actualChange} PV.`
      });
    }
  };

  const addNote = () => {
    if (!combatNote.trim() || !activeCombat) return;
    addAction({
      actor: 'hero',
      kind: 'note',
      resultText: combatNote.trim()
    });
    setCombatNote("");
  };

  const processAttack = (d1: number, d2: number) => {
    if (!activeCombat) return;
    
    let baseAttr = actionType === 'attack' ? state.character.forca : state.character.habilidade;
    let applicableMods = activeModifiers.filter(m => {
      if (actionType === 'attack') return ['forca', 'ataque', 'qualquer'].includes(m.target);
      return ['habilidade', 'dano', 'qualquer'].includes(m.target);
    });

    const modSum = applicableMods.reduce((acc, m) => acc + m.value, 0);
    const total = d1 + d2 + baseAttr + modSum;

    let targetName = "Ninguém";
    if (selectedTargetId === 'hero') targetName = state.character.name;
    else if (selectedTargetId) {
      const e = activeCombat.enemies.find(e => e.id === selectedTargetId);
      if (e) targetName = e.name;
    }

    const typeLabel = actionType === 'attack' ? 'Ataque' : 'Magia';

    addAction({
      actor: 'hero',
      target: selectedTargetId || 'none',
      kind: actionType,
      dice: [d1, d2],
      modifiers: applicableMods.map(m => m.id),
      total,
      resultText: `${typeLabel} contra ${targetName}: [${d1}+${d2}] + ${baseAttr}(Base) + ${modSum}(Mods) = ${total}`
    });
  };

  const handleManualRoll = () => {
    if (typeof manualD1 !== 'number' || typeof manualD2 !== 'number') return;
    processAttack(manualD1, manualD2);
    setManualD1('');
    setManualD2('');
  };

  if (!activeCombat) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in fade-in">
        <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center shadow-inner border border-primary/20">
          <Sword className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-4xl font-serif text-accent drop-shadow-md">Combate</h2>
        <p className="text-muted-foreground max-w-md text-lg leading-relaxed">
          Inicie um combate estruturado. Gerencie inimigos, role ataques, aplique danos e preserve o histórico de cada rodada.
        </p>
        <Button size="lg" onClick={startCombat} className="mt-4 shadow-lg shadow-primary/20 text-lg px-8">
          Iniciar Combate
        </Button>

        {state.combats.length > 0 && (
          <div className="mt-16 w-full text-left max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl font-serif flex items-center gap-2 text-accent">
              <History className="h-6 w-6" /> Histórico de Combates
            </h3>
            <div className="space-y-3">
              {state.combats.filter(c => !c.active).map(c => (
                <Card key={c.id} className="game-surface-sunken transition-all">
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div 
                      className="flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleHistory(c.id)}
                    >
                      <div className="flex-1">
                        <span className="font-bold text-lg font-serif block">Combate finalizado</span>
                        <span className="text-sm text-muted-foreground mt-1 block">
                          {c.startedAt ? new Date(c.startedAt).toLocaleDateString() : 'Data desconhecida'} - Inimigos: {c.enemies.map(e => e.name).join(", ") || "Nenhum"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full border border-border whitespace-nowrap">
                          {c.round} rodadas
                        </span>
                        <div className="p-1 bg-secondary rounded border border-border">
                          {expandedHistory[c.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>
                    </div>
                    
                    {expandedHistory[c.id] && (
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-6 animate-in slide-in-from-top-2">
                        {[...(c.rounds || [])].reverse().map(roundObj => (
                          <div key={roundObj.round} className="space-y-3">
                            <h4 className="font-serif text-accent border-b border-border/50 pb-1 text-sm">
                              Rodada {roundObj.round}
                            </h4>
                            {roundObj.actions.length === 0 ? (
                              <div className="text-muted-foreground text-xs italic font-serif">Nenhuma ação registrada.</div>
                            ) : (
                              roundObj.actions.map(action => (
                                <ActionDisplay key={action.id} action={action} />
                              ))
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const allRoundsReversed = [...(activeCombat.rounds || [])].reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 game-surface-raised p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
        <div>
          <h2 className="text-3xl font-serif text-accent flex items-center gap-3">
            <Sword className="h-6 w-6 text-destructive" />
            Em Combate
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <span className="bg-destructive/20 text-destructive font-bold px-3 py-1 rounded-md text-sm border border-destructive/30">
              Rodada {activeCombat.round}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={nextRound} className="border-accent text-accent hover:bg-accent/10">
            Nova Rodada
          </Button>
          <Button variant="destructive" onClick={endCombat} className="shadow-lg shadow-destructive/20">
            Encerrar Combate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className={`game-surface-raised border-2 ${selectedTargetId === 'hero' ? 'border-primary shadow-lg shadow-primary/30' : 'border-border'}`}>
            <CardHeader className="pb-3 border-b border-border/50 bg-secondary/50">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedTargetId('hero')}>
                <CardTitle className="text-2xl font-serif flex items-center gap-2">
                  <User className="h-6 w-6" /> {state.character.name}
                </CardTitle>
                <div className="bg-background px-4 py-2 rounded-lg border border-border flex items-center gap-2 shadow-inner">
                  <Heart className="h-5 w-5 text-destructive" /> 
                  <span className="text-xl font-bold">{state.character.pvAtual}</span>
                  <span className="text-muted-foreground">/{state.character.pvMax}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-1 w-32">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Aplicar Dano</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Qtd" 
                      value={manualDamage} 
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setManualDamage(isNaN(val) ? '' : val);
                      }} 
                      className="bg-background"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => { if(typeof manualDamage === 'number' && !isNaN(manualDamage)) { handlePlayerDamageOrHeal(manualDamage, 'damage'); setManualDamage(''); } }}
                    >
                      <Sword className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1 w-32">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Cura</Label>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Qtd" 
                      value={manualHeal} 
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        setManualHeal(isNaN(val) ? '' : val);
                      }} 
                      className="bg-background"
                    />
                    <Button 
                      variant="outline" 
                      className="text-success border-success/50 hover:bg-success/10"
                      size="icon"
                      onClick={() => { if(typeof manualHeal === 'number' && !isNaN(manualHeal)) { handlePlayerDamageOrHeal(manualHeal, 'heal'); setManualHeal(''); } }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-2xl font-serif text-accent flex items-center gap-2 mb-4">
              <Skull className="h-6 w-6" /> Inimigos
            </h3>
            
            {activeCombat.enemies.map(enemy => (
              <EnemyRow 
                key={enemy.id} 
                enemy={enemy} 
                isSelected={selectedTargetId === enemy.id} 
                onSelect={() => { if (enemy.pvAtual > 0) setSelectedTargetId(enemy.id); }} 
                onUpdatePV={updateEnemyPV} 
              />
            ))}

            <Card className="border-dashed border-2 border-border/50 bg-transparent">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[150px] space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Novo Inimigo</Label>
                    <Input value={newEnemyName} onChange={e => setNewEnemyName(e.target.value)} placeholder="Nome..." className="bg-background" />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">PV</Label>
                    <Input type="number" value={newEnemyPV} onChange={e => setNewEnemyPV(parseInt(e.target.value)||1)} className="bg-background" />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs uppercase text-muted-foreground">Atq</Label>
                    <Input type="number" value={newEnemyAtk} onChange={e => setNewEnemyAtk(parseInt(e.target.value)||0)} className="bg-background" />
                  </div>
                  <Button onClick={addEnemy} variant="secondary"><Plus className="h-4 w-4 mr-2"/> Adicionar</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="game-surface-raised overflow-visible">
            <CardHeader className="bg-secondary/50 border-b border-border pb-4 rounded-t-xl">
              <CardTitle className="text-xl font-serif flex justify-between items-center">
                Ação
                {selectedTargetId && (
                  <span className="text-sm font-sans font-normal bg-primary/20 text-primary-foreground px-2 py-1 rounded border border-primary/30">
                    Alvo selecionado
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-6">
              <div className="flex gap-2 p-1 bg-background rounded-lg border border-border/50">
                <Button 
                  variant={actionType === 'attack' ? "default" : "ghost"} 
                  className={`flex-1 ${actionType === 'attack' ? 'shadow-md' : ''}`}
                  onClick={() => setActionType('attack')}
                >
                  Ataque Físico
                </Button>
                <Button 
                  variant={actionType === 'magic' ? "default" : "ghost"} 
                  className={`flex-1 ${actionType === 'magic' ? 'bg-sky-700 hover:bg-sky-800 shadow-md text-white' : ''}`}
                  onClick={() => setActionType('magic')}
                >
                  Magia
                </Button>
              </div>

              <div className="bg-background p-4 rounded-lg border border-border/50 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Atributo Base:</span>
                  <span className="font-bold text-accent">
                    {actionType === 'attack' ? `Força (${state.character.forca})` : `Habilidade (${state.character.habilidade})`}
                  </span>
                </div>
                
                {activeModifiers.length > 0 && (
                  <div className="pt-2 border-t border-border/50">
                    <span className="text-xs uppercase text-muted-foreground font-bold mb-2 block">Modificadores Ativos</span>
                    {activeModifiers.map(m => {
                      const applies = actionType === 'attack' 
                        ? ['forca', 'ataque', 'qualquer'].includes(m.target)
                        : ['habilidade', 'dano', 'qualquer'].includes(m.target);
                      if (!applies) return null;
                      return (
                        <div key={m.id} className="flex justify-between text-sm py-1">
                          <span>{m.name}</span>
                          <span className="text-primary font-bold">+{m.value}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <DiceRoller onRoll={processAttack} rolling={rolling} setRolling={setRolling} />

              <div className="flex gap-2 items-center border-t border-border/50 pt-4">
                <span className="text-xs text-muted-foreground uppercase whitespace-nowrap">Rolar manual:</span>
                <Input 
                  type="number" 
                  min="1" 
                  max="6" 
                  value={manualD1} 
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setManualD1(isNaN(val) ? '' : val);
                  }} 
                  className="h-8 w-12 text-center px-1 bg-background" 
                />
                <Input 
                  type="number" 
                  min="1" 
                  max="6" 
                  value={manualD2} 
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setManualD2(isNaN(val) ? '' : val);
                  }} 
                  className="h-8 w-12 text-center px-1 bg-background" 
                />
                <Button 
                  size="sm" 
                  variant="secondary" 
                  onClick={handleManualRoll} 
                  disabled={typeof manualD1 !== 'number' || typeof manualD2 !== 'number' || isNaN(manualD1) || isNaN(manualD2)}
                >
                  Ok
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="game-surface-sunken flex flex-col h-[400px]">
            <CardHeader className="py-3 px-4 border-b border-border bg-secondary/80 sticky top-0 z-10">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Log de Combate
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 font-sans">
              {allRoundsReversed.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-10 italic font-serif">
                  Nenhuma ação registrada neste combate.
                </div>
              ) : (
                allRoundsReversed.map(roundObj => (
                  <div key={roundObj.round} className="space-y-3">
                    <h4 className="font-serif text-accent border-b border-border/50 pb-1 flex justify-between items-center">
                      <span>Rodada {roundObj.round}</span>
                      {roundObj.round === activeCombat.round && <span className="text-[10px] bg-primary/20 text-primary-foreground px-2 py-0.5 rounded font-sans uppercase tracking-wider font-bold">Atual</span>}
                    </h4>
                    {roundObj.actions.length === 0 ? (
                       <div className="text-muted-foreground text-xs italic font-serif">Nenhuma ação registrada nesta rodada.</div>
                    ) : (
                      roundObj.actions.map(action => (
                        <ActionDisplay key={action.id} action={action} />
                      ))
                    )}
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="p-3 border-t border-border bg-card">
              <div className="flex w-full gap-2">
                <Input 
                  placeholder="Adicionar nota ao log..." 
                  value={combatNote}
                  onChange={e => setCombatNote(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addNote()}
                  className="bg-background h-9"
                />
                <Button size="sm" variant="secondary" onClick={addNote}>Salvar</Button>
              </div>
            </CardFooter>
          </Card>
          
        </div>
      </div>
    </div>
  );
}
