/**
 * auth.ts — Authentication Middleware
 *
 * Validates the Bearer JWT token from the Authorization header using Supabase.
 * On success, attaches the user object to req.user for downstream handlers.
 * On failure, returns 401 Unauthorized.
 */
import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabaseClient.js';

// Extend the Express Request type to include our user payload
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
      };
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // Verify the JWT with Supabase Auth
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error?.message ?? 'Invalid or expired token',
      });
      return;
    }

    // Fetch the user's role from public.users table
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    // Attach user info to request for downstream handlers
    req.user = {
      id: user.id,
      email: user.email ?? '',
      role: profile?.role ?? 'guest',
    };

    next();
  } catch (err) {
    console.error('[Auth Middleware] Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: 'Authentication check failed' });
  }
}

/**
 * requireRole — Role-based access control middleware.
 * Use after `authenticate`.
 *
 * Example: router.delete('/users/:id', authenticate, requireRole('admin'), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role ?? '')) {
      res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
      return;
    }
    next();
  };
}
