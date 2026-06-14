import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import customerRouter from './routes/customers.js';
import campaignRouter from './routes/campaigns.js';
import receiptsRouter from './routes/receipts.js';
import aiRouter from './routes/ai.js';
import analyticsRouter from './routes/analytics.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[Backend API] ${req.method} ${req.url}`);
  next();
});

// Register API Routes
app.use('/api/customers', customerRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'xenopilot-backend-api' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error Handler]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`[XenoPilot Backend API] Running on http://localhost:${PORT}`);
});
