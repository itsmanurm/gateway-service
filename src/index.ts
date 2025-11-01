import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { v4 as uuidv4 } from 'uuid';

import { logger } from './lib/logger';
import { jwtAuth } from './middleware/jwt';
import aiProxy from './routes/ai-proxy';

const PORT = Number(process.env.PORT ?? 8090);
const ORIGIN = process.env.CORS_ORIGIN ?? '*';

const app = express();
app.set('trust proxy', 1);

app.use(pinoHttp({
  logger,
  genReqId: (req) => req.header('x-request-id') ?? uuidv4(),
  autoLogging: { ignore: (req) => req.url === '/health' || req.url === '/live' }
}));

app.use(cors({ origin: ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/live', (_req, res) => res.status(200).send('OK'));
app.get('/ready', (_req, res) => res.status(200).json({ ok: true, aiBaseUrl: process.env.AI_BASE_URL }));
app.get('/health', (_req, res) => res.json({ ok: true, service: 'gateway-service', time: new Date().toISOString() }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_PER_MIN ?? 120),
  standardHeaders: 'draft-7',
  legacyHeaders: false
});
app.use('/api', limiter);

app.use(jwtAuth);

app.use('/api/ai', aiProxy);

app.use((req, res, next) => {
  const rid = (req as any).id ?? req.header('x-request-id');
  if (rid) res.setHeader('x-request-id', rid);
  next();
});

app.listen(PORT, () => {
  logger.info(`[gateway] listening on :${PORT}`);
});
