import admin from "../config/firebase";
import { Request, Response } from "express";

// Define the possible action types
type AuthAction = "sign-up" | "sign-in" | "sign-out";

// Define the request body interface
interface AuthRequest extends Request {
    body: {
        email?: string;
        password?: string;
        action: AuthAction;
        uid?: string;
    }
}

export const handleAuth = async (req: AuthRequest, res: Response) => {
    const { email, password, action, uid } = req.body;

    // Validate action first
    if (!action || !["sign-up", "sign-in", "sign-out"].includes(action)) {
        return res.status(400).json({ error: "Invalid action" });
    }

    try {
        switch (action) {
            case "sign-up": {
                if (!email || !password) {
                    return res.status(400).json({ 
                        error: "Email and password are required for sign-up" 
                    });
                }
                const user = await admin.auth().createUser({
                    email,
                    password,
                });
                return res.status(201).json({
                    message: "User created successfully",
                    uid: user.uid
                });
            }

            case "sign-in": {
                if (!email || !password) {
                    return res.status(400).json({ 
                        error: "Email and password are required for sign-in" 
                    });
                }
                const user = await admin.auth().getUserByEmail(email);
                return res.status(200).json({
                    message: "User signed in successfully",
                    uid: user.uid
                });
            }

            case "sign-out": {
                if (!uid) {
                    return res.status(400).json({ 
                        error: "User ID is required for sign-out" 
                    });
                }
                await admin.auth().revokeRefreshTokens(uid);
                return res.status(200).json({
                    message: "User signed out successfully"
                });
            }
        }
    } catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({
                error: error.message
            });
        }
        return res.status(500).json({
            error: "An unknown error occurred"
        });
    }
};

