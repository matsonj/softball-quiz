'use client';

import { useQuiz } from '@/context/QuizContext';
import { useState } from 'react';
import { Category } from '@/types';

export default function QuizSetupScreen() {
  const { state, dispatch, loadQuestions } = useQuiz();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCount, setSelectedCount] = useState<5 | 10 | 20 | null>(null);


  const categories: Category[] = ['At Bat', 'Pitching', 'Fielding', 'On Base'];
  const questionCounts = [5, 10, 20] as const;

  const handleStart = async () => {
    if (selectedCategory && selectedCount) {
      // Set configuration
      dispatch({ 
        type: 'SET_CONFIG', 
        payload: { 
          category: selectedCategory, 
          questionCount: selectedCount 
        } 
      });
      
      // Start loading screen
      dispatch({ type: 'START_LOADING_QUESTIONS' });
      
      // Load questions
      await loadQuestions(selectedCategory, state.userElo, selectedCount);
      
      // Start the quiz
      dispatch({ type: 'START_QUIZ' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🥎</h1>
          <h2 className="text-xl font-semibold text-gray-700">
  Let&apos;s set up your quiz!
          </h2>
        </div>

        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Choose your category:
            </h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedCategory === category
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Selection */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              How many questions?
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedCount === count
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!selectedCategory || !selectedCount}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
              selectedCategory && selectedCount
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Quiz!
          </button>
        </div>
      </div>
    </div>
  );
}
