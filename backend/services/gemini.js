import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
    const maskedKey = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
    console.log(`[Gemini Service] Initialized. Key: ${maskedKey}`);
} else {
    console.error('[Gemini Service] CRITICAL WARNING: GEMINI_API_KEY is missing.');
}

const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export const generateGeminiResponse = async (message, topic, history = []) => {
    const systemPrompt = `You are AntiGravity, a senior DevOps engineer AI assistant.
Topic focus: ${topic}. Respond with a clear answer, working code examples in fenced blocks with language tags, and bullet-point warnings if relevant.
Keep responses under 600 words. Use markdown. Never mention you are an AI.`;

    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
        config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
            maxOutputTokens: 1024,
        }
    });

    return {
        text: response.text,
        model: 'gemini-2.5-pro',
        tokens: response.usageMetadata?.candidatesTokenCount || 0
    };
};
