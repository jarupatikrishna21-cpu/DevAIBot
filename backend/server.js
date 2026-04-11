import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

// Restrict CORS to GitHub Pages (or fallback to '*' during local dev if unset)
const allowedOrigins = process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : '*';
app.use(cors({
    origin: allowedOrigins,
    optionsSuccessStatus: 200
}));

app.use(express.json());

// Routes
app.use('/api', chatRoutes);

// Generic Error Handler wrapper to prevent leaking stack traces
app.use((err, req, res, next) => {
    console.error(`[Server Error]: ${err.message}`);
    res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

app.listen(PORT, () => {
    console.log(`AntiGravity backend listening on port ${PORT}`);
});
