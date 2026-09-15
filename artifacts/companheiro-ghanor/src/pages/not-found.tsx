import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <Card className="game-surface-raised w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold text-accent">
              Página não encontrada
            </h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Este caminho não faz parte da jornada.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
