const HISTORY_KEY = 'ag_chat_history';
const STATS_KEY = 'ag_stats';
const THEME_KEY = 'ag_theme';

export function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } 
    catch { return []; }
}

export function saveMessage(msg) {
    const history = getHistory();
    history.push(msg);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    localStorage.setItem(STATS_KEY, JSON.stringify({ messages: 0, resolved: 0, totalTime: 0 }));
}

export function getStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY)) || { messages: 0, resolved: 0, totalTime: 0 }; } 
    catch { return { messages: 0, resolved: 0, totalTime: 0 }; }
}

export function updateStats(responseTime) {
    const stats = getStats();
    stats.messages += 1;
    stats.totalTime += responseTime;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function updateResolvedCount() {
    const stats = getStats();
    stats.resolved += 1;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
}

export function setTheme(themeName) {
    localStorage.setItem(THEME_KEY, themeName);
}
