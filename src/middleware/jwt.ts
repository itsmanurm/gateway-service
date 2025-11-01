import type { Request, Response, NextFunction } from 'express';

export function jwtAuth(_req: Request, _res: Response, next: NextFunction) {
  // TODO: validar JWT real cuando integremos FinAize
  next();
}
