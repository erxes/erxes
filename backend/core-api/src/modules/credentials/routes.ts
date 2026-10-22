import express from 'express';
import type { ErrorRequestHandler, Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { generateModels } from '~/connectionResolvers';
import { auditCredentialEvent } from './audit';
import { consumeCredential } from './service';
import { createCredentialStore } from './store';

export const credentialsRouter: Router = express.Router();

credentialsRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

const consumeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  // Honor only Express's configured trusted proxy policy, never raw XFF.
  keyGenerator: (req) => ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown'),
  handler: (_req, res) => { res.status(429).json({ error: 'Credential access denied' }); },
});

credentialsRouter.post('/consume', consumeLimiter, express.json({ limit: '2kb', strict: true }), async (req, res) => {
  try {
    const authorization = req.headers.authorization;
    const body: unknown = req.body;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ') ||
        !body || typeof body !== 'object' || Array.isArray(body) ||
        !('reference' in body) || typeof body.reference !== 'string' || Object.keys(body).length !== 1) {
      res.status(403).json({ error: 'Credential access denied' });
      return;
    }
    const result = await consumeCredential(authorization.slice(7), body.reference, async (tenant) =>
      createCredentialStore(await generateModels(tenant), tenant), auditCredentialEvent);
    res.status(200).json(result);
  } catch {
    // Never propagate errors into Express/Sentry or log a request/token/body.
    res.status(403).json({ error: 'Credential access denied' });
  }
});

credentialsRouter.use((_req, res) => { res.status(404).json({ error: 'Credential access denied' }); });
const credentialsErrorHandler: ErrorRequestHandler = (_error: unknown, _req, res, _next) => {
  // Express identifies error middleware by its four-argument signature.
  void _next;
  res.status(400).json({ error: 'Credential access denied' });
};
credentialsRouter.use(credentialsErrorHandler);
