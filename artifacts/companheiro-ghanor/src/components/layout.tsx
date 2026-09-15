import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useGame } from "@/lib/store";
import { 
  Home, 
  User, 
  Sword, 
  Dices, 
  BookOpen, 
  Settings,
  Undo
} from "lucide-react";
import { Button } from "./ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { canUndo, dispatch } = useGame();

  const navItems = [
    { href: "/", label: "Resumo", icon: Home },
    { href: "/diario", label: "Diário", icon: BookOpen },
    { href: "/ficha", label: "Ficha", icon: User },
    { href: "/testes", label: "Testes", icon: Dices },
    { href: "/combate", label: "Combate", icon: Sword },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary/30">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <h1 className="font-serif text-xl text-accent font-bold tracking-wider">A Coroa de Ghanor</h1>
        <div className="flex items-center gap-2">
          {canUndo && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => dispatch({ type: 'UNDO' })}
              title="Desfazer última ação"
              className="text-muted-foreground hover:text-foreground"
            >
              <Undo className="h-5 w-5" />
            </Button>
          )}
          <Link href="/configuracoes">
            <Button variant="ghost" size="icon" className={location === "/configuracoes" ? "text-primary" : "text-muted-foreground hover:text-foreground"}>
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 max-w-3xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-card border-t border-border md:relative md:border-t-0 md:bg-transparent pb-safe">
        <div className="flex items-center justify-around md:justify-center md:gap-8 p-2 max-w-3xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-colors ${
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                  }`}
                >
                  <Icon className="h-6 w-6 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
