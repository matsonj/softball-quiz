'use client';

import { useQuiz } from '@/context/QuizContext';
import { useState } from 'react';
import { Category } from '@/types';

export default function QuizSetupScreen() {
  const { state, dispatch, loadQuestions } = useQuiz();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCount, setSelectedCount] = useState<5 | 10 | 20 | null>(5);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1000);


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
      await loadQuestions(selectedCategory, selectedDifficulty, selectedCount);
      
      // Start the quiz
      dispatch({ type: 'START_QUIZ' });
    }
  };

  const getDifficultyLabel = (elo: number) => {
    if (elo <= 900) return 'Easy';
    if (elo <= 1300) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-3 py-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-5">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">🥎</h1>
          <h2 className="text-lg font-semibold text-gray-700">
  Let&apos;s set up your quiz!
          </h2>
        </div>

        <div className="space-y-5">
          {/* Category Selection */}
          <div>
            <h3 className="text-base font-medium text-gray-700 mb-2">
              Choose your category:
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`p-2 text-sm rounded-lg border-2 transition-all duration-200 ${
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
            <h3 className="text-base font-medium text-gray-700 mb-2">
              How many questions?
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {questionCounts.map((count) => (
                <button
                  key={count}
                  onClick={() => setSelectedCount(count)}
                  className={`p-2 text-sm rounded-lg border-2 transition-all duration-200 ${
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

          {/* Difficulty Selection */}
          <div>
            <h3 className="text-base font-medium text-gray-700 mb-2">
              Difficulty: {getDifficultyLabel(selectedDifficulty)} ({selectedDifficulty} ELO)
            </h3>
            <div className="px-2">
              <input
                type="range"
                min="800"
                max="1600"
                step="25"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Easy</span>
                <span>Medium</span>
                <span>Hard</span>
              </div>
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
