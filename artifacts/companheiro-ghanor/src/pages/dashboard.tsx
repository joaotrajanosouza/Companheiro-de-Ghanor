import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Coins, ArrowRight, Dices, Sword, BookOpen, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { state, dispatch } = useGame();
  const { character, campaign } = state;

  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif text-accent">Página {campaign.currentPage}</h2>
          <p className="text-muted-foreground">Jornada de {character.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'UPDATE_CAMPAIGN', payload: { currentPage: Math.max(1, campaign.currentPage - 1) }})}>
            Anterior
          </Button>
          <Button variant="default" size="sm" onClick={() => dispatch({ type: 'UPDATE_CAMPAIGN', payload: { currentPage: campaign.currentPage + 1 }})}>
            Próxima Página
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Heart className="h-6 w-6 text-destructive mb-2" />
            <span className="text-2xl font-bold">{character.pvAtual}/{character.pvMax}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Pontos de Vida</span>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Zap className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-2xl font-bold">{character.pmAtual}/{character.pmMax}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Pontos de Magia</span>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Shield className="h-6 w-6 text-accent mb-2" />
            <span className="text-2xl font-bold">{character.forca} | {character.habilidade}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Força | Habilidade</span>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Coins className="h-6 w-6 text-yellow-500 mb-2" />
            <span className="text-2xl font-bold">{character.dinheiro}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Peças de Ouro</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Link href="/testes" className="group">
          <Card className="h-full border-primary/20 hover:border-primary transition-colors cursor-pointer bg-card/50 hover:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dices className="h-5 w-5 text-primary" /> Fazer Teste
              </CardTitle>
              <CardDescription>Informar seus dados e aplicar modificadores</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/combate" className="group">
          <Card className="h-full border-primary/20 hover:border-primary transition-colors cursor-pointer bg-card/50 hover:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sword className="h-5 w-5 text-primary" /> Iniciar Combate
              </CardTitle>
              <CardDescription>Gerenciar inimigos e rodadas</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/diario" className="group">
          <Card className="h-full border-primary/20 hover:border-primary transition-colors cursor-pointer bg-card/50 hover:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" /> Anotação
              </CardTitle>
              <CardDescription>Registrar escolhas e itens</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      
      <section className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-serif text-xl">Ativos Atualmente</h3>
          <Link href="/modificadores">
            <Button variant="ghost" size="sm" className="text-muted-foreground">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="space-y-2">
          {state.modifiers.filter(m => m.active).length > 0 ? (
            state.modifiers.filter(m => m.active).map(mod => (
              <div key={mod.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-card/50">
                <div>
                  <span className="font-bold">{mod.name}</span>
                  <span className="text-sm text-muted-foreground ml-2 capitalize">({mod.target})</span>
                </div>
                <span className="text-accent font-bold text-lg">{mod.value > 0 ? `+${mod.value}` : mod.value}</span>
              </div>
            ))
          ) : (
            <div className="text-center p-6 border border-dashed border-border rounded-lg text-muted-foreground">
              Nenhum modificador ativo.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}