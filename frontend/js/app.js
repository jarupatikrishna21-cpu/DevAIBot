import { sendChat } from './api.js';
import { renderMessage, renderTypingIndicator, removeTypingIndicator, renderErrorMsg } from './renderer.js';
import { getHistory, saveMessage, getStats, updateStats, clearHistory, getTheme, setTheme } from './storage.js';

// DOM Elements
const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const suggestionsBar = document.getElementById('suggestions-bar');
const messagesArea = document.getElementById('messages-area');
const welcomeScreen = document.getElementById('welcome-screen');
const charCount = document.getElementById('char-count');
const sendIcon = document.querySelector('.send-icon');
const spinner = document.querySelector('.spinner');
const topicBtns = document.querySelectorAll('.topic-btn');
const currentTopicTitle = document.getElementById('current-topic-title');

// State
let currentTopic = 'General';
let isWaiting = false;

const TOPIC_SUGGESTIONS = {
    'General': ['How do I debug a sluggish node backend?', 'Explain Git rebase vs merge.', 'Best practices for API versioning?', 'How to structure a monorepo?'],
    'Deployment': ['How do I set up a blue-green deployment?', 'Nginx reverse proxy config example', 'Rolling updates in AWS ECS', 'Zero downtime deployment strategies'],
    'Docker/K8s': ['Create a multi-stage Dockerfile for React', 'Explain Kubernetes Pod lifecycle', 'How to write a Helm chart?', 'Docker compose for Node + Postgres + Redis'],
    'CI/CD': ['Basic GitHub Actions node test pipeline', 'GitLab CI caching dependencies', 'How to trigger Jenkins on PR?', 'Automating semantic versioning'],
    'Monitoring': ['Prometheus vs Datadog comparison', 'How to set up ELK stack?', 'Grafana dashboard JSON example', 'Application APM instrumentation best practices'],
    'Terraform/IaC': ['Terraform script for AWS EC2 instance', 'How to handle Terraform state locks?', 'AWS VPC setup with Terraform', 'Ansible vs Terraform'],
    'Security': ['Best practices for AWS S3 security', 'Implementing OAuth2 in Express', 'How to scan Docker images for vulnerabilities?', 'Content Security Policy examples']
};

function init() {
    setupTheme();
    setupListeners();
    updateSuggestions(currentTopic);
    updateStatsDisplay();
    loadHistory();
}

function setupTheme() {
    const saved = getTheme();
    document.body.className = saved ? `theme-${saved}` : 'theme-dark';
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const isDark = document.body.classList.contains('theme-dark');
        const newTheme = isDark ? 'light' : 'dark';
        document.body.className = `theme-${newTheme}`;
        setTheme(newTheme);
    });
}

function setupListeners() {
    // Input resizing & limits
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
        charCount.textContent = `${input.value.length} / 2000`;
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else if (e.key === 'Escape') {
            input.value = '';
            input.dispatchEvent(new Event('input'));
        }
    });

    sendBtn.addEventListener('click', handleSend);

    // Sidebar topics
    topicBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            topicBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentTopic = e.target.dataset.topic;
            currentTopicTitle.textContent = `${currentTopic} Discussion`;
            updateSuggestions(currentTopic);
            if (window.innerWidth <= 700) document.getElementById('close-sidebar').click();
        });
    });

    // Welcome cards
    // ✅ FIX — fills input only, user decides when to send
    document.querySelectorAll('.welcome-card').forEach(card => {
        card.addEventListener('click', () => {
            input.value = card.dataset.fill;
            input.focus();
            charCount.textContent = `${input.value.length} / 2000`;
        });
    });
    // Clear and Export
    document.getElementById('clear-chat').addEventListener('click', () => {
        clearHistory();
        messagesArea.innerHTML = '';
        welcomeScreen.classList.remove('hidden');
        updateStatsDisplay();
    });

    document.getElementById('export-chat').addEventListener('click', () => {
        const history = getHistory();
        const text = history.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `antigravity-session-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
    });

    // Mobile menu
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    document.getElementById('open-sidebar').addEventListener('click', () => {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    });
    document.getElementById('close-sidebar').addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    });
    overlay.addEventListener('click', () => document.getElementById('close-sidebar').click());
}

function updateSuggestions(topic) {
    suggestionsBar.innerHTML = '';
    TOPIC_SUGGESTIONS[topic].forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = text;
        // ✅ FIX
        btn.addEventListener('click', () => {
            input.value = text;
            input.focus();
            charCount.textContent = `${text.length} / 2000`;
        });
        suggestionsBar.appendChild(btn);
    });
}

function updateStatsDisplay() {
    const stats = getStats();
    document.getElementById('stat-msgs').textContent = stats.messages;
    document.getElementById('stat-resolved').textContent = stats.resolved;
    const avg = stats.messages > 0 ? Math.round(stats.totalTime / stats.messages) : 0;
    document.getElementById('stat-time').textContent = `${avg}ms`;
}

function loadHistory() {
    const history = getHistory();
    if (history.length > 0) welcomeScreen.classList.add('hidden');
    history.forEach(msg => messagesArea.appendChild(renderMessage(msg.role, msg.content)));
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

async function handleSend() {
    const text = input.value.trim();
    if (!text || isWaiting) return;

    // UI Updates
    welcomeScreen.classList.add('hidden');
    input.value = '';
    input.style.height = 'auto';
    charCount.textContent = '0 / 2000';
    setLoading(true);

    // Save and Render User Message
    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    saveMessage(userMsg);
    messagesArea.appendChild(renderMessage('user', text));
    messagesArea.appendChild(renderTypingIndicator());
    scrollToBottom();

    const startTime = Date.now();
    try {
        const historyForApi = getHistory().slice(0, -1); // Exclude the message just added
        const response = await sendChat(text, currentTopic, historyForApi);

        removeTypingIndicator();

        const botMsg = { role: 'bot', content: response.reply, timestamp: new Date().toISOString() };
        saveMessage(botMsg);

        const elapsed = Date.now() - startTime;
        updateStats(elapsed);
        updateStatsDisplay();

        messagesArea.appendChild(renderMessage('bot', response.reply, response.tokens));
    } catch (error) {
        removeTypingIndicator();
        messagesArea.appendChild(renderErrorMsg(error.message, handleSend, text));
    } finally {
        setLoading(false);
        scrollToBottom();
    }
}

function setLoading(isLoading) {
    isWaiting = isLoading;
    input.disabled = isLoading;
    sendBtn.disabled = isLoading;
    if (isLoading) {
        sendIcon.classList.add('hidden');
        spinner.classList.remove('hidden');
    } else {
        sendIcon.classList.remove('hidden');
        spinner.classList.add('hidden');
        input.focus();
    }
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
    });
}


init();
