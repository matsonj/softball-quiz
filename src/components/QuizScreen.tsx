'use client';

import { useQuiz } from '@/context/QuizContext';
import { useState, useEffect } from 'react';
import { GeneratedQuestion } from '@/types';
import { playPingSound } from '@/utils/sound';
import GameStateOverlay from './GameStateOverlay';

export default function QuizScreen() {
  const { state, dispatch } = useQuiz();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null);

  useEffect(() => {
    if (state.questions.length > 0 && state.currentQuestionIndex < state.questions.length) {
      setCurrentQuestion(state.questions[state.currentQuestionIndex]);
      setSelectedOptionId(null); // Reset selection for new question
    }
  }, [state.questions, state.currentQuestionIndex]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOptionId || !currentQuestion) return;
    
    // Play ping sound
    playPingSound();
    
    const selectedOption = currentQuestion.options.find(opt => opt.option_id === selectedOptionId);
    const answerText = selectedOption ? selectedOption.text : '';
    const isCorrect = selectedOption ? selectedOption.is_correct : false;
    
    dispatch({ 
      type: 'SUBMIT_ANSWER', 
      payload: { 
        answer: answerText, 
        selectedOptionId, 
        isCorrect 
      } 
    });
    dispatch({ type: 'NEXT_QUESTION' });
    
    setSelectedOptionId(null);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-3 py-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Q{state.currentQuestionIndex + 1}/{state.questions.length}
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

        {/* Game State Overlay */}
        <GameStateOverlay gameState={currentQuestion.game_state} />

        {/* Question */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {currentQuestion.question_text}
          </h2>
          
          {/* Multiple Choice Options */}
          <div className="space-y-2">
            {currentQuestion.options.map((option) => (
              <button
                key={option.option_id}
                onClick={() => handleOptionSelect(option.option_id)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                  selectedOptionId === option.option_id
                    ? 'border-orange-500 bg-orange-50 text-orange-800'
                    : 'border-gray-300 bg-white hover:border-gray-400 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="font-semibold text-sm bg-gray-100 px-2 py-1 rounded min-w-[24px] text-center">
                    {option.option_id}
                  </span>
                  <span className="flex-1 text-sm">{option.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedOptionId}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
            selectedOptionId
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Submit Answer
        </button>

        <p className="text-sm text-gray-500 mt-2 text-center">
          Select an option and click Submit
        </p>
      </div>
    </div>
  );
}
