# Olivia's Magical Softball Quiz Machine - Agent Information

## Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Testing
- Currently no tests implemented (future enhancement)

## Project Structure

- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **State Management**: React Context + useReducer  
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **Mobile-First**: Optimized for iPads/iPhones

## Environment Variables Required

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Key Components

1. **WelcomeScreen** - Introduction and instructions with cookie-based skip
2. **QuizSetupScreen** - Category and question count selection (10, 20, 50)
3. **QuizScreen** - Main quiz interface with free-text input and game state display
4. **LoadingScreen** - Animated evaluation screen with error handling and debug info
5. **ResultsScreen** - Score, Elo rating, feedback, and comprehensive debug mode

## API Routes

- **GET /api/questions** - Generate questions dynamically using LLM with prompt templates
- **POST /api/evaluate** - Evaluate answers using OpenAI with lenient, encouraging feedback

## Core Architecture

### **LLM-Driven Question Generation**
- **Prompt Templates**: 78+ curated templates stored in `src/data/prompt-templates.csv`
- **Dynamic Game State**: Generates realistic softball scenarios (inning, count, score, runners, top/bottom)
- **Context-Aware Questions**: AI generates questions that fit the specific game situation
- **No State Duplication**: Questions focus on decisions, not repeating visible game state

### **Adaptive Difficulty System**
- **Starting Elo**: 900 (easy questions for beginners)
- **Elo Range Matching**: Selects templates within ±50 Elo, expands to ±500 if needed
- **Template Reuse**: Duplicates templates with different game states when insufficient variety
- **Progressive Difficulty**: User Elo adjusts based on performance every 5 questions

### **Enhanced Game State**
- **Inning Context**: "top of the 3rd" vs "bottom of the 7th" 
- **Team Roles**: Clear batting team vs fielding team identification
- **Strategic Context**: Late-game pressure, walk-off situations, etc.
- **Complete Scenarios**: Count, outs, score, baserunners all contextually relevant

## Categories & Templates

### **Four Categories** (78 total templates):
- **At Bat**: 20 templates (Elo 800-1500) - Batting decisions and strategy
- **Pitching**: 19 templates (Elo 800-1600) - Pitching strategy and mechanics  
- **Fielding**: 20 templates (Elo 800-1500) - Defensive positioning and reactions
- **On Base**: 19 templates (Elo 800-1400) - Base running decisions and timing

### **Difficulty Distribution**:
- **Beginner (800-950)**: 20 templates - Basic fundamentals and safety
- **Intermediate (1000-1300)**: 40 templates - Strategic thinking and game awareness
- **Advanced (1400-1600)**: 18 templates - Complex situations and expert knowledge

## AI Evaluation System

### **Lenient, Encouraging Judge**
- **Generous Scoring**: Credits reasonable softball knowledge and strategic thinking
- **Multiple Valid Approaches**: Recognizes there are often several correct answers
- **Coaching Style**: Always encouraging, builds confidence while teaching
- **Detailed Feedback**: Explains reasoning and provides suggested improvements

### **Debug Features**
- **Comprehensive Results Display**: Shows all questions, answers, and evaluations
- **Server-Side Logging**: Detailed API call tracking and error reporting
- **Template Usage Tracking**: Prevents repetition within sessions
- **Error Handling**: Graceful fallbacks with user-friendly error messages

## Key Features Implemented

✅ **Core Functionality**
- Mobile-first responsive design  
- Elo-based adaptive difficulty starting at 900
- LLM-powered dynamic question generation  
- AI-powered lenient evaluation with coaching feedback
- Free-text input system with sound effects

✅ **User Experience**  
- Cookie-based welcome screen skip
- Four comprehensive categories with 78+ prompt templates
- Dynamic game state generation with inning halves
- Loading animation with softball theme and debug info
- Detailed results with debug mode for troubleshooting

✅ **Technical Features**
- Context-aware question generation (no state duplication)
- Progressive Elo range expansion (±50 to ±500)
- Template reuse with different game states for variety
- Comprehensive error handling and debugging
- 60-second API timeouts with graceful failures

## Recent Improvements (This Session)

### **LLM-Driven Architecture**
- Migrated from static questions to dynamic LLM generation
- Created comprehensive prompt template system
- Added game state context to question generation

### **Enhanced Difficulty System**
- Lowered starting Elo from 1200 → 900 for easier onboarding
- Improved template selection with progressive range expansion
- Added template duplication to guarantee full question counts

### **Better User Experience**
- Removed redundant game state from question text
- Added comprehensive debug mode to results screen
- Improved AI judge to be more lenient and encouraging
- Enhanced game state with top/bottom inning context

### **Robust Error Handling**
- Added detailed server-side logging for debugging
- Implemented timeout protection for API calls
- Created fallback mechanisms for template selection
- Added user-friendly error messages and retry options

## Deployment

The app is ready for Vercel deployment:
1. Connect GitHub repository  
2. Set `OPENAI_API_KEY` environment variable
3. Deploy automatically on push
4. Supports 10, 20, or 50 question quizzes with guaranteed question counts

## Future Enhancements

- **S3 Integration**: Move prompt templates to S3, add session logging
- **Advanced Analytics**: Track performance trends and learning progress  
- **Social Features**: Leaderboards, sharing results, team competitions
- **Content Expansion**: More categories (coaching, umpiring, advanced strategy)
- **Adaptive Learning**: ML-powered difficulty adjustment based on performance patterns
- **Audio Features**: Replace placeholder ping sound with realistic bat sounds
