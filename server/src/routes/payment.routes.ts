/**
 * payment.routes.ts — Payment & Membership API routes
 *
 * Base path: /api/payment (mounted in server.ts)
 *
 * Routes:
 *   POST /api/payment/checkout  → Create Midtrans Snap transaction (auth required)
 *   POST /api/payment/webhook   → Midtrans webhook (NO auth — public endpoint)
 *   GET  /api/payment/status    → Get current user's membership status (auth required)
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  createCheckout,
  handleWebhook,
  getMembershipStatus,
} from '../controllers/payment.controller.js';

const router = Router();

// ⚠️  WEBHOOK MUST BE PUBLIC — no authentication middleware
// Midtrans calls this endpoint directly without any auth token.
// Security is handled via SHA-512 signature verification inside handleWebhook().
router.post('/webhook', handleWebhook);

// Authenticated routes
router.post('/checkout', authenticate, createCheckout);
router.get('/status',    authenticate, getMembershipStatus);

export default router;
