import { incomingWebhookHandler } from '@/executions/actions/webhook/incoming/incomingWebhookHandler';
import { incomingWebhookHealthHandler } from '@/executions/actions/webhook/incoming/incomingWebhookHealthHandler';
import {
  continueRateLimit,
  webhookRateLimit,
} from '@/executions/actions/webhook/incoming/rateLimits';
import { waitingWebhookExecutionHandler } from '@/executions/actions/webhook/incoming/waitingWebhookExecutionHandler';
import express, { Router } from 'express';
import helmet from 'helmet';

export const incomingWebhookRouter: Router = express.Router();

incomingWebhookRouter.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    hidePoweredBy: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

const rawBodyMiddleware = express.raw({
  type: '*/*',
  limit: '1mb', // limit payload to reasonable size
  verify: (req, _, buf: Buffer) => {
    // Store raw body for signature verification
    (req as any).rawBody = buf;
  },
});
incomingWebhookRouter.all(
  '/:id/*',
  webhookRateLimit,
  rawBodyMiddleware,
  incomingWebhookHandler,
);

// Health check endpoint for webhook route
incomingWebhookRouter.get(
  '/:id/health',
  rawBodyMiddleware,
  incomingWebhookHealthHandler,
);

incomingWebhookRouter.get(
  '/executions/:executionId/continue/*',
  rawBodyMiddleware,
  continueRateLimit,
  waitingWebhookExecutionHandler,
);
