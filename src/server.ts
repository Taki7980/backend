// src/app.ts
import express, { Request, Response } from "express";
import { config } from "./config/config";
import { handleAuth } from "./api/auth";
import {
	handleChatRequest,
	validateChatRequest,
	ChatRequest,
} from "./services/chat";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
	res.json({ status: "Server is running" });
});

app.post("/chat", async (req, res) => {
	try {
		const response = await handleChatRequest(req, res);
		res.json(response);
	} catch (error) {
		res.status(500).json({ error: "Internal Server Error" });
	}
});

app.post("/auth",  (req: Request, res: Response) => {
	handleAuth(req, res);
});

const server = app.listen(config.port, () => {
	console.log(`Server is running on port ${config.port}`);
});

export default app;
