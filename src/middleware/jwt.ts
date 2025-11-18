import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function jwtAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization as string | undefined;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) {
    return res.status(401).json({ ok: false, error: 'missing_token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET not configured');
    return res.status(500).json({ ok: false, error: 'server_misconfigured' });
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    // Attach user info to request for downstream handlers
    (req as any).user = payload;
    return next();
  } catch (err: any) {
    console.warn('Invalid JWT token:', (err as any)?.message || err);
    return res.status(401).json({ ok: false, error: 'invalid_token' });
  }
}
