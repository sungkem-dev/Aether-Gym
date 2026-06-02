/**
 * storage.service.ts — Supabase Storage Service
 *
 * Handles uploading food images to the Supabase Storage bucket 'food-images'.
 * Returns a permanent public URL for the uploaded file.
 *
 * Setup required in Supabase Dashboard:
 *   1. Go to Storage > New Bucket
 *   2. Name: food-images
 *   3. Toggle "Public bucket" → ON (so images are viewable without auth)
 */
import { supabaseAdmin } from '../config/supabaseClient.js';
import { env } from '../config/env.js';
import { createError } from '../middleware/errorHandler.js';

interface UploadResult {
  path: string;         // path inside the bucket, e.g. "uuid/filename.jpg"
  publicUrl: string;    // full public HTTPS URL
}

/**
 * Uploads a file buffer to Supabase Storage.
 *
 * @param buffer   - Raw file buffer (from multer's memoryStorage)
 * @param filename - Original filename to use as the storage key
 * @param userId   - Prefixed as a folder to organise files per user
 * @param mimeType - e.g. 'image/jpeg', 'image/png'
 */
export async function uploadFoodImage(
  buffer: Buffer,
  filename: string,
  userId: string,
  mimeType: string
): Promise<UploadResult> {
  // Build a unique storage path: userId/timestamp-filename
  const timestamp = Date.now();
  const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storagePath = `${userId}/${timestamp}-${safeFilename}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false, // Never overwrite; each scan gets a unique file
    });

  if (uploadError) {
    console.error('[Storage] Upload error:', uploadError);
    throw createError(500, `Failed to upload image to storage: ${uploadError.message}`);
  }

  // Get the public URL for the uploaded file
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(env.SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(storagePath);

  return { path: storagePath, publicUrl };
}
