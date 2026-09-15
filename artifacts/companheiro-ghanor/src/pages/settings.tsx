import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { initialGameState } from "@/lib/initial-data";

export default function Settings() {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);

  const exportSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `ghanor_save_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode); 
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast({
      title: "Progresso exportado",
      description: "O arquivo JSON foi baixado com sucesso."
    });
  };

  const importSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && parsed.campaign) {
          dispatch({ type: "SET_STATE", payload: parsed });
          toast({
            title: "Progresso importado",
            description: "Seu jogo foi carregado com sucesso."
          });
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        toast({
          title: "Erro na importação",
          description: "O arquivo selecionado não é um save válido.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    dispatch({ type: "SET_STATE", payload: initialGameState });
    setConfirmReset(false);
    toast({
      title: "Jornada Reiniciada",
      description: "Seu progresso foi apagado e restaurado aos padrões.",
      variant: "destructive"
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-3xl font-serif text-accent mb-6">Configurações</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Dados da Campanha</CardTitle>
          <CardDescription>Informações sobre o seu progresso atual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Versão do Sistema</span>
              <span className="font-mono">{state.campaign.version}.0</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Última atualização</span>
              <span className="font-mono">{new Date(state.campaign.updatedAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Testes Realizados</span>
              <span className="font-mono">{state.tests.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Anotações</span>
              <span className="font-mono">{state.journal.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar / Exportar Progresso</CardTitle>
          <CardDescription>Faça backup seguro da sua jornada em um arquivo JSON</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={exportSave} className="flex-1" variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar JSON
          </Button>
          <div className="relative flex-1">
            <Input 
              type="file" 
              accept=".json" 
              onChange={importSave} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="w-full pointer-events-none">
              <Upload className="mr-2 h-4 w-4" /> Importar JSON
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2 h-5 w-5"/> Zona de Perigo</CardTitle>
          <CardDescription>Apagar todo o progresso e começar do zero.</CardDescription>
        </CardHeader>
        <CardContent>
          {confirmReset ? (
            <div className="space-y-4 animate-in slide-in-from-right-4">
              <p className="text-sm font-bold text-destructive">Tem certeza absoluta? Esta ação não pode ser desfeita!</p>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleReset}>Sim, apagar tudo</Button>
                <Button variant="outline" onClick={() => setConfirmReset(false)}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmReset(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Reiniciar Jornada
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}