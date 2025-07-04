import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { PromptTemplateService } from '@/services/promptTemplateService';
import { GameStateGenerator } from '@/services/gameStateGenerator';
import { Category, GeneratedQuestion } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as Category;
    const userElo = parseInt(searchParams.get('userElo') || '1200');
    const count = parseInt(searchParams.get('count') || '10');
    const excludeTemplates = searchParams.get('excludeTemplates')?.split(',') || [];

    if (!category || !['At Bat', 'Pitching', 'Fielding', 'On Base'].includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ 
        error: 'OpenAI API is not configured. Please set up your OPENAI_API_KEY environment variable.' 
      }, { status: 500 });
    }

    // Load prompt templates
    await PromptTemplateService.loadTemplates();

    // Select templates based on user Elo and category
    console.log(`Selecting templates for category: ${category}, userElo: ${userElo}, count: ${count}`);
    console.log(`Excluded templates: ${excludeTemplates.length}`);
    
    const selectedTemplates = PromptTemplateService.selectTemplatesForQuiz(
      category, 
      userElo, 
      count, 
      excludeTemplates
    );

    console.log(`Selected ${selectedTemplates.length} templates:`, selectedTemplates.map(t => `${t.prompt_template.substring(0, 50)}... (Elo: ${t.elo_target})`));

    if (selectedTemplates.length === 0) {
      return NextResponse.json({ 
        error: 'No suitable prompt templates found for this category and skill level' 
      }, { status: 404 });
    }

    // Generate questions using LLM
    const questions: GeneratedQuestion[] = [];
    
    for (const template of selectedTemplates) {
      try {
        const gameState = GameStateGenerator.generateGameState();
        const gameStateText = GameStateGenerator.formatGameStateForPrompt(gameState);
        
        const prompt = `You are creating a softball quiz question for a player with an Elo rating of ${userElo}.

TEMPLATE INSTRUCTION: ${template.prompt_template}

${gameStateText}

TARGET DIFFICULTY: ${template.elo_target} Elo (where 800 = beginner, 1200 = intermediate, 1600 = expert)

Create a specific, realistic softball question that:
1. Follows the template instruction but adapts it to fit the EXACT game situation provided above
2. Makes logical sense given the inning, score, count, runners, and team context
3. Is appropriate for the target difficulty level
4. Presents a realistic scenario that could actually occur in this game state
5. Requires softball knowledge and strategy relevant to this specific situation

IMPORTANT FORMATTING:
- The game state details (inning, count, score, runners) are shown separately in the UI
- DO NOT repeat these details in your question text
- Focus on the decision or strategy needed, not restating the situation
- The question should flow naturally assuming the player can see the game state

GOOD EXAMPLE: "What's your approach at the plate?" (instead of "With a 2-1 count and runners on base, what's your approach?")
BAD EXAMPLE: "It's the bottom of the 7th, count is 3-2, with runners on 2nd and 3rd - what do you do?"

Respond with ONLY the question text, no extra formatting or labels.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an expert softball coach creating quiz questions. Always respond with just the question text, nothing else.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 300,
        });

        const questionText = response.choices[0]?.message?.content?.trim();
        
        if (questionText) {
          questions.push({
            question_id: uuidv4(),
            category: template.category,
            elo_target: template.elo_target,
            prompt_template: template.prompt_template,
            question_text: questionText,
            game_state: gameState,
            generated_at: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Error generating question:', error);
        // Continue with other templates even if one fails
      }
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
