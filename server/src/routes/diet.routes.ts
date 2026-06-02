/**
 * diet.routes.ts — Diet Analytics & Diet Plan API routes
 *
 * Base path: /api/diet (mounted in server.ts)
 *
 * Routes:
 *   GET    /api/diet/analytics          → Recharts-ready aggregated nutrition data
 *   GET    /api/diet/master-foods       → Browse/search admin food database
 *   GET    /api/diet/plans              → Fetch user's diet plan for a date
 *   POST   /api/diet/plans              → Add food to diet plan
 *   PATCH  /api/diet/plans/:id/consumed → Toggle consumed status
 *   DELETE /api/diet/plans/:id          → Remove diet plan item
 */
import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getAnalytics,
  getMasterFoods,
  getDietPlans,
  createDietPlan,
  markPlanConsumed,
  deleteDietPlan,
} from '../controllers/diet.controller.js';

const router = Router();

// All diet routes require authentication
router.use(authenticate);

// Analytics endpoint — the core Statistics page data source
// Usage: GET /api/diet/analytics?period=weekly
router.get('/analytics', getAnalytics);

// Master food database (admin-curated, read-only for members)
// Usage: GET /api/diet/master-foods?search=nasi&limit=10
router.get('/master-foods', getMasterFoods);

// Diet planning
router.get('/plans', getDietPlans);
router.post('/plans', createDietPlan);
router.patch('/plans/:id/consumed', markPlanConsumed);
router.delete('/plans/:id', deleteDietPlan);

export default router;
