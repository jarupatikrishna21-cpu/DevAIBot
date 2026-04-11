export const validateChatInput = (req, res, next) => {
    const { message, topic, history } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required and must be non-empty.' });
    }

    if (message.length > 2000) {
        return res.status(400).json({ error: 'Message exceeds 2000 character limit.' });
    }

    if (!topic || typeof topic !== 'string') {
        return res.status(400).json({ error: 'Topic is required.' });
    }

    if (history && !Array.isArray(history)) {
        return res.status(400).json({ error: 'History must be an array of messages.' });
    }

    // Limit history to last 10 items purely for safety processing check
    if (history && history.length > 10) {
        req.body.history = history.slice(-10);
    }

    next();
};
