'use client';

import { useQuiz } from '@/context/QuizContext';
import { useMemo } from 'react';
import { eloService } from '@/services/eloService';

export default function ResultsScreen() {
  const { state, dispatch } = useQuiz();
  
  const correctAnswers = useMemo(() => {
    return state.evaluations.filter(evaluation => evaluation.is_correct).length;
  }, [state.evaluations]);

  const totalQuestions = state.answers.length;
  const score = `${correctAnswers}/${totalQuestions}`;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const percentileRank = eloService.calculatePercentileRank(state.userElo);

  const allQuestionResults = useMemo(() => {
    return state.answers.map(answer => {
      const evaluation = state.evaluations.find(evaluation => evaluation.question_id === answer.question_id);
      return {
        answer: answer,
        evaluation: evaluation,
        isCorrect: evaluation?.is_correct || false
      };
    });
  }, [state.evaluations, state.answers]);

  const handlePlayAgain = () => {
    dispatch({ type: 'RESET_QUIZ' });
  };

  const getScoreColor = () => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = () => {
    if (percentage >= 90) return '🏆';
    if (percentage >= 70) return '🥎';
    return '⚾';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Score Summary */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Quiz Complete!
            </h1>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>
              {score}
            </div>
            <p className="text-xl text-gray-600">
              {percentage}% correct
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800">{state.userElo}</div>
              <div className="text-sm text-gray-600">Final Elo Rating</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800">{percentileRank}%</div>
              <div className="text-sm text-gray-600">Percentile Rank</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800">{state.config.category}</div>
              <div className="text-sm text-gray-600">Category</div>
            </div>
          </div>

          <button
            onClick={handlePlayAgain}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Play Again
          </button>
        </div>

        {/* Detailed Results for Debugging */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Detailed Results (Debug Mode)
          </h2>
          
          <div className="space-y-8">
            {allQuestionResults.map((result, index) => (
              <div key={result.answer.question_id} className={`border-l-4 pl-4 ${result.isCorrect ? 'border-green-400' : 'border-red-400'}`}>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Question {index + 1}:
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      result.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">
                    {result.answer.question_text}
                  </p>
                </div>

                {/* Game State */}
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-600 mb-1">Game Situation:</p>
                  <div className="text-xs text-gray-700 grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      Inning: {result.answer.game_state?.inning_half || 'N/A'} of the {result.answer.game_state?.inning || 'N/A'}{result.answer.game_state?.inning === 1 ? 'st' : result.answer.game_state?.inning === 2 ? 'nd' : result.answer.game_state?.inning === 3 ? 'rd' : 'th'}
                    </div>
                    <div>Batting: {result.answer.game_state?.inning_half === 'top' ? 'Visitors' : 'Home'}</div>
                    <div>Fielding: {result.answer.game_state?.inning_half === 'top' ? 'Home' : 'Visitors'}</div>
                    <div>Count: {result.answer.game_state?.count || 'N/A'}</div>
                    <div>Outs: {result.answer.game_state?.outs ?? 'N/A'}</div>
                    <div className="col-span-2">Score: {result.answer.game_state?.score || 'N/A'}</div>
                    <div className="col-span-2">
                      Runners: {result.answer.game_state?.runners?.length > 0 
                        ? result.answer.game_state.runners.join(', ') 
                        : 'None'}
                    </div>
                  </div>
                </div>

                {/* Prompt Template */}
                <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-600 mb-1">Prompt Template:</p>
                  <p className="text-xs text-gray-700 italic">
                    {result.answer.prompt_template}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Target Elo: {result.answer.elo_target}
                  </p>
                </div>
                
                {/* User Answer */}
                <div className={`p-3 rounded-lg mb-3 ${result.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                  <p className="text-sm text-gray-600 mb-1">Your answer:</p>
                  <p className="text-gray-800 italic">
                    &quot;{result.answer.user_answer}&quot;
                  </p>
                </div>
                
                {/* AI Evaluation */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">AI Coach Evaluation:</p>
                  {result.evaluation ? (
                    <div>
                      <p className="text-gray-800 mb-3">
                        {result.evaluation.feedback}
                      </p>
                      {result.evaluation.suggested_answer && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <p className="text-sm text-gray-600 mb-1">Suggested answer:</p>
                          <p className="text-gray-800 font-medium">
                            {result.evaluation.suggested_answer}
                          </p>
                        </div>
                      )}
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <p className="text-xs text-gray-500">
                          Evaluation Status: {result.evaluation ? 'Completed' : 'Failed'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <p className="font-medium">⚠️ No evaluation data found</p>
                      <p className="text-sm">This indicates the AI evaluation failed or was not completed.</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Debug Summary */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Debug Summary:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Total Answers: {state.answers.length}</p>
              <p>Total Evaluations: {state.evaluations.length}</p>
              <p>Successful Evaluations: {state.evaluations.filter(e => e.feedback && !e.feedback.includes('Sorry, I had trouble')).length}</p>
              <p>Failed Evaluations: {state.evaluations.filter(e => e.feedback && e.feedback.includes('Sorry, I had trouble')).length}</p>
              <p>Missing Evaluations: {state.answers.length - state.evaluations.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
