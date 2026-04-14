import express from 'express';
import { generateGeminiResponse } from '../services/gemini.js';
import { chatRateLimiter } from '../middleware/rateLimiter.js';
import { validateChatInput } from '../middleware/validator.js';

const router = express.Router();

router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

router.post('/chat', chatRateLimiter, validateChatInput, async (req, res, next) => {
    try {
        const { message, topic, history } = req.body;
        const geminiResponse = await generateGeminiResponse(message, topic, history);

        res.json({
            reply: geminiResponse.text,
            model: geminiResponse.model,
            tokens: geminiResponse.tokens
        });
    } catch (error) {
        if (error.status === 429) {
            return res.status(429).json({ error: 'Rate limit exceeded from Google API.' });
        }
        next(error);
    }
});
try {
    const response = await chat(message, topic, history);
    res.json(response);
} catch (err) {
    const is429 = err.message.includes('Rate limit');
    res.status(is429 ? 429 : 500).json({ error: err.message });
}

export default router;
