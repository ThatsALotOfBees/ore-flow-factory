import { GameProvider } from '@/game/GameContext';
import { GameGrid } from '@/components/game/GameGrid';
import { GameSidebar } from '@/components/game/GameSidebar';

const Index = () => {
  return (
    <GameProvider>
      <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'hsl(220, 20%, 10%)' }}>
        <GameSidebar />
        <GameGrid />
      </div>
    </GameProvider>
  );
};

export default Index;
