# AntiGravity: DevOps AI Support Chatbot

A production-ready full-stack AI chatbot specialized in DevOps workflows, utilizing Anthropic's `claude-sonnet-4-20250514`. 
Built with a vanilla HTML/CSS/JS frontend and an Express Node.js backend.

## Architecture
- **Frontend**: Pure HTML5, CSS3, ES2022 Javascript. Custom dark/light mode, fully responsive, modular architecture.
- **Backend**: Node.js v20+, Express 4, Rate limited, Helmet secured, integrating with the latest Anthropic SDK.

## Local Development Setup

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create the `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```
4. Edit the `.env` file and insert your `ANTHROPIC_API_KEY`. Set `CORS_ORIGIN=*` for local frontend development.
5. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *The server runs on `http://localhost:3000` by default.*

### 2. Frontend Setup
1. Because the frontend relies entirely on vanilla modern web technologies and ES modules, you must serve it via a local HTTP server (don't just double-click the `index.html` file).
2. Using Python:
   ```bash
   cd frontend
   python3 -m http.server 8080
   ```
   Or using node's `serve`:
   ```bash
   npx serve frontend -p 8080
   ```
3. To point the local frontend at the local backend, open `frontend/js/api.js` and edit `API_BASE` to `http://localhost:3000`.

## Deployment Instructions

### Deploying the Backend to Render
1. Create a New Web Service on Render, connected to your GitHub repository.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. In Environment Variables, add your `ANTHROPIC_API_KEY`.
6. Set `CORS_ORIGIN` to your exact GitHub Pages URL (e.g., `https://username.github.io`).
7. Once deployed, take the Render URL and update `API_BASE` in `frontend/js/api.js`.

### Deploying the Frontend to GitHub Pages
1. Ensure the `frontend/js/api.js` is pushing the correct Render URL.
2. Commit your code to the `main` branch.
3. The `.github/workflows/deploy.yml` will automatically build and distribute the code from the `frontend/` folder to GitHub Pages.
