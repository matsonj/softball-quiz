import { GameState } from '@/types';

export class GameStateGenerator {
  private static readonly COUNTS = [
    '0-0', '0-1', '0-2', '1-0', '1-1', '1-2', '2-0', '2-1', '2-2', '3-0', '3-1', '3-2'
  ];
  
  private static readonly RUNNER_CONFIGURATIONS = [
    [],
    ['Runner on 1st'],
    ['Runner on 2nd'],
    ['Runner on 3rd'],
    ['Runner on 1st', 'Runner on 2nd'],
    ['Runner on 1st', 'Runner on 3rd'],
    ['Runner on 2nd', 'Runner on 3rd'],
    ['Runner on 1st', 'Runner on 2nd', 'Runner on 3rd']
  ];

  static generateGameState(category?: string): GameState {
    const inning = this.randomInt(1, 7);
    const inning_half = this.randomChoice(['top', 'bottom'] as const);
    const count = this.randomChoice(this.COUNTS);
    const outs = this.randomInt(0, 2);
    const yourScore = this.randomInt(0, 8);
    const opponentScore = this.randomInt(0, 8);
    
    // For "On Base" category, ensure there's at least one runner on base
    let runners: string[];
    if (category === 'On Base') {
      // Filter out empty configurations for On Base questions
      const runnersOnBaseConfigurations = this.RUNNER_CONFIGURATIONS.filter(config => config.length > 0);
      runners = this.randomChoice(runnersOnBaseConfigurations);
    } else {
      runners = this.randomChoice(this.RUNNER_CONFIGURATIONS);
    }
    
    // Create simple score differential
    let scoreDiff: string;
    if (yourScore > opponentScore) {
      scoreDiff = `ahead by ${yourScore - opponentScore}`;
    } else if (yourScore < opponentScore) {
      scoreDiff = `behind by ${opponentScore - yourScore}`;
    } else {
      scoreDiff = 'tied';
    }
    
    return {
      inning,
      inning_half,
      count,
      outs,
      score: scoreDiff,
      runners
    };
  }
  
  static formatGameStateForPrompt(gameState: GameState): string {
    return `Game Situation:
- Inning: ${gameState.inning_half} of the ${gameState.inning}${this.getOrdinalSuffix(gameState.inning)}
- Count: ${gameState.count}
- Outs: ${gameState.outs}
- Score: Your team is ${gameState.score}
- Runners: ${gameState.runners.length > 0 ? gameState.runners.join(', ') : 'None'}`;
  }
  
  private static getOrdinalSuffix(num: number): string {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = num % 100;
    return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
  }
  
  private static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  private static randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
}
