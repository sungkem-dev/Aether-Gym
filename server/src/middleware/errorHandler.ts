/**
 * errorHandler.ts — Global Express Error Handler
 *
 * Catches any error passed to next(err) from route handlers.
 * Ensures consistent JSON error responses across the entire API.
 * Must be registered LAST in the Express middleware chain.
 */
import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  details?: unknown;
}

export const errorHandler: ErrorRequestHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  console.error(`[Error Handler] ${statusCode} — ${err.message}`, err.stack);

  res.status(statusCode).json({
    error: err.name ?? 'InternalServerError',
    message: err.message ?? 'An unexpected error occurred',
    // Only expose stack trace in development
    ...(isDevelopment && { stack: err.stack }),
    ...(err.details !== undefined && { details: err.details as Record<string, unknown> | string }),
  });
};

/**
 * createError — Helper to create structured API errors.
 * Usage: throw createError(400, 'Invalid request body')
 */
export function createError(statusCode: number, message: string, details?: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}
