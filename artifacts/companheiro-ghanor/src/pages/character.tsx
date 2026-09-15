import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash, Shield, Heart, Zap, Coins } from "lucide-react";
import { useState } from "react";

export default function Character() {
  const { state, dispatch } = useGame();
  const { character } = state;

  const handleUpdate = (field: keyof typeof character, value: any) => {
    dispatch({ type: "UPDATE_CHARACTER", payload: { [field]: value } });
  };

  const handleStatChange = (stat: "pvAtual" | "pvMax" | "pmAtual" | "pmMax" | "forca" | "habilidade" | "dinheiro", amount: number) => {
    let newValue = character[stat] + amount;
    if (stat === "pvAtual" || stat === "pmAtual" || stat === "dinheiro") {
      newValue = Math.max(0, newValue);
    }
    if (stat === "pvAtual" && newValue > character.pvMax) newValue = character.pvMax;
    if (stat === "pmAtual" && newValue > character.pmMax) newValue = character.pmMax;
    
    handleUpdate(stat, newValue);
  };

  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      name: newItemName,
      quantity: newItemQty,
      description: "",
      equipped: false,
      consumable: false,
    };
    handleUpdate("inventory", [...character.inventory, newItem]);
    setNewItemName("");
    setNewItemQty(1);
  };

  const handleRemoveItem = (id: string) => {
    handleUpdate("inventory", character.inventory.filter((i: any) => i.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-3xl font-serif text-accent mb-4">Ficha de Personagem</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Herói</Label>
                <Input 
                  id="name" 
                  value={character.name} 
                  onChange={(e) => handleUpdate("name", e.target.value)} 
                  className="font-serif text-lg bg-background"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2 border border-border p-4 rounded-lg bg-background text-center">
                  <Heart className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <Label className="text-xs uppercase text-muted-foreground">Vida (PV)</Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("pvAtual", -1)}>-</Button>
                    <span className="text-xl font-bold">{character.pvAtual}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("pvAtual", 1)}>+</Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Max: {character.pvMax}</div>
                </div>

                <div className="space-y-2 border border-border p-4 rounded-lg bg-background text-center">
                  <Zap className="h-5 w-5 text-sky-700 mx-auto mb-1" />
                  <Label className="text-xs uppercase text-muted-foreground">Magia (PM)</Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("pmAtual", -1)}>-</Button>
                    <span className="text-xl font-bold">{character.pmAtual}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("pmAtual", 1)}>+</Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Max: {character.pmMax}</div>
                </div>

                <div className="space-y-2 border border-border p-4 rounded-lg bg-background text-center">
                  <Shield className="h-5 w-5 text-accent mx-auto mb-1" />
                  <Label className="text-xs uppercase text-muted-foreground">Força</Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("forca", -1)}>-</Button>
                    <span className="text-xl font-bold">{character.forca}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("forca", 1)}>+</Button>
                  </div>
                </div>

                <div className="space-y-2 border border-border p-4 rounded-lg bg-background text-center">
                  <Shield className="h-5 w-5 text-accent mx-auto mb-1" />
                  <Label className="text-xs uppercase text-muted-foreground">Habilidade</Label>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("habilidade", -1)}>-</Button>
                    <span className="text-xl font-bold">{character.habilidade}</span>
                    <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleStatChange("habilidade", 1)}>+</Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-background p-4 rounded-lg border border-border">
                <Coins className="h-6 w-6 text-amber-600" />
                <Label className="uppercase text-muted-foreground">Peças de Ouro</Label>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleStatChange("dinheiro", -1)}>-</Button>
                  <span className="text-xl font-bold w-12 text-center">{character.dinheiro}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleStatChange("dinheiro", 1)}>+</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-2xl font-serif text-accent mb-4">Inventário</h3>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Novo item..." 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <Input 
                type="number" 
                min="1"
                value={newItemQty}
                onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                className="w-20"
              />
              <Button onClick={handleAddItem}><Plus className="h-4 w-4" /></Button>
            </div>

            <div className="space-y-2 mt-4">
              {character.inventory.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant="secondary">Qtd: {item.quantity}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {character.inventory.length === 0 && (
                <p className="text-center text-muted-foreground py-4">Inventário vazio.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <h3 className="text-2xl font-serif text-accent mb-4">Anotações do Personagem</h3>
        <Card>
          <CardContent className="pt-6">
            <Textarea 
              value={character.notes}
              onChange={(e) => handleUpdate("notes", e.target.value)}
              className="min-h-[150px] font-serif bg-background"
              placeholder="História, maldições, bênçãos, títulos..."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
