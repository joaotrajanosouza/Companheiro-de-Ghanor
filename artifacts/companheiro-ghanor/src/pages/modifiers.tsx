import { useState } from "react";
import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, Power, Filter } from "lucide-react";
import { TargetType, DurationType } from "@/lib/types";

export default function Modifiers() {
  const { state, dispatch } = useGame();
  const [filter, setFilter] = useState<"todos" | "ativos" | "inativos">("todos");
  
  const [isAdding, setIsAdding] = useState(false);
  const [newMod, setNewMod] = useState({
    name: "",
    value: 1,
    target: "ataque" as TargetType,
    durationType: "permanente" as DurationType
  });

  const handleAdd = () => {
    if (!newMod.name) return;
    dispatch({
      type: "ADD_MODIFIER",
      payload: {
        id: crypto.randomUUID(),
        name: newMod.name,
        description: "",
        value: newMod.value,
        origin: "Manual",
        target: newMod.target,
        durationType: newMod.durationType,
        active: true,
        acquiredPage: state.campaign.currentPage
      }
    });
    setNewMod({ name: "", value: 1, target: "ataque", durationType: "permanente" });
    setIsAdding(false);
  };

  const toggleMod = (id: string, active: boolean) => {
    dispatch({ type: "UPDATE_MODIFIER", payload: { id, active: !active } });
  };

  const removeMod = (id: string) => {
    dispatch({ type: "REMOVE_MODIFIER", payload: id });
  };

  const filteredMods = state.modifiers.filter(m => {
    if (filter === "ativos") return m.active;
    if (filter === "inativos") return !m.active;
    return true;
  });

  const targetLabel = (target: TargetType) => {
    if (target.startsWith("atributo:")) {
      const attribute = state.character.customAttributes.find(
        item => item.id === target.slice("atributo:".length),
      );
      return attribute?.name ?? "Atributo removido";
    }
    const labels: Record<string, string> = {
      ataque: "Ataque",
      dano: "Dano",
      forca: "Força",
      habilidade: "Habilidade",
      iniciativa: "Iniciativa",
      qualquer: "Qualquer",
    };
    return labels[target] ?? target;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-accent">Modificadores</h2>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "secondary" : "default"}>
          {isAdding ? "Cancelar" : <><Plus className="h-4 w-4 mr-2" /> Novo</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-lg">Adicionar Modificador</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome / Origem</Label>
                <Input 
                  placeholder="Ex: Espada de Fogo, Bênção" 
                  value={newMod.name}
                  onChange={(e) => setNewMod({ ...newMod, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input 
                  type="number" 
                  value={newMod.value}
                  onChange={(e) => setNewMod({ ...newMod, value: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Alvo do Bônus</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newMod.target}
                  onChange={(e) => setNewMod({ ...newMod, target: e.target.value as TargetType })}
                >
                  <option value="ataque">Ataque</option>
                  <option value="dano">Dano</option>
                  <option value="forca">Força</option>
                  <option value="habilidade">Habilidade</option>
                  <option value="iniciativa">Iniciativa</option>
                  <option value="qualquer">Qualquer</option>
                  {state.character.customAttributes.length > 0 && (
                    <optgroup label="Atributos personalizados">
                      {state.character.customAttributes.map(attribute => (
                        <option key={attribute.id} value={`atributo:${attribute.id}`}>
                          {attribute.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Duração</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newMod.durationType}
                  onChange={(e) => setNewMod({ ...newMod, durationType: e.target.value as DurationType })}
                >
                  <option value="permanente">Permanente</option>
                  <option value="combate">Até fim do Combate</option>
                  <option value="rodada">Uma Rodada</option>
                  <option value="pagina">Até virar a página</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
            </div>
            <Button onClick={handleAdd} className="w-full">Adicionar</Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button variant={filter === "todos" ? "default" : "outline"} size="sm" onClick={() => setFilter("todos")}>Todos</Button>
        <Button variant={filter === "ativos" ? "default" : "outline"} size="sm" onClick={() => setFilter("ativos")}>Ativos</Button>
        <Button variant={filter === "inativos" ? "default" : "outline"} size="sm" onClick={() => setFilter("inativos")}>Inativos</Button>
      </div>

      <div className="space-y-3">
        {filteredMods.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-lg text-muted-foreground">
            Nenhum modificador encontrado.
          </div>
        ) : (
          filteredMods.map(mod => (
            <div 
              key={mod.id} 
              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                mod.active ? "border-primary bg-primary/5" : "border-border bg-card/50"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-lg">{mod.name}</span>
                  <Badge variant={mod.active ? "default" : "secondary"}>
                    {mod.value > 0 ? `+${mod.value}` : mod.value}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground capitalize flex gap-2">
                  <span>Alvo: {targetLabel(mod.target)}</span> • <span>Duração: {mod.durationType}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={mod.active ? "default" : "outline"}
                  size="icon"
                  onClick={() => toggleMod(mod.id, mod.active)}
                  title={mod.active ? "Desativar" : "Ativar"}
                  className={mod.active ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => removeMod(mod.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
