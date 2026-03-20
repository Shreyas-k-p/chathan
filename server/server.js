const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // For development, restrict in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Inject socket.io into request
app.set('socketio', io);

// API Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Scan4Serve Core SaaS API is operational.' });
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`🔌 New WebSocket Connection: ${socket.id}`);

  // Join room by restaurant (Staff)
  socket.on('join_restaurant', (restaurantId) => {
    socket.join(`restaurant_${restaurantId}`);
    console.log(`👤 Socket ${socket.id} joined restaurant_${restaurantId}`);
  });

  // Join room by table (Customer)
  socket.on('join_table', (tableId) => {
    socket.join(`table_${tableId}`);
    console.log(`📦 Socket ${socket.id} joined table_${tableId}`);
  });

  socket.on('disconnect', () => {
    console.log(`👋 Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Scan4Serve SaaS Backend running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
