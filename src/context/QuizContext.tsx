'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Category, GeneratedQuestion, UserAnswer, LLMEvaluation, QuizSession } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { eloService } from '@/services/eloService';

type QuizState = {
  currentScreen: 'welcome' | 'setup' | 'question-loading' | 'quiz' | 'loading' | 'results';
  questions: GeneratedQuestion[];
  currentQuestionIndex: number;
  userElo: number;
  answers: UserAnswer[];
  evaluations: LLMEvaluation[];
  session: QuizSession | null;
  usedTemplates: string[];
  config: {
    category: Category | null;
    questionCount: 5 | 10 | 20 | null;
  };
};

type QuizAction = 
  | { type: 'SET_SCREEN'; payload: QuizState['currentScreen'] }
  | { type: 'SET_QUESTIONS'; payload: GeneratedQuestion[] }
  | { type: 'SET_CONFIG'; payload: { category: Category; questionCount: 5 | 10 | 20 } }
  | { type: 'SUBMIT_ANSWER'; payload: { answer: string; selectedOptionId: string; isCorrect: boolean } }
  | { type: 'NEXT_QUESTION' }
  | { type: 'SET_EVALUATIONS'; payload: LLMEvaluation[] }
  | { type: 'UPDATE_ELO'; payload: number }
  | { type: 'START_QUIZ' }
  | { type: 'START_LOADING_QUESTIONS' }
  | { type: 'RESET_QUIZ' };

const initialState: QuizState = {
  currentScreen: 'welcome',
  questions: [],
  currentQuestionIndex: 0,
  userElo: 900, // Start with easier questions (was 1200)
  answers: [],
  evaluations: [],
  session: null,
  usedTemplates: [],
  config: {
    category: null,
    questionCount: null,
  },
};

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    
    case 'SET_CONFIG':
      return { 
        ...state, 
        config: action.payload
      };
    
    case 'START_LOADING_QUESTIONS':
      return { ...state, currentScreen: 'question-loading' };
    
    case 'START_QUIZ':
      const session: QuizSession = {
        session_id: uuidv4(),
        category: state.config.category!,
        total_questions: state.config.questionCount!,
        user_elo: state.userElo,
        start_time: new Date().toISOString(),
        answers: [],
        evaluations: [],
      };
      return { ...state, session, currentQuestionIndex: 0, currentScreen: 'quiz' };
    
    case 'SUBMIT_ANSWER':
      const currentQuestion = state.questions[state.currentQuestionIndex];
      const newAnswer: UserAnswer = {
        question_id: currentQuestion.question_id,
        question_text: currentQuestion.question_text,
        user_answer: action.payload.answer,
        selected_option_id: action.payload.selectedOptionId,
        is_correct: action.payload.isCorrect,
        elo_target: currentQuestion.elo_target,
        prompt_template: currentQuestion.prompt_template,
        game_state: currentQuestion.game_state,
        timestamp: new Date().toISOString(),
      };
      
      return {
        ...state,
        answers: [...state.answers, newAnswer],
        usedTemplates: [...state.usedTemplates, currentQuestion.prompt_template],
      };
    
    case 'NEXT_QUESTION':
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, currentScreen: 'loading' };
      }
      return { ...state, currentQuestionIndex: nextIndex };
    
    case 'SET_EVALUATIONS':
      return { 
        ...state, 
        evaluations: action.payload,
        currentScreen: 'results'
      };
    
    case 'UPDATE_ELO':
      return { ...state, userElo: action.payload };
    
    case 'RESET_QUIZ':
      return {
        ...initialState,
        userElo: state.userElo,
        currentScreen: 'setup'
      };
    
    default:
      return state;
  }
}

const QuizContext = createContext<{
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  loadQuestions: (category: Category, userElo: number, count: number) => Promise<void>;
  evaluateAnswers: (answers: UserAnswer[]) => Promise<void>;
} | null>(null);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  
  const loadQuestions = async (category: Category, userElo: number, count: number) => {
    try {
      const excludeTemplates = state.usedTemplates.join(',');
      const response = await fetch(`/api/questions?category=${encodeURIComponent(category)}&userElo=${userElo}&count=${count}&excludeTemplates=${excludeTemplates}`);
      const data = await response.json();
      
      if (data.questions) {
        dispatch({ type: 'SET_QUESTIONS', payload: data.questions });
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const evaluateAnswers = async (answers: UserAnswer[]) => {
    try {
      console.log('Starting evaluation API call...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Evaluation API response:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (data.evaluations) {
        dispatch({ type: 'SET_EVALUATIONS', payload: data.evaluations });
        
        // Calculate new Elo rating
        const newElo = eloService.calculateNewElo(state.userElo, answers, data.evaluations);
        dispatch({ type: 'UPDATE_ELO', payload: newElo });
        
        console.log('Evaluation completed successfully');
      } else {
        throw new Error('No evaluations returned from API');
      }
    } catch (error) {
      console.error('Error evaluating answers:', error);
      
      // Re-throw so LoadingScreen can catch it
      throw error;
    }
  };
  
  return (
    <QuizContext.Provider value={{ state, dispatch, loadQuestions, evaluateAnswers }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
