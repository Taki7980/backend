import express, { Request, Response, NextFunction } from 'express';
import { handleChat } from './services/gemini';
import { config } from './config/config';
import { handleError } from './utils/errorHandler';
import { rateLimiter } from './services/rateLimiter';

const app = express();

interface ChatRequest extends Request {
  body: {
    message: string;
    userId?: string;
  }
}

app.use(express.json());

const validateChatRequest = (req: ChatRequest, res: Response, next: NextFunction) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ 
      error: 'Bad Request',
      message: 'Message is required and must be a string'
    });
  }
  next();
};

app.get('/', (_req, res) => {
  res.json({ status: 'Server is running' });
});
// @ts-ignore
app.post("/chat", validateChatRequest, async (req: ChatRequest, res: Response) => {
  try {
    const userId = req.body.userId || req.ip || 'default';
    const response = await handleChat(req.body.message, userId);
    
    res.setHeader('X-RateLimit-Remaining', rateLimiter.getRemainingRequests(userId));
    res.setHeader('X-RateLimit-Reset', rateLimiter.getResetTime(userId));
    
    return res.json({ 
      response,
      rateLimit: {
        remaining: rateLimiter.getRemainingRequests(userId),
        resetIn: Math.ceil(rateLimiter.getResetTime(userId) / 1000)
      }
    });
  } catch (error) {
    const errorResponse = handleError(error);
    
    const userId = req.body.userId || req.ip || 'default';
    res.setHeader('X-RateLimit-Remaining', rateLimiter.getRemainingRequests(userId));
    res.setHeader('X-RateLimit-Reset', rateLimiter.getResetTime(userId));
    
    return res.status(errorResponse.statusCode).json({
      ...errorResponse,
      rateLimit: {
        remaining: rateLimiter.getRemainingRequests(userId),
        resetIn: Math.ceil(rateLimiter.getResetTime(userId) / 1000)
      }
    });
  }
});

const server = app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});

export default app;