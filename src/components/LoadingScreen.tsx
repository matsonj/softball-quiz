'use client';

import { useEffect, useState } from 'react';
import { useQuiz } from '@/context/QuizContext';

export default function LoadingScreen() {
  const { state, evaluateAnswers } = useQuiz();
  const [animationFrame, setAnimationFrame] = useState(0);
  const [hasStartedEvaluation, setHasStartedEvaluation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 5);
    }, 200); // 5 FPS

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Trigger evaluation when loading screen mounts
    if (!hasStartedEvaluation && state.answers.length > 0) {
      setHasStartedEvaluation(true);
      setDebugInfo(`Starting evaluation of ${state.answers.length} answers...`);
      console.log('Starting evaluation of', state.answers.length, 'answers');
      
      evaluateAnswers(state.answers).catch((error) => {
        console.error('Evaluation failed:', error);
        setError(`Failed to evaluate answers: ${error.message || error}`);
      });
    }
  }, [state.answers, evaluateAnswers, hasStartedEvaluation]);

  const getAnimationText = () => {
    switch (animationFrame) {
      case 0:
        return '🏏 Hitter prepares...';
      case 1:
        return '💥 Bat connects!';
      case 2:
        return '🥎 Fielder catches!';
      case 3:
        return '🔄 Fielder throws to pitcher...';
      case 4:
        return '⚾ Pitcher throws to hitter...';
      default:
        return '🏏 Hitter prepares...';
    }
  };

  const getAnimationIcon = () => {
    switch (animationFrame) {
      case 0:
        return '🏏';
      case 1:
        return '💥';
      case 2:
        return '🥎';
      case 3:
        return '🔄';
      case 4:
        return '⚾';
      default:
        return '🏏';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4 transition-all duration-200">
            {getAnimationIcon()}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Softball in progress...
          </h2>
          <p className="text-gray-600 text-lg">
            {getAnimationText()}
          </p>
        </div>
        
        <div className="mb-6">
          <div className="animate-pulse bg-gray-200 h-2 rounded-full">
            <div className="bg-purple-600 h-2 rounded-full w-3/4"></div>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">
          Evaluating your answers...
        </p>
        <p className="text-gray-400 text-xs mt-2">
          This may take a moment while our AI coach reviews your responses
        </p>
        {debugInfo && (
          <p className="text-gray-400 text-xs mt-2 font-mono">
            {debugInfo}
          </p>
        )}
      </div>
    </div>
  );
}
