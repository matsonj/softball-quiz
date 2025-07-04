'use client';

import { useQuiz } from '@/context/QuizContext';
import { useState, useEffect } from 'react';
import { GeneratedQuestion } from '@/types';
import { playPingSound } from '@/utils/sound';

export default function QuizScreen() {
  const { state, dispatch } = useQuiz();
  const [answer, setAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null);

  useEffect(() => {
    if (state.questions.length > 0 && state.currentQuestionIndex < state.questions.length) {
      setCurrentQuestion(state.questions[state.currentQuestionIndex]);
    }
  }, [state.questions, state.currentQuestionIndex]);



  const handleSubmit = () => {
    if (!answer.trim()) return;
    
    // Play ping sound
    playPingSound();
    
    dispatch({ type: 'SUBMIT_ANSWER', payload: answer });
    dispatch({ type: 'NEXT_QUESTION' });
    
    setAnswer('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {state.currentQuestionIndex + 1} of {state.questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {state.config.category}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-orange-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Game State */}
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Game Situation:</h3>
          <div className="text-sm text-gray-600">
            <div>Inning: {currentQuestion.game_state.inning_half} of the {currentQuestion.game_state.inning}{currentQuestion.game_state.inning === 1 ? 'st' : currentQuestion.game_state.inning === 2 ? 'nd' : currentQuestion.game_state.inning === 3 ? 'rd' : 'th'}</div>
            <div>Batting: {currentQuestion.game_state.inning_half === 'top' ? 'Visitors' : 'Home'} | Fielding: {currentQuestion.game_state.inning_half === 'top' ? 'Home' : 'Visitors'}</div>
            <div>Count: {currentQuestion.game_state.count}</div>
            <div>Outs: {currentQuestion.game_state.outs}</div>
            <div>Score: {currentQuestion.game_state.score}</div>
            <div>Runners: {currentQuestion.game_state.runners.length > 0 ? currentQuestion.game_state.runners.join(', ') : 'None'}</div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {currentQuestion.question_text}
          </h2>
          
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here..."
            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none h-32 text-gray-700"
            autoFocus
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!answer.trim()}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
            answer.trim()
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Submit Answer
        </button>

        <p className="text-sm text-gray-500 mt-2 text-center">
          Press Enter to submit
        </p>
      </div>
    </div>
  );
}
