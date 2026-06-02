/**
 * diet.controller.ts — Diet Analytics & Diet Plan Endpoints
 *
 * Handles:
 *   GET /api/diet/analytics?period=daily|weekly|monthly
 *     → Aggregates food_logs and returns Recharts-ready BarChart data
 *
 *   GET  /api/diet/plans?date=YYYY-MM-DD  → Fetch user's diet plans
 *   POST /api/diet/plans                  → Create a new diet plan entry
 *   PATCH /api/diet/plans/:id/consumed    → Mark a plan item as consumed
 *   DELETE /api/diet/plans/:id            → Remove a diet plan entry
 */
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabaseClient.js';
import { createError } from '../middleware/errorHandler.js';
import { subDays, subWeeks, subMonths, startOfDay, endOfDay, format } from 'date-fns';

// ─── GET /api/diet/analytics ─────────────────────────────────────────────────

/**
 * Recharts BarChart data point shape.
 * Each object in the array represents one time-bucket (day/week/month).
 *
 * Example output for weekly period:
 * [
 *   { label: "Mon 26 May", calories: 1850, protein: 82, carbs: 210, fat: 55 },
 *   { label: "Tue 27 May", calories: 2100, protein: 95, carbs: 240, fat: 70 },
 *   ...
 * ]
 */
