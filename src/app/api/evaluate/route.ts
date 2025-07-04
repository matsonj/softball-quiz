import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { UserAnswer, LLMEvaluation } from '@/types';
import { GameStateGenerator } from '@/services/gameStateGenerator';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { answers }: { answers: UserAnswer[] } = await request.json();
    
    console.log('Evaluation API called with', answers?.length || 0, 'answers');
    
    if (!answers || answers.length === 0) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    if (!openai) {
      console.error('OpenAI not configured');
      return NextResponse.json({ 
        error: 'OpenAI API is not configured. Please set up your OPENAI_API_KEY environment variable.' 
      }, { status: 500 });
    }

    const evaluations: LLMEvaluation[] = [];

    // Process each answer
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      console.log(`Processing answer ${i + 1}/${answers.length}: ${answer.question_id}`);
      console.log('Answer object:', JSON.stringify(answer, null, 2));
      
      if (!answer.game_state) {
        console.error(`No game_state found for answer ${i + 1}`);
        evaluations.push({
          question_id: answer.question_id,
          is_correct: false,
          feedback: 'Sorry, there was an issue with the game state data. Please try again!'
        });
        continue;
      }
      
      const gameStateText = GameStateGenerator.formatGameStateForPrompt(answer.game_state);
      console.log('Game state text:', gameStateText);
      
      const prompt = `You are a friendly, encouraging softball coach evaluating a player's answer to a game situation question.

ORIGINAL PROMPT TEMPLATE: ${answer.prompt_template}

QUESTION: ${answer.question_text}

${gameStateText}

PLAYER'S ANSWER: "${answer.user_answer}"

Your task is to evaluate this answer with a GENEROUS and ENCOURAGING approach:

EVALUATION GUIDELINES:
- Mark as CORRECT if the answer shows reasonable softball knowledge and understanding
- Give credit for answers that are "close enough" or show the right thinking
- Only mark as INCORRECT if the answer is clearly wrong, dangerous, or shows fundamental misunderstanding
- Consider that there are often multiple valid approaches to softball situations
- Value practical knowledge over perfect textbook answers
- Give benefit of the doubt when the intent is clear, even if wording isn't perfect

EXAMPLES OF ANSWERS TO MARK CORRECT:
- Strategic thinking that makes sense for the situation
- Answers that show awareness of game context (runners, count, inning, etc.)
- Multiple choice between reasonable options ("swing at a good pitch" or "take if it's close")
- Answers that prioritize safety and smart play
- Responses that show understanding of fundamentals even if not detailed

FEEDBACK STYLE:
- Always be encouraging and positive
- If correct: Praise their thinking and explain why it works
- If incorrect: Gently guide them while acknowledging any good points they made
- Use coach language: "Good thinking!", "That's the right idea!", "I like that approach!"

Respond with a JSON object in this exact format:
{
  "is_correct": true/false,
  "feedback": "Your encouraging, coach-like feedback here",
  "suggested_answer": "If incorrect, provide a better approach here"
}

Remember: Be generous with correct answers and always encouraging in your feedback!`;

      try {
        console.log(`Calling OpenAI for answer ${i + 1}`);
        
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful softball coach. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        const result = response.choices[0]?.message?.content;
        console.log(`OpenAI response for answer ${i + 1}:`, result?.substring(0, 100) + '...');
        
        if (result) {
          try {
            const parsed = JSON.parse(result);
            evaluations.push({
              question_id: answer.question_id,
              is_correct: parsed.is_correct,
              feedback: parsed.feedback,
              suggested_answer: parsed.suggested_answer
            });
            console.log(`Successfully processed answer ${i + 1}`);
          } catch (parseError) {
            console.error(`Error parsing OpenAI response for answer ${i + 1}:`, parseError);
            console.error(`Raw response: "${result}"`);
            evaluations.push({
              question_id: answer.question_id,
              is_correct: false,
              feedback: 'Sorry, I had trouble evaluating this answer. Please try again!'
            });
          }
        } else {
          console.error(`No response content from OpenAI for answer ${i + 1}`);
          evaluations.push({
            question_id: answer.question_id,
            is_correct: false,
            feedback: 'Sorry, I had trouble evaluating this answer. Please try again!'
          });
        }
      } catch (openaiError) {
        console.error(`OpenAI API error for answer ${i + 1}:`, openaiError);
        evaluations.push({
          question_id: answer.question_id,
          is_correct: false,
          feedback: 'Sorry, I had trouble evaluating this answer. Please try again!'
        });
      }
    }

    console.log('Evaluation completed. Returning', evaluations.length, 'evaluations');

    return NextResponse.json({ evaluations });
  } catch (error) {
    console.error('Evaluation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
