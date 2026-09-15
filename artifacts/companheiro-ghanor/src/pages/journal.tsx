import { useState } from "react";
import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JournalEntry } from "@/lib/types";

export default function Journal() {
  const { state, dispatch } = useGame();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<JournalEntry["type"]>("nota");
  const [important, setImportant] = useState(false);

  const handleAdd = () => {
    if (!title && !description) return;
    dispatch({
      type: "ADD_JOURNAL",
      payload: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        page: state.campaign.currentPage,
        type,
        title: title || "Anotação",
        description,
        important
      }
    });
    setTitle("");
    setDescription("");
    setImportant(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-serif text-accent">Diário de Campanha</h2>
        <div className="text-right">
          <span className="text-sm text-muted-foreground uppercase tracking-wider">Página Atual</span>
          <div className="text-2xl font-bold font-serif">{state.campaign.currentPage}</div>
        </div>
      </div>

      <Card className="border-primary/30">
        <CardContent className="pt-6 space-y-4">
          <Input 
            placeholder="Título (ex: Encontrei o Ermitão)" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-serif text-lg"
          />
          <Textarea 
            placeholder="Detalhes..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <select 
                className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
                value={type}
                onChange={(e) => setType(e.target.value as JournalEntry["type"])}
              >
                <option value="nota">Nota</option>
                <option value="escolha">Decisão/Escolha</option>
                <option value="recurso">Recurso/Item</option>
              </select>
              <label className="flex items-center gap-2 text-sm border border-input rounded-md px-3 bg-background cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={important} 
                  onChange={(e) => setImportant(e.target.checked)}
                  className="accent-primary"
                />
                Importante
              </label>
            </div>
            <Button onClick={handleAdd}>Registrar</Button>
          </div>
        </CardContent>
      </Card>

      <div className="relative border-l-2 border-border ml-4 pl-6 space-y-8 mt-12 before:absolute before:top-0 before:left-[-9px] before:h-4 before:w-4 before:rounded-full before:bg-border">
        {state.journal.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma anotação ainda.</p>
        ) : (
          state.journal.map(entry => (
            <div key={entry.id} className="relative">
              <div className={`absolute top-1 left-[-33px] h-3 w-3 rounded-full ring-4 ring-background ${entry.important ? 'bg-primary' : 'bg-muted-foreground'}`} />
              <div className="mb-1 text-sm text-muted-foreground font-mono flex items-center gap-2">
                <span className="bg-card px-2 py-0.5 rounded border border-border">Pág {entry.page}</span>
                <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                <span className="uppercase text-xs tracking-wider opacity-60">[{entry.type}]</span>
              </div>
              <div className={`p-4 rounded-lg border ${entry.important ? 'border-primary/50 bg-primary/5' : 'border-border bg-card/30'}`}>
                <h4 className="font-serif font-bold text-lg mb-1">{entry.title}</h4>
                {entry.description && (
                  <p className="text-foreground/80 whitespace-pre-wrap text-sm leading-relaxed">{entry.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}