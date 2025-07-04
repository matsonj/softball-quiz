import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { PromptTemplateService } from '@/services/promptTemplateService';
import { GameStateGenerator } from '@/services/gameStateGenerator';
import { Category, GeneratedQuestion } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import categoryInstructions from '@/data/categoryInstructions.json';

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

    // Generate questions using LLM in parallel
    // Create array of promises for parallel execution
    const questionPromises = selectedTemplates.map(async (template) => {
      try {
        const gameState = GameStateGenerator.generateGameState();
        const gameStateText = GameStateGenerator.formatGameStateForPrompt(gameState);
        
        // Get category-specific instructions
        const categoryInfo = categoryInstructions[template.category as keyof typeof categoryInstructions];
        const categorySpecificInstructions = categoryInfo.instructions.map(instruction => `- ${instruction}`).join('\n');

        const prompt = `You are creating a multiple-choice softball quiz question for a player with an Elo rating of ${userElo}.

TEMPLATE INSTRUCTION: ${template.prompt_template}

GAME STATE: ${gameStateText}

TARGET DIFFICULTY: ${template.elo_target} Elo (where 800 = beginner, 1200 = intermediate, 1600 = expert)

CATEGORY-SPECIFIC REQUIREMENTS FOR ${template.category.toUpperCase()}:
${categorySpecificInstructions}

Create a specific, realistic softball question with 4 multiple choice options that:
0. These questions should understandable to smart 10 year old girls
1. Follows the template instruction but adapts it to fit the EXACT game situation provided above
2. STRICTLY adheres to the category-specific requirements listed above
3. Makes logical sense given the inning, score, count, runners, and team context  
4. Is appropriate for the target difficulty level
5. Presents a realistic scenario that could actually occur in this game state
6. Requires softball knowledge and strategy relevant to this specific situation

MULTIPLE CHOICE REQUIREMENTS:
- Provide exactly 4 options
- One option should be clearly correct
- Two options should be subtly wrong but plausible
- One option should be humorous and obviously wrong, be extra funny
- Include brief reasoning for why each option is correct/incorrect
- Each answer should check against game state to see if the suggestion is possible
- Never include impossible answers given the game state

IMPORTANT FORMATTING:
- The game state details (inning, count, score, runners) are shown separately in the UI
- NEVER repeat the game state details in your question text, instead say "Given the Situation..." or similar
- Focus on the decision or strategy needed, not restating the situation
- The question should flow naturally assuming the player can see the game state

RESPONSE FORMAT (JSON):
{
  "question": "Your question text here",
  "options": [
    {
      "text": "First answer option text",
      "is_correct": true,
      "explanation": "Why this is correct"
    },
    {
      "text": "Second answer option text",
      "is_correct": false,
      "explanation": "Why this is incorrect"
    },
    {
      "text": "Third answer option text", 
      "is_correct": false,
      "explanation": "Why this is incorrect"
    },
    {
      "text": "Fourth answer option text (humorous)",
      "is_correct": false,
      "explanation": "Why this is obviously wrong"
    }
  ]
}

Respond with ONLY the JSON, no extra text.`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert softball coach creating multiple-choice quiz questions. Always respond with valid JSON only, exactly as requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 800,
        });

        const responseText = response.choices[0]?.message?.content?.trim();
        
        if (responseText) {
          try {
            // Clean up markdown formatting if present
            let cleanedResponse = responseText.trim();
            if (cleanedResponse.startsWith('```json')) {
              cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (cleanedResponse.startsWith('```')) {
              cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }
            
            const parsedResponse = JSON.parse(cleanedResponse);
            
            if (parsedResponse.question && parsedResponse.options && parsedResponse.options.length === 4) {
              // Shuffle the options to randomize the order
              const shuffledOptions = [...parsedResponse.options].sort(() => Math.random() - 0.5);
              
              // Assign A, B, C, D labels to the shuffled options
              const optionLabels = ['A', 'B', 'C', 'D'];
              const finalOptions = shuffledOptions.map((option: { text: string; is_correct: boolean; explanation: string }, index: number) => ({
                option_id: optionLabels[index],
                text: option.text,
                is_correct: option.is_correct,
                explanation: option.explanation
              }));

              return {
                question_id: uuidv4(),
                category: template.category,
                elo_target: template.elo_target,
                prompt_template: template.prompt_template,
                question_text: parsedResponse.question,
                game_state: gameState,
                generated_at: new Date().toISOString(),
                options: finalOptions
              };
            } else {
              console.error('Invalid question format:', parsedResponse);
              return null;
            }
          } catch (parseError) {
            console.error('Error parsing question JSON:', parseError);
            console.error('Response text:', responseText);
            
            // Try to get a corrected version from the LLM
            try {
              const fixPrompt = `The following JSON response is malformed. Please fix it and return ONLY valid JSON, no markdown formatting:

${responseText}

Return only the corrected JSON object.`;

              const fixResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: 'You are a JSON formatter. Return only valid JSON, no markdown formatting, no additional text.'
                  },
                  {
                    role: 'user',
                    content: fixPrompt
                  }
                ],
                temperature: 0.1,
                max_tokens: 800,
              });

              const fixedResponse = fixResponse.choices[0]?.message?.content?.trim();
              if (fixedResponse) {
                const parsedFixedResponse = JSON.parse(fixedResponse);
                if (parsedFixedResponse.question && parsedFixedResponse.options && parsedFixedResponse.options.length === 4) {
                  // Shuffle the options to randomize the order
                  const shuffledOptions = [...parsedFixedResponse.options].sort(() => Math.random() - 0.5);
                  
                  // Assign A, B, C, D labels to the shuffled options
                  const optionLabels = ['A', 'B', 'C', 'D'];
                  const finalOptions = shuffledOptions.map((option: { text: string; is_correct: boolean; explanation: string }, index: number) => ({
                    option_id: optionLabels[index],
                    text: option.text,
                    is_correct: option.is_correct,
                    explanation: option.explanation
                  }));

                  console.log('Successfully fixed and parsed JSON');
                  return {
                    question_id: uuidv4(),
                    category: template.category,
                    elo_target: template.elo_target,
                    prompt_template: template.prompt_template,
                    question_text: parsedFixedResponse.question,
                    game_state: gameState,
                    generated_at: new Date().toISOString(),
                    options: finalOptions
                  };
                }
              }
            } catch (fixError) {
              console.error('Error fixing JSON:', fixError);
            }
          }
        } else {
          console.error('No response text from OpenAI');
          return null;
        }
      } catch (error) {
        console.error('Error generating question:', error);
        // Return null for failed questions
        return null;
      }
    });

    // Wait for all questions to be generated in parallel
    const questionResults = await Promise.all(questionPromises);
    
    // Filter out any null results from failed generations
    const validQuestions = questionResults.filter(q => q !== null) as GeneratedQuestion[];

    return NextResponse.json({ questions: validQuestions });
  } catch (error) {
    console.error('Questions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
