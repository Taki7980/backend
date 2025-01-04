import { OpenAI } from 'openai';
import dotenv from 'dotenv';


dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: apiKey
});

export async function handleChat(message: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: message }
      ],
    });

    return completion.choices[0].message.content || 'No response generated';
    
  } catch (error) {
    console.error('Error in OpenAI chat:', error);
    throw error;
  }
}