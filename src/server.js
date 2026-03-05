import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import cartRoutes from './routes/cart.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Routes
app.use('/api/cart', cartRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Cart Service', timestamp: new Date() });
});


import mongoose from 'mongoose';

app.get('/ready', (req, res) => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (state === 1) {
    res.json({ status: 'READY', service: 'Cart Service', timestamp: new Date() });
  } else {
    res.status(503).json({ status: 'NOT_READY', service: 'Cart Service', timestamp: new Date() });
  }
});


// Error handling middleware
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!', 
    error: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Cart Service running on port ${PORT}`);
});