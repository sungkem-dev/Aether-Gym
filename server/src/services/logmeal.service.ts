/**
 * logmeal.service.ts — LogMeal API Integration Service
 *
 * LogMeal is a specialized food recognition and nutritional analysis API.
 * Documentation: https://docs.logmeal.com/
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO OBTAIN YOUR LOGMEAL API TOKEN:
 *   1. Sign up at https://app.logmeal.com/
 *   2. Go to your Dashboard > API Keys
 *   3. Create a new API key and copy it
 *   4. Add it to server/.env as LOGMEAL_API_TOKEN=<your_token>
 *
 * API ENDPOINTS USED:
 *   - POST /v2/image/segmentation/complete
 *     Sends the image and receives a list of recognized food segments + imageId
 *
 *   - POST /v2/recipe/nutritionalInfo          ← CORRECT endpoint (not /nutritional-info/)
 *     Sends the imageId from step 1 and receives full nutritional breakdown
 *
 * AUTHENTICATION:
 *   - Header: Authorization: Bearer <LOGMEAL_API_TOKEN>
 *   - Content-Type: multipart/form-data (for image upload)
 *   - Content-Type: application/json (for nutritionalInfo request)
 *
 * RATE LIMITS (free tier):
 *   - ~100 requests/day. Consider caching results for repeated images.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/env.js';
import { createError } from '../middleware/errorHandler.js';

const LOGMEAL_BASE_URL = 'https://api.logmeal.com/v2';

// ─── Shared auth header helper ─────────────────────────────────────────────────
const authHeaders = () => ({
  Authorization: `Bearer ${env.LOGMEAL_API_TOKEN.trim()}`,
});

// Parsed nutritional result we expose to the rest of the app
export interface NutritionalInfo {
  foodName: string;           // Primary detected food name
  detectedFoods: string[];    // All detected food items (for display)
  calories: number;           // kcal
  protein: number;            // grams
  carbs: number;              // grams
  fat: number;                // grams
  fiber: number;              // grams
  confidence: number;         // 0–1 overall recognition confidence
  rawResponse: object;        // Full API response (stored in ai_scan_results)
}

// ─── Step 1: Segment & recognize food from image ──────────────────────────────
//
// LogMeal segmentation response shape (v2):
//   {
//     imageId: 12345,
//     segmentation_results: [
//       {
//         recognition_results: [ { name: "pizza", prob: 0.97 } ],
//       }
//     ]
//   }

interface RecognitionItem {
  name: string;
  prob?: number;
  probability?: number;
}

interface SegmentationResponse {
  imageId: number | null | undefined;
  segmentation_results?: Array<{
    recognition_results?: RecognitionItem[];
    food_candidates?: RecognitionItem[];
  }>;
  // LogMeal returns this field when it detects the image has no food
  not_food?: boolean;
  message?: string;
}

async function segmentFood(imageBuffer: Buffer, mimeType: string): Promise<SegmentationResponse> {
  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: 'food.jpg',
    contentType: mimeType,
  });

  const segUrl = `${LOGMEAL_BASE_URL}/image/segmentation/complete`;
  console.log(`[LogMeal] POST ${segUrl} (image size: ${imageBuffer.length} bytes, type: ${mimeType})`);

  try {
    const response = await axios.post<SegmentationResponse>(
      segUrl,
      formData,
      {
        headers: {
          ...authHeaders(),
          ...formData.getHeaders(), // Content-Type: multipart/form-data; boundary=...
        },
        timeout: 30_000, // 30s — AI processing can be slow
      }
    );

    const data = response.data;
    console.log(`[LogMeal] Segmentation response: imageId=${data.imageId}, segments=${data.segmentation_results?.length ?? 0}, not_food=${data.not_food ?? false}`);
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status  = err.response?.status;
      const body    = err.response?.data;
      const message = body?.message ?? body?.error ?? err.message;
      console.error(`[LogMeal] Segmentation failed (${status}):`, body);

      if (status === 401) throw createError(500, 'LogMeal API authentication failed. Check LOGMEAL_API_TOKEN.');
      if (status === 429) throw createError(429, 'LogMeal API rate limit exceeded. Try again later.');
      throw createError(502, `LogMeal segmentation API error (${status}): ${message}`);
    }
    throw createError(500, 'Unexpected error calling LogMeal segmentation API');
  }
}

// ─── Step 2: Get nutritional breakdown using the imageId ──────────────────────
//
// LogMeal nutritional response shape (v2):
//   {
//     nutritional_info: {
//       calories: 250,
//       totalNutrients: {
//         PROCNT: { quantity: 12, unit: "g" },
//         CHOCDF: { quantity: 30, unit: "g" },
//         FAT:    { quantity: 8,  unit: "g" },
//         FIBTG:  { quantity: 3,  unit: "g" }
//       }
//     }
//   }

interface NutritionalResponse {
  nutritional_info?: {
    calories?: number;
    totalNutrients?: {
      PROCNT?: { quantity: number; unit: string };  // Protein
      CHOCDF?: { quantity: number; unit: string };  // Carbohydrates
      FAT?:    { quantity: number; unit: string };  // Fat
      FIBTG?:  { quantity: number; unit: string };  // Fiber
    };
  };
}

async function getNutritionalInfo(imageId: number): Promise<NutritionalResponse> {
  // ── CRITICAL: Correct endpoint is /recipe/nutritionalInfo (NOT /nutritional-info/) ──
  const nutUrl = `${LOGMEAL_BASE_URL}/recipe/nutritionalInfo`;
  const body   = { imageId };

  // Debug log — print exact URL + payload before the request fires
  console.log(`[LogMeal] POST ${nutUrl}`);
  console.log(`[LogMeal] Nutritional request body:`, JSON.stringify(body));

  try {
    const response = await axios.post<NutritionalResponse>(
      nutUrl,
      body,
      {
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json',
        },
        timeout: 15_000,
      }
    );

    console.log(`[LogMeal] Nutritional response status: ${response.status}`);
    return response.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status  = err.response?.status;
      const body    = err.response?.data;
      const message = body?.message ?? body?.error ?? err.message;
      console.error(`[LogMeal] Nutritional call failed (${status}):`, body);

      if (status === 404) {
        // imageId was not found on LogMeal's servers — segmentation may have
        // failed silently or returned an invalid/expired imageId.
        throw createError(502, `LogMeal nutritional API: imageId ${imageId} not found. The food recognition step may have failed.`);
      }
      if (status === 401) throw createError(500, 'LogMeal API authentication failed. Check LOGMEAL_API_TOKEN.');
      if (status === 429) throw createError(429, 'LogMeal API rate limit exceeded. Try again later.');
      throw createError(502, `LogMeal nutritional API error (${status}): ${message}`);
    }
    throw createError(500, 'Unexpected error calling LogMeal nutritional API');
  }
}

// ─── Main exported function ───────────────────────────────────────────────────

/**
 * analyzeFood — Full LogMeal pipeline: segmentation + nutritional info.
 *
 * @param imageBuffer - Raw image file buffer
 * @param mimeType    - e.g. 'image/jpeg'
 * @returns           Parsed nutritional data ready to insert into food_logs
 *
 * @throws 400 if image is not food
 * @throws 502 if LogMeal API fails
 */
