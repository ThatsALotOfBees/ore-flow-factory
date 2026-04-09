import { GameProvider } from '@/game/GameContext';
import { GameGrid } from '@/components/game/GameGrid';
import { GameHeader } from '@/components/game/GameHeader';
import { Hotbar } from '@/components/game/Hotbar';
import { useAuth } from '@/hooks/useAuth';
import AuthPage from '@/pages/Auth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'hsl(220, 20%, 10%)', color: 'hsl(210, 30%, 90%)' }}>
        <div className="text-center">
          <div className="text-3xl mb-2">⛏️</div>
          <div className="text-sm opacity-60">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <GameProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden" style={{ background: 'hsl(220, 20%, 10%)' }}>
        <GameHeader />
        <div className="flex-1 relative overflow-hidden">
          <GameGrid />
          <Hotbar />
        </div>
      </div>
    </GameProvider>
  );
};

export default Index;
