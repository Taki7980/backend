
import { NextFunction, Request, Response } from "express";
import { handleChat } from "../services/gemini";
import { rateLimiter } from "../services/rateLimiter";
import { handleError } from "../utils/errorHandler";

// Define the chat request interface
export interface ChatRequest extends Request {
    body: {
        message: string;
        userId?: string;
    };
}

// Fixed middleware type signature
export const validateChatRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
        return res.status(400).json({
            error: "Bad Request",
            message: "Message is required and must be a string",
        });
    }
    next();
};

// Fixed request handler
export const handleChatRequest = async (
    req: Request,
    res: Response
) => {
    try {
        const userId = req.body.userId || req.ip || "default";
        const response = await handleChat(req.body.message, userId);

        setRateLimitHeaders(res, userId);

        return res.json({
            response,
            rateLimit: getRateLimitInfo(userId),
        });
    } catch (error) {
        const errorResponse = handleError(error);
        const userId = req.body.userId || req.ip || "default";
        
        setRateLimitHeaders(res, userId);

        return res.status(errorResponse.statusCode).json({
            ...errorResponse,
            rateLimit: getRateLimitInfo(userId),
        });
    }
};

const setRateLimitHeaders = (res: Response, userId: string) => {
    res.setHeader(
        "X-RateLimit-Remaining",
        rateLimiter.getRemainingRequests(userId)
    );
    res.setHeader(
        "X-RateLimit-Reset",
        rateLimiter.getResetTime(userId)
    );
};

const getRateLimitInfo = (userId: string) => ({
    remaining: rateLimiter.getRemainingRequests(userId),
    resetIn: Math.ceil(rateLimiter.getResetTime(userId) / 1000),
});