const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const commentController = require('./controllers/CommentController');

const app = express();
const PORT = process.env.PORT || 3003;
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
].map((origin) => origin && origin.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
  },
  credentials: true,
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// Routes
const router = express.Router();
router.post('/', commentController.create);
router.get('/:postId', commentController.getByPostId);
app.use('/', router);

// Health Check
app.get('/health', (req, res) => res.send('Comment Service is OK'));

const start = async () => {
  try {
    await sequelize.sync();
    console.log('📦 Comment DB connected');
    app.listen(PORT, () => console.log(`🚀 Comment Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

start();
