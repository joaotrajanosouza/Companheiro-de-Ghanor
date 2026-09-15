import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Zap, Coins, ArrowRight, Dices, Sword, BookOpen, Shield } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { state, dispatch } = useGame();
  const { character, campaign } = state;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 game-surface-raised p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div>
          <h2 className="text-4xl font-serif text-accent drop-shadow-md">Página {campaign.currentPage}</h2>
          <p className="text-muted-foreground font-serif italic mt-1 text-lg">Jornada de {character.name}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-primary/40 hover:border-primary text-primary" onClick={() => dispatch({ type: 'UPDATE_CAMPAIGN', payload: { currentPage: Math.max(1, campaign.currentPage - 1) }})}>
            Página Anterior
          </Button>
          <Button variant="default" className="shadow-lg shadow-primary/20" onClick={() => dispatch({ type: 'UPDATE_CAMPAIGN', payload: { currentPage: campaign.currentPage + 1 }})}>
            Próxima Página
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="game-surface-raised border-b-4 border-b-destructive/60 hover:-translate-y-1 transition-transform">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Heart className="h-8 w-8 text-destructive mb-3" />
            <span className="text-3xl font-bold font-serif">{character.pvAtual}<span className="text-lg text-muted-foreground">/{character.pvMax}</span></span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Pontos de Vida</span>
          </CardContent>
        </Card>
        
        <Card className="game-surface-raised border-b-4 border-b-blue-600/60 hover:-translate-y-1 transition-transform">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Zap className="h-8 w-8 text-blue-500 mb-3" />
            <span className="text-3xl font-bold font-serif">{character.pmAtual}<span className="text-lg text-muted-foreground">/{character.pmMax}</span></span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Pontos de Magia</span>
          </CardContent>
        </Card>

        <Card className="game-surface-raised border-b-4 border-b-accent/60 hover:-translate-y-1 transition-transform">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Shield className="h-8 w-8 text-accent mb-3" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold font-serif text-muted-foreground">{character.forca}</span>
              <span className="text-border">|</span>
              <span className="text-2xl font-bold font-serif text-foreground">{character.habilidade}</span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Força | Habilidade</span>
          </CardContent>
        </Card>

        <Card className="game-surface-raised border-b-4 border-b-yellow-500/60 hover:-translate-y-1 transition-transform">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Coins className="h-8 w-8 text-yellow-500 mb-3" />
            <span className="text-3xl font-bold font-serif">{character.dinheiro}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Peças de Ouro</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link href="/testes" className="group block">
          <Card className="h-full game-surface-raised border-primary/20 hover:border-primary transition-all cursor-pointer bg-card/60 hover:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Dices className="h-6 w-6" />
                </div>
                Fazer Teste
              </CardTitle>
              <CardDescription className="text-sm mt-2 leading-relaxed">Role os dados e aplique seus modificadores de atributos.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        
        <Link href="/combate" className="group block">
          <Card className="h-full game-surface-raised border-primary/20 hover:border-primary transition-all cursor-pointer bg-card/60 hover:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Sword className="h-6 w-6" />
                </div>
                Combate
              </CardTitle>
              <CardDescription className="text-sm mt-2 leading-relaxed">Enfrente inimigos, controle pontos de vida e rodadas.</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/diario" className="group block">
          <Card className="h-full game-surface-raised border-primary/20 hover:border-primary transition-all cursor-pointer bg-card/60 hover:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                Anotações
              </CardTitle>
              <CardDescription className="text-sm mt-2 leading-relaxed">Registre eventos importantes e atualize sua ficha.</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
      
      <section className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-serif text-2xl text-accent">Bênçãos & Efeitos Ativos</h3>
          <Link href="/ficha">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-accent">
              Ver ficha <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {state.modifiers.filter(m => m.active).length > 0 ? (
            state.modifiers.filter(m => m.active).map(mod => (
              <div key={mod.id} className="flex justify-between items-center p-4 rounded-xl game-surface-raised">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <Shield className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <span className="font-bold text-lg">{mod.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 uppercase tracking-wider font-semibold">({mod.target})</span>
                  </div>
                </div>
                <div className="bg-primary/20 text-primary-foreground font-bold px-4 py-1.5 rounded-full border border-primary/30">
                  {mod.value > 0 ? `+${mod.value}` : mod.value}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 game-surface-sunken rounded-xl text-muted-foreground italic font-serif">
              Nenhum efeito ou benção ativa no momento.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
