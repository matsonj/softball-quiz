'use client';

import { useState, useEffect } from 'react';
import { loadingMessages } from '@/data/loadingMessages';

interface QuestionLoadingScreenProps {
  category: string;
  questionCount: number;
}

export default function QuestionLoadingScreen({ category, questionCount }: QuestionLoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    // Randomly select loading messages every 1.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(Math.floor(Math.random() * loadingMessages.length));
    }, 1500);

    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    // Animation for the softball
    const animationInterval = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 4);
    }, 300); // Faster animation

    return () => clearInterval(animationInterval);
  }, []);

  const getSoftballAnimation = () => {
    switch (animationFrame) {
      case 0:
        return '🥎';
      case 1:
        return '⚾';
      case 2:
        return '🥎';
      case 3:
        return '⚽';
      default:
        return '🥎';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-8 text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4 transition-all duration-300">
            {getSoftballAnimation()}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Generating Your Quiz
          </h2>
          <p className="text-gray-600">
            Creating {questionCount} {category} questions just for you!
          </p>
        </div>
        
        <div className="mb-8">
          <div className="animate-pulse bg-gray-200 h-2 rounded-full mb-4">
            <div className="bg-green-600 h-2 rounded-full w-2/3"></div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg min-h-[80px] flex items-center justify-center">
            <p className="text-gray-700 text-center font-medium transition-all duration-500">
              {loadingMessages[currentMessageIndex]}
            </p>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">
          Hang tight! We&apos;re crafting the perfect questions for your skill level...
        </p>
      </div>
    </div>
  );
}
