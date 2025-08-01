import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const allowedOrigins = [
  'https://new-chi-ashen.vercel.app',
  'https://pwd-zeta.vercel.app',
  'http://localhost:8080',
  'http://localhost:5173' // Vite dev server
];

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, origin?: boolean | string) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization']
};

export const corsMiddleware = cors(corsOptions);
