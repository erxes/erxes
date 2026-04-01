import { incomingWebhookRouter } from './incomingWebhook';
import { Router } from 'express';

export const webhookRoutes: Router = Router();

webhookRoutes.use('/automation', incomingWebhookRouter);
