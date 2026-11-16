const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const sequelize = require('./config/database');
const Notification = require('./models/Notification');
const { startConsumer } = require('./worker/notificationConsumer');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return process.env.JWT_SECRET;
};

const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || 'http://localhost:5173').split(','),
].map((origin) => origin && origin.trim()).filter(Boolean);

const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true);
  if (allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
};

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

const PORT = process.env.PORT || 3005;

app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));

// --- Socket.io Logic ---

// Middleware: Authenticate Socket Connection
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("Authentication error"));
  }
  try {
    // Verify using the same secret as Auth Service (should be in env)
    const decoded = jwt.verify(token, getJwtSecret());
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.userId}`);
  
  // Join a room specific to the user
  socket.join(`user_${socket.userId}`);

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.userId}`);
  });
});

// --- API Routes ---

app.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await Notification.findAll({
      where: { recipientId: userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/health', (req, res) => res.send('Notification Service is OK'));

// --- Start ---

const start = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('📦 Notification DB connected');
    
    // Start RabbitMQ Consumer (Pass IO instance)
    startConsumer(io);

    // Listen on the HTTP server, NOT just app.listen
    server.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

start();
