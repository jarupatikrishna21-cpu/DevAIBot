import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (apiKey) {
    const maskedKey = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
    console.log(`[Groq Service] Initialized. Key: ${maskedKey}`);
} else {
    console.error('[Groq Service] CRITICAL WARNING: GROQ_API_KEY is missing.');
}

export const generateGroqResponse = async (message, topic, history = []) => {
    const systemPrompt = `You are AntiGravity, a senior DevOps engineer AI assistant.
Topic focus: ${topic}. Respond with a clear answer, working code examples in fenced blocks with language tags, and bullet-point warnings if relevant.
Keep responses under 600 words. Use markdown. Never mention you are an AI.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content || msg.parts?.[0]?.text || ""
        })),
        { role: 'user', content: message }
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
        text: data.choices[0].message.content,
        model: data.model,
        tokens: data.usage?.completion_tokens || 0
    };
};
