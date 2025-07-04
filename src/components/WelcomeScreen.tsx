'use client';

import { useQuiz } from '@/context/QuizContext';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function WelcomeScreen() {
  const { dispatch } = useQuiz();


  useEffect(() => {
    const hasReadCookie = Cookies.get('olivia-quiz-read');
    if (hasReadCookie) {
      dispatch({ type: 'SET_SCREEN', payload: 'setup' });
    }
  }, [dispatch]);

  const handleSkip = () => {
    Cookies.set('olivia-quiz-read', 'true', { expires: 365 });
    dispatch({ type: 'SET_SCREEN', payload: 'setup' });
  };

  const handleContinue = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'setup' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🥎</h1>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
Olivia&apos;s Magical Softball Quiz Machine
          </h1>
        </div>
        
        <div className="text-left mb-8 space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-700 mb-2">How it works:</h2>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Choose your category: Up to Bat, On the Field, or On Base</li>
              <li>• Select number of questions: 10, 20, or 50</li>
              <li>• Answer using free text - write what you think!</li>
              <li>• Get feedback on incorrect answers at the end</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleSkip}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
I&apos;ve read this before!
          </button>
          
          <button
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
Let&apos;s get started!
          </button>
        </div>
      </div>
    </div>
  );
}
