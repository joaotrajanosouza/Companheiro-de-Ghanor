import { FormEvent, useEffect, useState } from "react";
import { useGame } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Heart, Zap, Coins, ArrowRight, Dices, Sword, BookOpen, Shield, BookMarked, History, Trash2, Pencil, BookmarkPlus, Check, X } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { state, dispatch } = useGame();
  const { character, campaign } = state;
  const [pageInput, setPageInput] = useState(String(campaign.currentPage));
  const [favoriteName, setFavoriteName] = useState("");
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);
  const [editingFavoriteName, setEditingFavoriteName] = useState("");
  const parsedPage = Number(pageInput);
  const isValidPage = pageInput.trim() !== "" && Number.isInteger(parsedPage) && parsedPage > 0;
  const pageHistory = campaign.pageHistory ?? [campaign.currentPage];
  const pageFavorites = campaign.pageFavorites ?? [];

  useEffect(() => {
    setPageInput(String(campaign.currentPage));
  }, [campaign.currentPage]);

  const goToPage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValidPage) return;
    dispatch({ type: "UPDATE_CAMPAIGN", payload: { currentPage: parsedPage } });
  };

  const addFavorite = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = favoriteName.trim();
    if (!name) return;
    dispatch({
      type: "ADD_PAGE_FAVORITE",
      payload: { id: crypto.randomUUID(), page: campaign.currentPage, name },
    });
    setFavoriteName("");
  };

  const startEditingFavorite = (id: string, name: string) => {
    setEditingFavoriteId(id);
    setEditingFavoriteName(name);
  };

  const saveFavoriteName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = editingFavoriteName.trim();
    if (!editingFavoriteId || !name) return;
    dispatch({ type: "UPDATE_PAGE_FAVORITE", payload: { id: editingFavoriteId, name } });
    setEditingFavoriteId(null);
    setEditingFavoriteName("");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 game-surface-raised p-6 rounded-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        <div>
          <h2 className="text-4xl font-serif text-accent drop-shadow-md">Página {campaign.currentPage}</h2>
          <p className="text-muted-foreground font-serif italic mt-1 text-lg">Jornada de {character.name}</p>
        </div>
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:items-end">
          <form onSubmit={goToPage} className="flex w-full items-end gap-2 sm:w-auto">
            <div className="flex-1 space-y-1 sm:w-40 sm:flex-none">
              <Label htmlFor="page-selector" className="text-xs uppercase tracking-wider text-muted-foreground">
                Ir para a página
              </Label>
              <Input
                id="page-selector"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                aria-invalid={!isValidPage}
                aria-describedby={!isValidPage ? "page-selector-error" : undefined}
                className="bg-background"
              />
            </div>
            <Button type="submit" disabled={!isValidPage} className="shrink-0 shadow-lg shadow-primary/20">
              <BookMarked className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Ir</span>
              <span className="sr-only sm:hidden">Ir para a página informada</span>
            </Button>
          </form>
          {!isValidPage && (
            <p id="page-selector-error" role="alert" className="text-xs text-destructive">
              Informe um número inteiro maior que zero.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="border-primary/40 hover:border-primary text-primary" disabled={campaign.currentPage <= 1} onClick={() => dispatch({ type: 'UPDATE_CAMPAIGN', payload: { currentPage: Math.max(1, campaign.currentPage - 1) }})}>
              Página Anterior
            </Button>
            <Button variant="default" className="shadow-lg shadow-primary/20" onClick={() => dispatch({ type: 'UPDATE_CAMPAIGN', payload: { currentPage: campaign.currentPage + 1 }})}>
              Próxima Página
            </Button>
          </div>
        </div>
      </section>

      <Card className="game-surface-raised border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <History className="h-5 w-5 text-primary" />
              Páginas recentes
            </CardTitle>
            <CardDescription className="mt-1">Toque em uma página para voltar até ela.</CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pageHistory.length <= 1}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar páginas recentes?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todas as páginas anteriores serão removidas. A página atual continuará no histórico.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => dispatch({ type: "CLEAR_PAGE_HISTORY" })}
                >
                  Limpar histórico
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2" aria-label="Histórico de páginas visitadas">
            {pageHistory.map((page, index) => (
              <Button
                key={`${page}-${index}`}
                type="button"
                size="sm"
                variant={page === campaign.currentPage && index === pageHistory.length - 1 ? "default" : "outline"}
                onClick={() => dispatch({ type: "UPDATE_CAMPAIGN", payload: { currentPage: page } })}
                aria-current={page === campaign.currentPage && index === pageHistory.length - 1 ? "page" : undefined}
              >
                Página {page}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="game-surface-raised border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookMarked className="h-5 w-5 text-primary" />
            Páginas favoritas
          </CardTitle>
          <CardDescription>Crie atalhos com nomes curtos para páginas importantes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={addFavorite} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="favorite-name">Nome para a página {campaign.currentPage}</Label>
              <Input
                id="favorite-name"
                value={favoriteName}
                onChange={(event) => setFavoriteName(event.target.value)}
                placeholder="Ex.: Regras de combate"
                maxLength={60}
              />
            </div>
            <Button type="submit" disabled={!favoriteName.trim()} className="shrink-0">
              <BookmarkPlus className="mr-2 h-4 w-4" />
              Favoritar página atual
            </Button>
          </form>

          {pageFavorites.length > 0 ? (
            <div className="space-y-2" aria-label="Páginas favoritas">
              {pageFavorites.map((favorite) => (
                <div key={favorite.id} className="flex flex-col gap-2 rounded-lg border border-border bg-background/60 p-3 sm:flex-row sm:items-center">
                  {editingFavoriteId === favorite.id ? (
                    <form onSubmit={saveFavoriteName} className="flex flex-1 gap-2">
                      <Input
                        value={editingFavoriteName}
                        onChange={(event) => setEditingFavoriteName(event.target.value)}
                        maxLength={60}
                        aria-label={`Novo nome para ${favorite.name}`}
                        autoFocus
                      />
                      <Button type="submit" size="icon" disabled={!editingFavoriteName.trim()} aria-label="Salvar novo nome">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => setEditingFavoriteId(null)} aria-label="Cancelar edição">
                        <X className="h-4 w-4" />
                      </Button>
                    </form>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto min-w-0 flex-1 justify-start px-2 py-1 text-left"
                        onClick={() => dispatch({ type: "UPDATE_CAMPAIGN", payload: { currentPage: favorite.page } })}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{favorite.name}</span>
                          <span className="block text-xs text-muted-foreground">Página {favorite.page}</span>
                        </span>
                      </Button>
                      <div className="flex justify-end gap-1">
                        <Button type="button" size="icon" variant="ghost" onClick={() => startEditingFavorite(favorite.id, favorite.name)} aria-label={`Renomear ${favorite.name}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button type="button" size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => dispatch({ type: "REMOVE_PAGE_FAVORITE", payload: favorite.id })} aria-label={`Remover ${favorite.name}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Nenhuma página favorita ainda.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="game-surface-raised border-b-4 border-b-destructive/60 hover:-translate-y-1 transition-transform">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Heart className="h-8 w-8 text-destructive mb-3" />
            <span className="text-3xl font-bold font-serif">{character.pvAtual}<span className="text-lg text-muted-foreground">/{character.pvMax}</span></span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Pontos de Vida</span>
          </CardContent>
        </Card>
        
        <Card className="game-surface-raised border-b-4 border-b-sky-700/60 hover:-translate-y-1 transition-transform">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Zap className="h-8 w-8 text-sky-700 mb-3" />
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

        <Card className="game-surface-raised border-b-4 border-b-amber-600/60 hover:-translate-y-1 transition-transform">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <Coins className="h-8 w-8 text-amber-600 mb-3" />
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
                <div className="p-2 rounded-lg bg-primary/15 text-primary">
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
                <div className="p-2 rounded-lg bg-primary/15 text-primary">
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
                <div className="p-2 rounded-lg bg-primary/15 text-primary">
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
                <div className="bg-primary text-primary-foreground shadow-sm font-bold px-4 py-1.5 rounded-full">
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
