import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['GEMINI_API_KEY', 'PORT'] as const;

// Validate environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is not set`);
  }
}

export const config = {
  geminiKey: process.env.GEMINI_API_KEY!,
  port: parseInt(process.env.PORT!, 10) || 5000,
} as const; 