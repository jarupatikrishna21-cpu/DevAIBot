import express from "express";
import { generateGroqResponse } from "../services/groq.js";

const router = express.Router();

router.post("/chat", async (req, res) => {
    try {
        const { message, topic, history } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const aiResponse = await generateGroqResponse(message, topic || "General DevOps", history || []);

        res.json({ reply: aiResponse.text });

    } catch (err) {
        const is429 = err.message?.includes("429");
        
        // Let the user keep testing the frontend UI gracefully instead of breaking it!
        if (is429) {
            return res.json({ 
                reply: `🤖 **(Mock Mode Active)**\n\nI received your message: *"${req.body.message}"*\n\nHowever, the Groq API returned a **Quota Exceeded** error for your API Key. Until you fix your Groq limits, you will see this mock response!` 
            });
        }

        res.status(500).json({
            error: err.message || "Internal Server Error"
        });
    }
});

export default router;