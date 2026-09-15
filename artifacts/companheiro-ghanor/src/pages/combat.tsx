import { useState } from "react";
import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sword, Plus, Trash, Shield, Heart } from "lucide-react";
import { Enemy, Combat as CombatType } from "@/lib/types";

export default function Combat() {
  const { state, dispatch } = useGame();
  
  const activeCombat = state.combats.find(c => c.active);
  const [newEnemyName, setNewEnemyName] = useState("");
  const [newEnemyPV, setNewEnemyPV] = useState(10);
  const [newEnemyAtk, setNewEnemyAtk] = useState(0);

  const startCombat = () => {
    dispatch({
      type: "START_COMBAT",
      payload: {
        id: crypto.randomUUID(),
        round: 1,
        enemies: [],
        history: ["Combate iniciado."],
        active: true
      }
    });
  };

  const endCombat = () => {
    if (activeCombat) {
      dispatch({ type: "END_COMBAT", payload: activeCombat.id });
    }
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
        history: [...activeCombat.history, `${enemy.name} entrou no combate.`]
      }
    });
    setNewEnemyName("");
  };

  const updateEnemyPV = (enemyId: string, amount: number) => {
    if (!activeCombat) return;
    const enemies = activeCombat.enemies.map(e => {
      if (e.id === enemyId) {
        return { ...e, pvAtual: Math.max(0, e.pvAtual + amount) };
      }
      return e;
    });
    const enemy = activeCombat.enemies.find(e => e.id === enemyId);
    const text = amount < 0 ? `${enemy?.name} sofreu ${Math.abs(amount)} de dano.` : `${enemy?.name} recuperou ${amount} PV.`;
    
    dispatch({
      type: "UPDATE_COMBAT",
      payload: {
        id: activeCombat.id,
        enemies,
        history: [text, ...activeCombat.history]
      }
    });
  };

  const nextRound = () => {
    if (!activeCombat) return;
    dispatch({
      type: "UPDATE_COMBAT",
      payload: {
        id: activeCombat.id,
        round: activeCombat.round + 1,
        history: [`--- Rodada ${activeCombat.round + 1} ---`, ...activeCombat.history]
      }
    });
  };

  const handlePlayerDamage = (amount: number) => {
    dispatch({
      type: "UPDATE_CHARACTER",
      payload: { pvAtual: Math.max(0, state.character.pvAtual - amount) }
    });
    if (activeCombat) {
      dispatch({
        type: "UPDATE_COMBAT",
        payload: {
          id: activeCombat.id,
          history: [`${state.character.name} sofreu ${amount} de dano.`, ...activeCombat.history]
        }
      });
    }
  };

  if (!activeCombat) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 animate-in fade-in">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sword className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-3xl font-serif text-accent">Nenhum Combate Ativo</h2>
        <p className="text-muted-foreground max-w-md">Inicie um combate para gerenciar inimigos, vida e histórico de rodadas.</p>
        <Button size="lg" onClick={startCombat} className="mt-4">
          Iniciar Combate
        </Button>

        {state.combats.length > 0 && (
          <div className="mt-12 w-full text-left">
            <h3 className="text-xl font-serif mb-4">Combates Anteriores</h3>
            <div className="space-y-2">
              {state.combats.slice(0,3).map(c => (
                <Card key={c.id} className="bg-background">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <span className="font-bold">Combate de {c.round} rodadas</span>
                      <div className="text-sm text-muted-foreground">Inimigos: {c.enemies.map(e => e.name).join(", ") || "Nenhum"}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-accent">Combate</h2>
          <p className="text-muted-foreground">Rodada {activeCombat.round}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={nextRound}>Nova Rodada</Button>
          <Button variant="destructive" onClick={endCombat}>Encerrar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-primary/50 bg-card/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex justify-between">
                <span>Herói: {state.character.name}</span>
                <span className="text-destructive flex items-center"><Heart className="h-4 w-4 mr-1"/> {state.character.pvAtual}/{state.character.pvMax}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePlayerDamage(1)}>-1 PV</Button>
                <Button variant="outline" size="sm" onClick={() => handlePlayerDamage(2)}>-2 PV</Button>
                <Button variant="outline" size="sm" onClick={() => handlePlayerDamage(5)}>-5 PV</Button>
                <div className="flex-1"></div>
                <Button variant="outline" size="sm" className="text-green-500" onClick={() => dispatch({type: "UPDATE_CHARACTER", payload: {pvAtual: Math.min(state.character.pvMax, state.character.pvAtual + 2)}})}>+2 PV (Cura)</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-serif border-b border-border pb-2">Inimigos</h3>
            {activeCombat.enemies.map(enemy => (
              <Card key={enemy.id} className={enemy.pvAtual <= 0 ? "opacity-50" : ""}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg">{enemy.name}</h4>
                    <span className="text-sm text-muted-foreground flex items-center mt-1">
                      <Sword className="h-3 w-3 mr-1"/> Ataque: {enemy.attackModifier > 0 ? `+${enemy.attackModifier}` : enemy.attackModifier}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="icon" onClick={() => updateEnemyPV(enemy.id, -1)}>-</Button>
                    <div className="text-center min-w-[3rem]">
                      <span className="text-2xl font-bold block">{enemy.pvAtual}</span>
                      <span className="text-xs text-muted-foreground">/{enemy.pvMax}</span>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => updateEnemyPV(enemy.id, 1)}>+</Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-dashed border-border bg-transparent">
              <CardContent className="p-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Nome</Label>
                    <Input value={newEnemyName} onChange={e => setNewEnemyName(e.target.value)} placeholder="Troll..." />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Vida</Label>
                    <Input type="number" value={newEnemyPV} onChange={e => setNewEnemyPV(parseInt(e.target.value)||1)} />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Mod. Atq</Label>
                    <Input type="number" value={newEnemyAtk} onChange={e => setNewEnemyAtk(parseInt(e.target.value)||0)} />
                  </div>
                  <Button onClick={addEnemy}><Plus className="h-4 w-4"/></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <Card className="h-[400px] flex flex-col bg-background">
            <CardHeader className="py-3 px-4 border-b border-border">
              <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Registro do Combate</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-2 text-sm font-mono">
              {activeCombat.history.map((log, i) => (
                <div key={i} className={`py-1 ${log.startsWith('---') ? 'text-accent text-center font-bold my-2' : 'border-b border-border/50'}`}>
                  {log}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}