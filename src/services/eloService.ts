import { UserAnswer, LLMEvaluation } from '@/types';

export class EloService {
  private readonly K_FACTOR = 32;

  calculateExpectedScore(userElo: number, questionElo: number): number {
    return 1 / (1 + Math.pow(10, (questionElo - userElo) / 400));
  }

  calculateNewElo(
    currentElo: number,
    answers: UserAnswer[],
    evaluations: LLMEvaluation[]
  ): number {
    // Update Elo every 5 questions
    const blocksOfFive = Math.floor(answers.length / 5);
    let newElo = currentElo;

    for (let block = 0; block < blocksOfFive; block++) {
      const startIndex = block * 5;
      const endIndex = startIndex + 5;
      const blockAnswers = answers.slice(startIndex, endIndex);
      const blockEvaluations = evaluations.slice(startIndex, endIndex);

      // Calculate average question Elo for this block
      const avgQuestionElo = blockAnswers.reduce((sum, answer) => sum + answer.elo_target, 0) / blockAnswers.length;

      // Calculate actual score (correct answers / total questions)
      const correctAnswers = blockEvaluations.filter(evaluation => evaluation.is_correct).length;
      const actualScore = correctAnswers / blockAnswers.length;

      // Calculate expected score
      const expectedScore = this.calculateExpectedScore(newElo, avgQuestionElo);

      // Update Elo
      newElo = Math.round(newElo + this.K_FACTOR * (actualScore - expectedScore));

      // Keep Elo within reasonable bounds
      newElo = Math.max(800, Math.min(2000, newElo));
    }

    return newElo;
  }

  calculatePercentileRank(userElo: number): number {
    // Simple percentile calculation based on normal distribution
    // Assume mean Elo is 1200 and standard deviation is 200
    const mean = 1200;
    const stdDev = 200;
    const zScore = (userElo - mean) / stdDev;
    
    // Approximate percentile using cumulative distribution function
    const percentile = 0.5 * (1 + this.erf(zScore / Math.sqrt(2)));
    return Math.round(percentile * 100);
  }

  private erf(x: number): number {
    // Approximation of error function for percentile calculation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }
}

export const eloService = new EloService();
