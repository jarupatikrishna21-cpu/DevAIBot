import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.ANTHROPIC_API_KEY;

if (apiKey) {
    const maskedKey = `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
    console.log(`[Anthropic Service] Initialized. Key: ${maskedKey}`);
} else {
    console.error('[Anthropic Service] CRITICAL WARNING: ANTHROPIC_API_KEY is missing.');
}

export const generateAnthropicResponse = async (message, topic, history = []) => {
    const systemPrompt = `You are AntiGravity, a senior DevOps engineer AI assistant.
Topic focus: ${topic}. Respond with a clear answer, working code examples in fenced blocks with language tags, and bullet-point warnings if relevant.
Keep responses under 600 words. Use markdown. Never mention you are an AI.`;

    // Anthropic uses 'user' and 'assistant' roles
    const messages = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content || msg.parts?.[0]?.text || ""
    }));
    
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1024,
            system: systemPrompt,
            messages: messages,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
        text: data.content[0].text,
        model: 'claude-3-haiku-20240307',
        tokens: data.usage?.output_tokens || 0
    };
};
