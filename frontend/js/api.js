export const API_BASE = 'https://devaibotbackendkrishna.loca.lt'; // Tunneled to localhost

export async function sendChat(message, topic, history) {
    const payload = {
        message,
        topic,
        history: history.map(h => ({ role: h.role, content: h.content }))
    };

    const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to communicate with the server.');
    }

    return data;
}
