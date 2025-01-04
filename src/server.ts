import express, { Request, Response, NextFunction } from 'express';
import { config } from 'dotenv';
import { handleChat } from './services/openai';
// import { auth } from './config/firebase';
// import { signInWithEmailAndPassword } from "firebase/auth";

config();


if (!process.env.PORT) {
  console.warn('Warning: PORT not set in environment variables. Using default port 5000');
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY not found in environment variables');
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());


app.get('/', (req,res) => {
  res.json({ status: 'Server is running' });
});

// chat end point
app.post("/chat", (req:any,res:any) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required in request body' 
      });
    }

    const response = handleChat(message);
    return res.json({ response });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});


app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled error:', err);
  return res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// app.post("/api/login" ,(req,res)=>{
//   const {email, password} = req.body;
//   signInWithEmailAndPassword(auth, email, password)
// })

export default app;