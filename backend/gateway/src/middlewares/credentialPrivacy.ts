import { containsCredentialTraffic, getPlugin } from 'erxes-api-shared/utils';
import { json, type RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { proxyReq, proxyRes, proxyError } from '../proxy/middleware';

const sensitiveBodies = new WeakSet<object>();
const parseBody = json({
  limit: '15mb',
  verify(req, _res, buffer) {
    if (containsCredentialTraffic(buffer.toString('utf8')))
      sensitiveBodies.add(req);
  },
});

const limiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Reject URL-carried vault inputs before existing auth debug logging. */
export const credentialUrlPrivacy: RequestHandler = (req, res, next) => {
  if (!containsCredentialTraffic(req.query)) return next();
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  res.status(400).json({
    errors: [{ message: 'Credentials require a valid JSON POST request.' }],
  });
};

/**
 * Credential operations are core-only. Send them directly to its protected
 * GraphQL boundary so Router validation/coercion cannot echo submitted values
 * or add them to federated query traces. Other operations keep their routing.
 */
export const credentialPrivacy: RequestHandler = (req, res, next) => {
  parseBody(req, res, (error: unknown) => {
    const sensitive =
      sensitiveBodies.has(req) ||
      containsCredentialTraffic(req.body) ||
      containsCredentialTraffic(req.query);
    if (!sensitive) return next(error);

    res.set('Cache-Control', 'no-store');
    res.set('Pragma', 'no-cache');
    if (
      error ||
      req.method !== 'POST' ||
      !req.is('application/json') ||
      containsCredentialTraffic(req.query)
    ) {
      res.status(400).json({
        errors: [{ message: 'Credentials require a valid JSON POST request.' }],
      });
      return;
    }

    limiter(req, res, () => {
      void (async () => {
        try {
          const core = await getPlugin('core');
          if (!core?.address) throw new Error('Core unavailable');
          const proxy = createProxyMiddleware({
            target: core.address,
            proxyTimeout: 15_000,
            timeout: 15_000,
            // Express strips the /graphql mount path before this handler.
            pathRewrite: () => '/graphql',
            on: { proxyReq, proxyRes, error: proxyError },
          });
          proxy(req, res, next);
        } catch {
          res
            .status(503)
            .json({ errors: [{ message: 'Credential service unavailable.' }] });
        }
      })();
    });
  });
};
