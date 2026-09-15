import { useState } from "react";
import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dices, CheckCircle, XCircle } from "lucide-react";

export default function Tests() {
  const { state, dispatch } = useGame();
  
  const [die1, setDie1] = useState<number | "">("");
  const [die2, setDie2] = useState<number | "">("");
  const [attr, setAttr] = useState<"forca" | "habilidade">("forca");
  const [selectedMods, setSelectedMods] = useState<string[]>([]);
  
  // Calculate total
  const attrValue = state.character[attr];
  const d1Val = typeof die1 === "number" ? die1 : 0;
  const d2Val = typeof die2 === "number" ? die2 : 0;
  
  const applicableMods = state.modifiers.filter(m => m.active && (m.target === attr || m.target === "qualquer"));
  
  const modsTotal = selectedMods.reduce((acc, id) => {
    const mod = state.modifiers.find(m => m.id === id);
    return acc + (mod ? mod.value : 0);
  }, 0);

  const total = d1Val + d2Val + attrValue + modsTotal;
  const isComplete = typeof die1 === "number" && typeof die2 === "number";

  const toggleMod = (id: string) => {
    if (selectedMods.includes(id)) {
      setSelectedMods(selectedMods.filter(m => m !== id));
    } else {
      setSelectedMods([...selectedMods, id]);
    }
  };

  const handleSaveTest = (success: boolean) => {
    if (!isComplete) return;
    dispatch({
      type: "ADD_TEST",
      payload: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        type: `Teste de ${attr === "forca" ? "Força" : "Habilidade"}`,
        die1: d1Val,
        die2: d2Val,
        attributeValue: attrValue,
        modifierIds: selectedMods,
        total,
        success,
        notes: ""
      }
    });
    setDie1("");
    setDie2("");
    setSelectedMods([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-3xl font-serif text-accent mb-4">Assistente de Teste</h2>
      
      <Card className="border-primary bg-card/60">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-lg">Atributo Testado</Label>
            <div className="flex gap-4">
              <Button 
                variant={attr === "forca" ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setAttr("forca")}
              >
                Força ({state.character.forca})
              </Button>
              <Button 
                variant={attr === "habilidade" ? "default" : "outline"} 
                className="flex-1"
                onClick={() => setAttr("habilidade")}
              >
                Habilidade ({state.character.habilidade})
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-lg">Dados Físicos (2d6)</Label>
            <div className="flex gap-4">
              <Input 
                type="number" 
                min="1" max="6" 
                placeholder="Dado 1" 
                value={die1}
                onChange={(e) => setDie1(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="text-center text-2xl h-14"
              />
              <Input 
                type="number" 
                min="1" max="6" 
                placeholder="Dado 2" 
                value={die2}
                onChange={(e) => setDie2(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="text-center text-2xl h-14"
              />
            </div>
          </div>

          {applicableMods.length > 0 && (
            <div className="space-y-2 border-t border-border pt-4">
              <Label className="text-lg">Modificadores Aplicáveis</Label>
              <div className="flex flex-wrap gap-2">
                {applicableMods.map(mod => (
                  <Badge 
                    key={mod.id} 
                    variant={selectedMods.includes(mod.id) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5 text-sm"
                    onClick={() => toggleMod(mod.id)}
                  >
                    {mod.name} ({mod.value > 0 ? `+${mod.value}` : mod.value})
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border pt-6 pb-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Total do Teste</p>
              <div className="text-6xl font-serif text-accent font-bold mb-2">
                {isComplete ? total : "--"}
              </div>
              <p className="text-sm text-muted-foreground">
                ({d1Val} + {d2Val}) + {attrValue} {modsTotal !== 0 ? `${modsTotal > 0 ? '+' : ''}${modsTotal}` : ''}
              </p>
            </div>
          </div>

          {isComplete && (
            <div className="flex gap-4 pt-4 border-t border-border animate-in slide-in-from-bottom-4">
              <Button 
                variant="outline" 
                className="flex-1 h-14 text-destructive hover:bg-destructive hover:text-white border-destructive"
                onClick={() => handleSaveTest(false)}
              >
                <XCircle className="h-5 w-5 mr-2" /> Falha
              </Button>
              <Button 
                variant="default" 
                className="flex-1 h-14 bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => handleSaveTest(true)}
              >
                <CheckCircle className="h-5 w-5 mr-2" /> Sucesso
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="mt-8">
        <h3 className="text-xl font-serif mb-4">Histórico de Testes</h3>
        <div className="space-y-2">
          {state.tests.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Nenhum teste registrado.</p>
          ) : (
            state.tests.slice(0, 5).map(test => (
              <div key={test.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50">
                <div>
                  <div className="font-bold">{test.type} <span className="text-muted-foreground font-normal ml-2 text-sm">{new Date(test.timestamp).toLocaleTimeString()}</span></div>
                  <div className="text-sm text-muted-foreground">Dados: [{test.die1}, {test.die2}]</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">{test.total}</span>
                  {test.success !== null && (
                    test.success ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
