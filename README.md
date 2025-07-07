# 🥎 Olivia's Magical Softball Quiz Machine

A mobile-first web application that tests softball knowledge with adaptive difficulty and AI-powered feedback. Features dynamic question generation, TV-style game overlays, and intelligent coaching feedback.

## ✨ Key Features

- **🎯 Adaptive Difficulty**: ELO-based system with user-selectable difficulty (800-1600)
- **🤖 AI-Powered**: Dynamic question generation and coaching feedback via OpenAI GPT-3.5
- **📱 Mobile-First**: Compact design optimized for tablets and phones
- **⚡ Multiple Choice**: Smart option-based questions with detailed explanations  
- **🏟️ TV-Style Overlay**: Professional baseball broadcast-style game state display
- **📊 Four Categories**: At Bat, Pitching, Fielding, On Base (78+ prompt templates)
- **🔊 Sound Effects**: Metal bat "ping" sound with audio controls
- **🎮 Game State Context**: Dynamic inning, count, score, and base runner scenarios

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd softball-quiz
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### User Flow
1. **Welcome Screen**: Introduction and instructions (cookie-based skip option)
2. **Quiz Setup**: Choose category, question count (5/10/20), and difficulty (800-1600 ELO)
3. **Quiz**: Answer multiple-choice questions with TV-style game state overlay
4. **Loading**: Animated screen with softball theme while processing results
5. **Results**: Score, Elo rating, and detailed coaching feedback with game context

### 🎯 Adaptive Difficulty System
- **Starting ELO**: 900 (beginner-friendly)
- **User Control**: Manual difficulty selection (800-1600) overrides adaptive system
- **Template Matching**: Questions selected within ±50 ELO, expanding to ±500 if needed
- **Progressive Scaling**: Template reuse with different game states for variety
- **Category Distribution**: 78+ templates across 4 categories with balanced difficulty spread

### 🤖 LLM-Driven Architecture
- **Dynamic Generation**: Questions created in real-time using prompt templates
- **Game State Context**: Realistic softball scenarios (inning, count, score, runners)
- **Category Intelligence**: "On Base" questions guarantee runners on base
- **Coaching Feedback**: Encouraging, detailed explanations for wrong answers
- **No State Duplication**: Questions focus on decisions, not repeating visible game info

## Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-3.5 Turbo
- **State Management**: React Context + useReducer
- **Deployment**: Vercel-ready

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── evaluate/    # LLM evaluation endpoint (unused - MC direct scoring)
│   │   └── questions/   # Dynamic question generation via LLM
│   ├── globals.css      # Global styles + custom slider/overlay CSS
│   ├── layout.tsx       # App layout with softball favicon
│   └── page.tsx         # Main app component
├── components/
│   ├── WelcomeScreen.tsx
│   ├── QuizSetupScreen.tsx      # Category, count, difficulty selection
│   ├── QuizScreen.tsx           # MC questions with game state overlay
│   ├── LoadingScreen.tsx        # Softball-themed loading animation
│   ├── ResultsScreen.tsx        # Score, coaching feedback, debug mode
│   ├── QuestionLoadingScreen.tsx # Question generation loading
│   └── GameStateOverlay.tsx     # TV-style baseball overlay
├── context/
│   └── QuizContext.tsx  # Global state management with useReducer
├── data/
│   ├── prompt-templates.csv     # 78+ LLM prompt templates
│   ├── categoryInstructions.ts  # Category-specific AI instructions
│   └── loadingMessages.ts       # Random loading messages
├── services/
│   ├── questionService.ts       # Template selection and filtering
│   ├── eloService.ts           # ELO rating calculations
│   ├── gameStateGenerator.ts   # Dynamic game state creation
│   └── csvParser.ts            # CSV template parsing
├── types/
│   └── index.ts         # TypeScript definitions for game state, templates
└── utils/
    └── sound.ts         # Web Audio API + MP3 sound effects
```

## API Endpoints

### GET /api/questions
Dynamically generate questions using LLM with prompt templates and game states.

**Query Parameters:**
- `category`: "At Bat" | "Pitching" | "Fielding" | "On Base"
- `userElo`: number (difficulty level 800-1600)
- `count`: number (5, 10, or 20 questions)

**Response:**
```typescript
interface GeneratedQuestion {
  question_id: string;
  category: Category;
  elo_target: number;
  prompt_template: string;
  question_text: string;
  game_state: GameState;  // Dynamic inning, count, score, runners
  options: MultipleChoiceOption[];
}
```

### POST /api/evaluate
*(Currently unused - multiple choice questions are scored directly)*

## 📊 Game State & Template System

### Dynamic Game State
```typescript
interface GameState {
  inning: number;              // 1-7
  inning_half: 'top' | 'bottom';
  count: string;               // "2-1", "3-2", etc.
  outs: number;                // 0-2
  score: string;               // "ahead by 3", "tied", etc.
  runners: string[];           // ["Runner on 1st", "Runner on 3rd"]
}
```

### Prompt Template Structure
```typescript
interface PromptTemplate {
  category: Category;
  prompt_template: string;     // LLM instruction template
  elo_target: number;          // Difficulty level (800-1600)
}
```

## 🎨 UI/UX Features

### TV-Style Game State Overlay
- **Professional Design**: Mimics baseball broadcast overlays
- **Diamond Visualization**: Shows occupied bases with blue indicators
- **Count Display**: Visual balls (3), strikes (2), outs (2) with filled/empty circles
- **Context-Aware**: Displays inning and score situation dynamically

### Mobile-Optimized Layout
- **Compact Design**: Fits on mobile screens without scrolling
- **Grid Categories**: 2x2 category selection for better space usage
- **Reduced Padding**: Optimized spacing for mobile devices
- **Touch-Friendly**: Large tap targets and smooth interactions

## 🔊 Sound Effects

The app includes Web Audio API sound generation with MP3 fallback:
- **Placeholder Sound**: Programmatic metal bat ping using oscillators
- **MP3 Support**: Custom audio file playback with 3-second duration limit
- **Audio Controls**: Starts at 1.5s into audio file, plays for 2 seconds

## 🚀 Recent Improvements

### Dynamic Question Generation (Latest)
- **LLM-Powered**: Questions generated in real-time using OpenAI
- **78+ Templates**: Comprehensive prompt template library
- **Smart Game States**: "On Base" category guarantees runners on base
- **No Duplication**: Focus on decisions, not repeating visible information

### Enhanced User Experience
- **Difficulty Control**: User-selectable ELO rating (800-1600)
- **Default Optimization**: 5 questions, 1000 ELO for quick starts
- **TV-Style Overlay**: Professional game state visualization
- **Compact Mobile**: Reduced scrolling, optimized for mobile screens

## Future Enhancements

- **S3 Integration**: Store prompt templates in S3, add session logging
- **Advanced Analytics**: Track performance trends and learning progress
- **Social Features**: Leaderboards, sharing results, team competitions  
- **Content Expansion**: More categories (coaching, umpiring, advanced strategy)
- **Adaptive Learning**: ML-powered difficulty adjustment based on performance patterns

## Deployment

The app is ready for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
