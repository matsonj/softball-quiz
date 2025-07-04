'use client';

import { QuizProvider, useQuiz } from '@/context/QuizContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import QuizSetupScreen from '@/components/QuizSetupScreen';
import QuestionLoadingScreen from '@/components/QuestionLoadingScreen';
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
    case 'question-loading':
      return (
        <QuestionLoadingScreen 
          category={state.config.category || 'At Bat'}
          questionCount={state.config.questionCount || 10}
        />
      );
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