interface AnalyticsDataPoint {
  label: string;   // X-axis label for Recharts
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface AnalyticsSummary {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  avg_calories: number;
  data_points: number;
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const period = (req.query.period as string | undefined) ?? 'weekly';

    const validPeriods = ['daily', 'weekly', 'monthly'];
    if (!validPeriods.includes(period)) {
      throw createError(400, `Invalid period. Must be one of: ${validPeriods.join(', ')}`);
    }

    const now = new Date();

    // ── Calculate date range based on period ────────────────────────────────
    let startDate: Date;
    let groupByFormat: string;      // date-fns format string for bucket labels

    switch (period) {
      case 'daily':
        // Last 24 hours, grouped by hour
        startDate = subDays(now, 1);
        groupByFormat = 'HH:00';    // "14:00", "15:00", etc.
        break;
      case 'weekly':
        // Last 7 days, grouped by day
        startDate = subDays(now, 6);
        groupByFormat = 'EEE dd MMM'; // "Mon 26 May"
        break;
      case 'monthly':
      default:
        // Last 30 days, grouped by week
        startDate = subDays(now, 29);
        groupByFormat = 'dd MMM';    // "26 May"
        break;
    }

    // ── Fetch food_logs within the date range ───────────────────────────────
    const { data: logs, error } = await supabaseAdmin
      .from('food_logs')
      .select('calories, protein, carbs, fat, consumed_at')
      .eq('user_id', userId)
      .gte('consumed_at', startDate.toISOString())
      .lte('consumed_at', endOfDay(now).toISOString())
      .order('consumed_at', { ascending: true });

    if (error) {
      throw createError(500, `Failed to fetch analytics data: ${error.message}`);
    }

    // ── Aggregate logs into time buckets ────────────────────────────────────
    const buckets = new Map<string, AnalyticsDataPoint>();

    // Pre-populate all expected buckets with zeros (ensures gaps show as 0)
    if (period === 'daily') {
      for (let h = 0; h < 24; h++) {
        const label = `${String(h).padStart(2, '0')}:00`;
        buckets.set(label, { label, calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    } else if (period === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const date = subDays(now, i);
        const label = format(date, groupByFormat);
        buckets.set(label, { label, calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    } else {
      // Monthly: create one bucket per day for the last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = subDays(now, i);
        const label = format(date, groupByFormat);
        buckets.set(label, { label, calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    }

    // Accumulate values into their corresponding bucket
    for (const log of logs ?? []) {
      const date = new Date(log.consumed_at);
      const label = format(date, groupByFormat);

      if (buckets.has(label)) {
        const bucket = buckets.get(label)!;
        bucket.calories += Math.round(log.calories ?? 0);
        bucket.protein  += Math.round(log.protein  ?? 0);
        bucket.carbs    += Math.round(log.carbs    ?? 0);
        bucket.fat      += Math.round(log.fat      ?? 0);
      }
    }

    const chartData = Array.from(buckets.values());

    // ── Compute summary statistics ───────────────────────────────────────────
    const nonEmptyBuckets = chartData.filter(d => d.calories > 0);
    const totalCalories = chartData.reduce((sum, d) => sum + d.calories, 0);
    const summary: AnalyticsSummary = {
      total_calories: totalCalories,
      total_protein:  chartData.reduce((sum, d) => sum + d.protein, 0),
      total_carbs:    chartData.reduce((sum, d) => sum + d.carbs, 0),
      total_fat:      chartData.reduce((sum, d) => sum + d.fat, 0),
      avg_calories:   nonEmptyBuckets.length > 0
        ? Math.round(totalCalories / nonEmptyBuckets.length)
        : 0,
      data_points: nonEmptyBuckets.length,
    };

    /**
     * Response shape is designed to be directly used in Recharts BarChart:
     *
     *   <BarChart data={response.chart_data}>
     *     <XAxis dataKey="label" />
     *     <Bar dataKey="calories" fill="#8884d8" />
     *     <Bar dataKey="protein"  fill="#82ca9d" />
     *     <Bar dataKey="carbs"    fill="#ffc658" />
     *     <Bar dataKey="fat"      fill="#ff7300" />
     *   </BarChart>
     */
    res.json({
      success: true,
      period,
      summary,
      chart_data: chartData,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/diet/plans ──────────────────────────────────────────────────────

export async function getDietPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const targetDate = (req.query.date as string) ?? format(new Date(), 'yyyy-MM-dd');

    const { data, error } = await supabaseAdmin
      .from('diet_plans')
      .select(`
        *,
        master_foods (name, calories, protein, carbs, fat, serving_size, image_url)
      `)
      .eq('user_id', userId)
      .eq('planned_date', targetDate)
      .order('meal_type', { ascending: true });

    if (error) {
      throw createError(500, `Failed to fetch diet plans: ${error.message}`);
    }

    res.json({ success: true, date: targetDate, data: data ?? [] });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/diet/plans ─────────────────────────────────────────────────────

export async function createDietPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const {
      food_name,
      calories,
      planned_date,
      meal_type,
      master_food_id,
      food_log_id,
      notes,
    } = req.body;

    if (!food_name || !planned_date || !meal_type) {
      throw createError(400, 'Required fields: food_name, planned_date, meal_type');
    }

    const { data, error } = await supabaseAdmin
      .from('diet_plans')
      .insert({
        user_id:        userId,
        food_name,
        calories:       Number(calories ?? 0),
        planned_date,
        meal_type,
        master_food_id: master_food_id ?? null,
        food_log_id:    food_log_id ?? null,
        notes:          notes ?? null,
        is_consumed:    false,
      })
      .select()
      .single();

    if (error) {
      throw createError(500, `Failed to create diet plan: ${error.message}`);
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/diet/plans/:id/consumed ──────────────────────────────────────

export async function markPlanConsumed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { is_consumed } = req.body;

    const { data, error } = await supabaseAdmin
      .from('diet_plans')
      .update({ is_consumed: Boolean(is_consumed) })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw createError(500, `Failed to update diet plan: ${error.message}`);
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/diet/plans/:id ───────────────────────────────────────────────

export async function deleteDietPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('diet_plans')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw createError(500, `Failed to delete diet plan: ${error.message}`);
    }

    res.json({ success: true, message: 'Diet plan entry deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/diet/master-foods ───────────────────────────────────────────────

export async function getMasterFoods(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, limit = '20' } = req.query;

    let query = supabaseAdmin
      .from('master_foods')
      .select('*')
      .order('name', { ascending: true })
      .limit(parseInt(limit as string, 10));

    // Full-text search on food name
    if (search && typeof search === 'string') {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw createError(500, `Failed to fetch master foods: ${error.message}`);
    }

    res.json({ success: true, data: data ?? [] });
  } catch (err) {
    next(err);
  }
}
