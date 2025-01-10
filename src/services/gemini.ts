import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config';
import { APIError } from '../utils/errorHandler';
import { rateLimiter } from '../services/rateLimiter';

const genAI = new GoogleGenerativeAI(config.geminiKey);
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    maxOutputTokens: 1000,
    temperature: 0.7,
  }
});

function checkRateLimit(userId: string = 'default') {
  if (!rateLimiter.checkLimit(userId)) {
    const resetTime = Math.ceil(rateLimiter.getResetTime(userId) / 1000);
    throw new APIError(
      429,
      `Rate limit exceeded. Please try again in ${resetTime} seconds. ` +
      `Remaining requests: ${rateLimiter.getRemainingRequests(userId)}`
    );
  }
}

export async function handleChat(message: string, userId: string = 'default'): Promise<string> {
  try {
    checkRateLimit(userId);

    const result = await model.generateContent(message);
    
    if (!result.response) {
      throw new APIError(500, 'No response generated from AI');
    }

    const text = result.response.text();
    if (!text) {
      throw new APIError(500, 'Empty response from AI');
    }

    return text;
    
  } catch (error: any) {
    if (error instanceof APIError) {
      throw error;
    }

    // Handle Gemini specific errors
    if (error?.status === 429) {
      throw new APIError(429, 'Service is busy. Please try again in a few moments.');
    }

    if (error?.status === 403) {
      throw new APIError(403, 'API key invalid or quota exceeded');
    }

    // Handle safety errors
    if (error.message?.includes('safety')) {
      throw new APIError(400, 'Content filtered for safety reasons');
    }

    console.error('Gemini API error:', error);
    throw new APIError(500, 'Failed to process your request');
  }
} 