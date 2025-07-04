# 🥎 Olivia's Magical Softball Quiz Machine

A mobile-first web application that tests softball knowledge with adaptive difficulty and AI-powered feedback.

## Features

- **Adaptive Difficulty**: Questions adjust based on your Elo rating
- **AI Feedback**: OpenAI GPT-3.5 provides coach-style feedback
- **Mobile-First Design**: Optimized for tablets and phones
- **Free-Text Input**: No multiple choice - write what you think!
- **Three Categories**: Up to Bat, On the Field, On Base
- **Sound Effects**: Classic metal bat "ping" sound

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
1. **Welcome Screen**: Introduction and instructions
2. **Quiz Setup**: Choose category and number of questions
3. **Quiz**: Answer questions with free-text input
4. **Loading**: Animated screen while AI evaluates answers
5. **Results**: Score, Elo rating, and feedback on missed questions

### Elo Rating System
- Starting Elo: 1200
- Updated every 5 questions
- Questions matched within ±50 Elo (expanding if needed)
- Rating affects future question difficulty

### AI Evaluation
- Uses OpenAI GPT-3.5 Turbo
- Provides coach-style feedback
- Evaluates correctness based on softball rules and strategy

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
│   │   ├── evaluate/    # LLM evaluation endpoint
│   │   └── questions/   # Question loading endpoint
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # App layout
│   └── page.tsx         # Main app component
├── components/
│   ├── WelcomeScreen.tsx
│   ├── QuizSetupScreen.tsx
│   ├── QuizScreen.tsx
│   ├── LoadingScreen.tsx
│   └── ResultsScreen.tsx
├── context/
│   └── QuizContext.tsx  # Global state management
├── data/
│   └── sampleQuestions.ts # Sample question data
├── services/
│   ├── questionService.ts # Question loading and filtering
│   └── eloService.ts     # Elo rating calculations
├── types/
│   └── index.ts         # TypeScript type definitions
└── utils/
    └── sound.ts         # Sound effect utilities
```

## API Endpoints

### GET /api/questions
Load questions based on category and user Elo rating.

**Query Parameters:**
- `category`: "Up to Bat" | "On the Field" | "On Base"
- `userElo`: number (default: 1200)
- `count`: number (default: 10)
- `excludeIds`: comma-separated question IDs to exclude

### POST /api/evaluate
Evaluate user answers using OpenAI.

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": "string",
      "question_text": "string",
      "user_answer": "string",
      "question_elo": number,
      "timestamp": "string"
    }
  ]
}
```

## Question Data Format

Questions are stored with the following structure:

```typescript
interface Question {
  question_id: string;
  category: 'Up to Bat' | 'On the Field' | 'On Base';
  elo_rating: number;
  question_text: string;
  correct_answer: string;
  explanation_prompt: string;
  game_state_json: string; // JSON with inning, count, outs, score, runners
}
```

## Future Enhancements

- **S3 Integration**: Store questions in S3 CSV and session logs
- **User Accounts**: Save progress across sessions
- **Leaderboards**: Compare with other players
- **More Categories**: Add pitching, coaching scenarios
- **Advanced Analytics**: Detailed performance tracking

## Sound Assets

The app includes a ping sound effect. Replace `public/sounds/ping.mp3` with your own audio file for the metal bat sound.

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
