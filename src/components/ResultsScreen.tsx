'use client';

import { useQuiz } from '@/context/QuizContext';
import { useMemo, useState } from 'react';
import { eloService } from '@/services/eloService';
import { UserAnswer, GeneratedQuestion, MultipleChoiceOption } from '@/types';

export default function ResultsScreen() {
  const { state, dispatch } = useQuiz();
  const [expandedCorrect, setExpandedCorrect] = useState<Set<string>>(new Set());
  
  const correctAnswers = useMemo(() => {
    return state.answers.filter(answer => answer.is_correct).length;
  }, [state.answers]);

  const totalQuestions = state.answers.length;
  const score = `${correctAnswers}/${totalQuestions}`;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const percentileRank = eloService.calculatePercentileRank(state.userElo);

  const allQuestionResults = useMemo(() => {
    return state.answers.map(answer => {
      const question = state.questions.find(q => q.question_id === answer.question_id);
      const selectedOption = question?.options.find(opt => opt.option_id === answer.selected_option_id);
      const correctOption = question?.options.find(opt => opt.is_correct);
      
      return {
        answer: answer,
        question: question,
        selectedOption: selectedOption,
        correctOption: correctOption,
        isCorrect: answer.is_correct
      };
    });
  }, [state.answers, state.questions]);

  const toggleCorrectExpanded = (questionId: string) => {
    const newExpanded = new Set(expandedCorrect);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedCorrect(newExpanded);
  };

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

  const getCoachFeedback = (result: {
    answer: UserAnswer;
    question: GeneratedQuestion | undefined;
    selectedOption: MultipleChoiceOption | undefined;
    correctOption: MultipleChoiceOption | undefined;
    isCorrect: boolean;
  }) => {
    if (result.isCorrect) return null;
    
    const encouragement = [
      "Good effort, but let's work on this!",
      "Nice try! Here's what I want you to remember:",
      "Not quite right, but you're learning!",
      "That's okay - even the pros make mistakes. Here's the key:",
      "Keep your head up! This is how we get better:"
    ];
    
    const randomEncouragement = encouragement[Math.floor(Math.random() * encouragement.length)];
    
    return `${randomEncouragement} You chose "${result.selectedOption?.text}", but the right play here is "${result.correctOption?.text}". ${result.correctOption?.explanation || 'This is the safer and smarter choice in this situation.'} Remember this for next time - you've got this!`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Score Summary */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Great job out there!
            </h1>
            <div className={`text-4xl font-bold mb-2 ${getScoreColor()}`}>
              {score}
            </div>
            <p className="text-xl text-gray-600">
              {percentage}% correct
            </p>
            <p className="text-gray-600 mt-2">
              {percentage >= 90 ? "Outstanding work! You really know your softball!" :
               percentage >= 70 ? "Solid performance! Keep practicing and you'll be a star!" :
               "Good effort! Every mistake is a chance to learn and improve!"}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800">{state.userElo}</div>
              <div className="text-sm text-gray-600">Skill Rating</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-800">{percentileRank}%</div>
              <div className="text-sm text-gray-600">Better Than</div>
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
            🥎 Practice Another Round
          </button>
        </div>

        {/* Coach Review */}
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-3">👩‍🏫</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Coach Review
            </h2>
          </div>
          
          <div className="space-y-4">
            {allQuestionResults.map((result, index) => (
              <div key={result.answer.question_id} className={`border rounded-lg transition-all duration-200 ${result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                
                {/* Correct Answer - Collapsible */}
                {result.isCorrect ? (
                  <div>
                    <button
                      onClick={() => toggleCorrectExpanded(result.answer.question_id)}
                      className="w-full text-left p-4 hover:bg-green-100 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-green-600 font-bold">✓</span>
                          <span className="font-medium text-gray-800">
                            Question {index + 1}: Correct!
                          </span>
                          <span className="text-sm text-gray-600">
                            Good job! 🎉
                          </span>
                        </div>
                        <span className="text-gray-400">
                          {expandedCorrect.has(result.answer.question_id) ? '▼' : '▶'}
                        </span>
                      </div>
                    </button>
                    
                    {expandedCorrect.has(result.answer.question_id) && (
                      <div className="px-4 pb-4 border-t border-green-200">
                        <div className="mt-3">
                          <p className="text-gray-700 mb-3 font-medium">
                            {result.question?.question_text}
                          </p>
                          <div className="bg-white p-3 rounded border border-green-200">
                            <p className="text-sm text-gray-600">Your answer:</p>
                            <p className="text-green-700 font-medium">
                              {result.selectedOption?.text}
                            </p>
                            {result.correctOption?.explanation && (
                              <p className="text-sm text-gray-600 mt-2">
                                {result.correctOption.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Incorrect Answer - Always Expanded with Coach Feedback */
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-red-600 font-bold">✗</span>
                      <span className="font-medium text-gray-800">
                        Question {index + 1}: Let&apos;s learn from this one
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4 font-medium">
                      {result.question?.question_text}
                    </p>
                    
                    {/* Game Situation */}
                    <div className="bg-gray-100 p-3 rounded mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Game Situation:</p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Inning: {result.answer.game_state?.inning_half} of the {result.answer.game_state?.inning}{result.answer.game_state?.inning === 1 ? 'st' : result.answer.game_state?.inning === 2 ? 'nd' : result.answer.game_state?.inning === 3 ? 'rd' : 'th'}</p>
                        <p>Count: {result.answer.game_state?.count} | Outs: {result.answer.game_state?.outs}</p>
                        <p>Score: Your team is {result.answer.game_state?.score}</p>
                        <p>Runners: {result.answer.game_state?.runners?.length > 0 ? result.answer.game_state.runners.join(', ') : 'None'}</p>
                      </div>
                    </div>
                    
                    {/* Coach Feedback */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 text-lg">🗣️</span>
                        <div>
                          <p className="text-blue-800 font-medium mb-2">Coach says:</p>
                          <p className="text-blue-700">
                            {getCoachFeedback(result)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Encouraging Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">⭐</span>
              <h3 className="text-lg font-bold text-gray-800">Remember</h3>
            </div>
            <p className="text-gray-700">
              {percentage >= 90 ? 
                "Excellent work! You're really mastering the fundamentals of softball. Keep this level of focus and you'll be teaching others soon!" :
                percentage >= 70 ?
                "You're on the right track! The questions you missed are great learning opportunities. Study those situations and you'll be ready for anything on the field!" :
                "Great effort! Softball has a lot of moving parts, and every player learns at their own pace. Focus on the basics, keep practicing, and remember - even the pros started where you are now. You've got this!"
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
