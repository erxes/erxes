import { incomingWebhookRouter } from '@/executions/actions/webhook/incoming/incomingWebhook';
import { Router } from 'express';

export const webhookRoutes: Router = Router();

webhookRoutes.use('/automation', incomingWebhookRouter);
