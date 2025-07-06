import { GameState } from '@/types';

interface GameStateOverlayProps {
  gameState: GameState;
}

export default function GameStateOverlay({ gameState }: GameStateOverlayProps) {
  // Parse the count string (e.g., "2-1" -> balls: 2, strikes: 1)
  const parseCount = (count: string) => {
    const parts = count.split('-');
    return {
      balls: parseInt(parts[0]) || 0,
      strikes: parseInt(parts[1]) || 0
    };
  };



  // Check if a base is occupied
  const isBaseOccupied = (base: string) => {
    return gameState.runners.some(runner => runner.includes(base));
  };

  // Render circles for balls, strikes, outs (limited counts)
  const renderCircles = (filled: number, total: number) => {
    return Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={`w-4 h-4 rounded-full border-2 ${
          i < filled
            ? 'bg-yellow-400 border-yellow-400'
            : 'bg-transparent border-gray-400'
        }`}
      />
    ));
  };

  const { balls, strikes } = parseCount(gameState.count);
  
  // Limit counts to avoid showing completed counts
  const limitedBalls = Math.min(balls, 3);
  const limitedStrikes = Math.min(strikes, 2);
  const limitedOuts = Math.min(gameState.outs, 2);

  return (
    <div className="bg-slate-800 text-white p-3 rounded-lg mb-6 font-sans">
      <div className="flex items-center justify-between">
        {/* Left side - Inning and score description */}
        <div className="flex-1">
          <span className="text-white font-medium text-lg">
            {gameState.inning_half === 'top' ? 'Top' : 'Bottom'} {gameState.inning}
            {gameState.inning === 1 ? 'st' : gameState.inning === 2 ? 'nd' : gameState.inning === 3 ? 'rd' : 'th'} Inning: {gameState.score}
          </span>
        </div>

        {/* Center - Diamond */}
        <div className="flex-shrink-0 mx-6">
          <div className="relative w-12 h-12">
            {/* 2nd base */}
            <div
              className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-2 ${
                isBaseOccupied('2nd') ? 'bg-blue-500 border-blue-500' : 'border-white bg-transparent'
              }`}
            />
            {/* 3rd base */}
            <div
              className={`absolute top-1/2 left-0 transform -translate-y-1/2 w-3 h-3 rotate-45 border-2 ${
                isBaseOccupied('3rd') ? 'bg-blue-500 border-blue-500' : 'border-white bg-transparent'
              }`}
            />
            {/* 1st base */}
            <div
              className={`absolute top-1/2 right-0 transform -translate-y-1/2 w-3 h-3 rotate-45 border-2 ${
                isBaseOccupied('1st') ? 'bg-blue-500 border-blue-500' : 'border-white bg-transparent'
              }`}
            />
            {/* Home plate */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white" />
          </div>
        </div>

        {/* Right side - Count display */}
        <div className="flex-shrink-0 space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-lg">B</span>
            <div className="flex space-x-1">
              {renderCircles(limitedBalls, 3)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-lg">S</span>
            <div className="flex space-x-1">
              {renderCircles(limitedStrikes, 2)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-white font-bold text-lg">O</span>
            <div className="flex space-x-1">
              {renderCircles(limitedOuts, 2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