export async function analyzeFood(
  imageBuffer: Buffer,
  mimeType: string
): Promise<NutritionalInfo> {

  // ── Step 1: Segment & recognize ──────────────────────────────────────────────
  const segmentationResult = await segmentFood(imageBuffer, mimeType);

  // ── Guard: "not food" detection ───────────────────────────────────────────────
  // LogMeal returns not_food=true or an empty segmentation_results array when
  // the image contains no recognizable food. We surface this as a 400 so the
  // frontend can show a user-friendly error instead of a cryptic 502.
  const noSegments = !segmentationResult.segmentation_results?.length;
  if (segmentationResult.not_food || noSegments) {
    throw createError(
      400,
      'No food detected in the image. Please upload a clear photo of food.'
    );
  }

  // ── Guard: missing imageId ────────────────────────────────────────────────────
  // If imageId is null/undefined the nutritional endpoint WILL return 404.
  // Fail loudly here rather than letting it propagate as a confusing 502.
  const imageId = segmentationResult.imageId;
  if (imageId == null) {
    console.error('[LogMeal] Segmentation succeeded but imageId is missing:', segmentationResult);
    throw createError(502, 'LogMeal returned no imageId from segmentation. Cannot fetch nutritional info.');
  }

  // ── Extract detected food names ───────────────────────────────────────────────
  const detectedFoods: string[] = [];
  let confidence = 0;

  for (const segment of segmentationResult.segmentation_results!) {
    const items = segment.recognition_results ?? segment.food_candidates ?? [];
    if (items.length > 0) {
      const topItem = items[0];
      const name    = topItem.name ?? '';
      const prob    = topItem.prob ?? topItem.probability ?? 0;
      if (name) detectedFoods.push(name);
      confidence = Math.max(confidence, prob);
    }
  }

  // ── Step 2: Fetch nutritional info using imageId ──────────────────────────────
  const nutritionalResult = await getNutritionalInfo(imageId);
  const nutrients = nutritionalResult.nutritional_info?.totalNutrients;

  const nutritionalInfo: NutritionalInfo = {
    foodName:     detectedFoods[0] ?? 'Unknown Food',
    detectedFoods,
    calories:     Math.round(nutritionalResult.nutritional_info?.calories ?? 0),
    protein:      Math.round(nutrients?.PROCNT?.quantity ?? 0),
    carbs:        Math.round(nutrients?.CHOCDF?.quantity ?? 0),
    fat:          Math.round(nutrients?.FAT?.quantity ?? 0),
    fiber:        Math.round(nutrients?.FIBTG?.quantity ?? 0),
    confidence:   parseFloat(confidence.toFixed(4)),
    rawResponse: {
      segmentation:  segmentationResult,
      nutritional:   nutritionalResult,
    },
  };

  console.log(`[LogMeal] ✓ Analysis complete: "${nutritionalInfo.foodName}" — ${nutritionalInfo.calories} kcal (confidence: ${(nutritionalInfo.confidence * 100).toFixed(1)}%)`);
  return nutritionalInfo;
}
