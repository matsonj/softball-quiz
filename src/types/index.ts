export type Category = 'At Bat' | 'Pitching' | 'Fielding' | 'On Base';

export interface PromptTemplate {
  category: Category;
  prompt_template: string;
  elo_target: number;
}

export interface MultipleChoiceOption {
  option_id: string;
  text: string;
  is_correct: boolean;
  explanation?: string;
}

export interface GeneratedQuestion {
  question_id: string;
  category: Category;
  elo_target: number;
  prompt_template: string;
  question_text: string;
  game_state: GameState;
  generated_at: string;
  options: MultipleChoiceOption[];
}

export interface GameState {
  inning: number;
  inning_half: 'top' | 'bottom';
  count: string;
  outs: number;
  score: string;
  runners: string[];
}

export interface UserAnswer {
  question_id: string;
  question_text: string;
  user_answer: string;
  selected_option_id: string;
  is_correct: boolean;
  elo_target: number;
  prompt_template: string;
  game_state: GameState;
  timestamp: string;
}

export interface LLMEvaluation {
  question_id: string;
  is_correct: boolean;
  feedback: string;
  suggested_answer?: string;
}

export interface QuizSession {
  session_id: string;
  category: Category;
  total_questions: number;
  user_elo: number;
  start_time: string;
  end_time?: string;
  answers: UserAnswer[];
  evaluations: LLMEvaluation[];
  final_score?: number;
  final_elo?: number;
}

export interface QuizConfig {
  category: Category;
  questionCount: 5 | 10 | 20;
}
