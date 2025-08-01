import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth';
import passwordRoutes from './routes/passwords';
import activityRoutes from './routes/activity';
import { errorHandler } from './middleware/errorHandler';
import { corsMiddleware } from './middleware/cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
console.log('Environment FRONTEND_URL:', process.env.FRONTEND_URL);

// Parse JSON bodies
app.use(express.json());

// Use CORS middleware (must be before routes)
app.use(corsMiddleware);

// Connect to MongoDB
import connectDB from './config/database';
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);
app.use('/api/activity', activityRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TriVault API is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
