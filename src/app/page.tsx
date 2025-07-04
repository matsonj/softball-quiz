'use client';

import { QuizProvider, useQuiz } from '@/context/QuizContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuizSetupScreen from '@/components/QuizSetupScreen';
import QuizScreen from '@/components/QuizScreen';
import LoadingScreen from '@/components/LoadingScreen';
import ResultsScreen from '@/components/ResultsScreen';

function QuizApp() {
  const { state } = useQuiz();

  switch (state.currentScreen) {
    case 'welcome':
      return <WelcomeScreen />;
    case 'setup':
      return <QuizSetupScreen />;
    case 'quiz':
      return <QuizScreen />;
    case 'loading':
      return <LoadingScreen />;
    case 'results':
      return <ResultsScreen />;
    default:
      return <WelcomeScreen />;
  }
}

export default function Home() {
  return (
    <QuizProvider>
      <QuizApp />
    </QuizProvider>
  );
}
