import 'dotenv/config';
import { loadKeyVaultSecrets } from './config/keyVault.js';
import { initializeMonitor } from './config/monitor.js';

// Resolve secrets and telemetry metrics synchronously on startup
await loadKeyVaultSecrets();
initializeMonitor();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/error.js';

// Route imports
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';
import mealPlanRoutes from './routes/mealPlans.js';
import trackingRoutes from './routes/tracking.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection (Dual SQL Server / SQLite)
await connectDB();

// Request logging in development
app.use(morgan('dev'));

// Enable Helmet security headers
app.use(helmet({
  contentSecurityPolicy: false // disable CSP locally to allow loading external images easily
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Configure API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', apiLimiter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static directory for file/image uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/meal-plans', mealPlanRoutes);
app.use('/api/tracker', trackingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Configure Swagger API Documentation Specs
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NutraWell Health & Nutrition API',
      version: '1.0.0',
      description: 'API Documentation for NutraWell Wellness Platform, integrating local SQL databases and Spoonacular services.',
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development Server',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
}

// API Root path response
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'NutraWell REST API is live and healthy.'
  });
});

// Serve frontend SPA index.html for any non-API routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });
}

// Catch-all unhandled API routes (404)
app.use('/api/*', (req, res, next) => {
  const error = new Error(`Endpoint Not Found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global central error handler
app.use(errorHandler);

// Start server listening
app.listen(PORT, () => {
  console.log(`[Server] NutraWell API Server running on port ${PORT}`);
});
