/**
 * server.ts — Aethergym Suite Express Server Entry Point
 *
 * Initializes and starts the Express API server with:
 *   - CORS (scoped to frontend origin)
 *   - JSON body parsing
 *   - Modular route mounting
 *   - Global error handling
 *
 * Run in development: npm run dev
 * Run in production:  npm run build && npm start
 */
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// ── Route imports ─────────────────────────────────────────────────────────────
import foodRoutes    from './routes/food.routes.js';
import dietRoutes    from './routes/diet.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import adminRoutes   from './routes/admin.routes.js';
import userRoutes    from './routes/user.routes.js';

// ── App initialization ────────────────────────────────────────────────────────
const app = express();

// Request logging middleware to debug routing and 404 issues in production
app.use((req, res, next) => {
  console.log(`[Incoming Request] ${req.method} ${req.originalUrl || req.url}`);
  next();
});

// ─── Middlewares ──────────────────────────────────────────────────────────────

/**
 * CORS Configuration
 * Allows requests only from the configured frontend URL.
 * The payment webhook is exempt (Midtrans calls from their servers).
 */
app.use(cors({
  // In development: allow all origins (browser + Postman + ngrok).
  // In production: restrict to the configured FRONTEND_URL only.
  origin: env.MIDTRANS_IS_PRODUCTION
    ? [env.FRONTEND_URL]
    : true,   // `true` mirrors the request origin — allows all in dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

/**
 * Body Parsers
 * express.json() for standard JSON requests.
 * NOTE: multer handles multipart/form-data in food routes — do NOT add
 * express.urlencoded for the food scan endpoint, multer handles that.
 */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Root Route — API Index ───────────────────────────────────────────────────
// Visiting http://localhost:3001/ in a browser now shows a helpful index
// instead of the 404 "NotFound" message.
app.get('/', (_req, res) => {
  res.json({
    service: '🏋️ Aethergym Suite API',
    version: '1.0.0',
    status: 'running',
    environment: env.MIDTRANS_IS_PRODUCTION ? 'production' : 'development',
    endpoints: {
      health:   'GET  /health',
      foodScan: 'POST /api/food/scan          (multipart, Auth required)',
      foodLogs: 'GET  /api/food/logs          (Auth required)',
      analytics:'GET  /api/diet/analytics     (Auth required, ?period=daily|weekly|monthly)',
      masterFoods:'GET /api/diet/master-foods (Auth required, ?search=)',
      dietPlans:'GET  /api/diet/plans         (Auth required, ?date=YYYY-MM-DD)',
      checkout: 'POST /api/payment/checkout   (Auth required)',
      webhook:  'POST /api/payment/webhook    (Public — Midtrans only)',
      status:   'GET  /api/payment/status     (Auth required)',
    },
    docs: 'Add Authorization: Bearer <supabase_jwt> header to protected endpoints',
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'aethergym-api',
    timestamp: new Date().toISOString(),
    environment: env.MIDTRANS_IS_PRODUCTION ? 'production' : 'development',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
/**
 * Route structure:
 *   /api/food/*      → Food scanning and logging
 *   /api/diet/*      → Analytics and diet planning
 *   /api/payment/*   → Checkout and Midtrans webhook
 */
app.use('/api/food',    foodRoutes);
app.use('/api/diet',    dietRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/user',    userRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─── Global Error Handler (must be last middleware) ───────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(env.PORT, () => {
  console.log('');
  console.log('  ╔═══════════════════════════════════════════╗');
  console.log('  ║   🏋️  Aethergym Suite — API Server         ║');
  console.log('  ╠═══════════════════════════════════════════╣');
  console.log(`  ║  URL:  http://localhost:${env.PORT}               ║`);
  console.log(`  ║  Env:  ${env.MIDTRANS_IS_PRODUCTION ? 'production  ' : 'development'} (Midtrans ${env.MIDTRANS_IS_PRODUCTION ? 'LIVE' : 'sandbox'})   ║`);
  console.log('  ╠═══════════════════════════════════════════╣');
  console.log('  ║  Endpoints:                               ║');
  console.log('  ║   GET  /health                            ║');
  console.log('  ║   POST /api/food/scan                     ║');
  console.log('  ║   GET  /api/food/logs                     ║');
  console.log('  ║   POST /api/food/logs                     ║');
  console.log('  ║   GET  /api/diet/analytics?period=weekly  ║');
  console.log('  ║   GET  /api/diet/master-foods             ║');
  console.log('  ║   GET  /api/diet/plans                    ║');
  console.log('  ║   POST /api/payment/checkout              ║');
  console.log('  ║   POST /api/payment/webhook               ║');
  console.log('  ║   GET  /api/payment/status                ║');
  console.log('  ╚═══════════════════════════════════════════╝');
  console.log('');
});

export default app;
