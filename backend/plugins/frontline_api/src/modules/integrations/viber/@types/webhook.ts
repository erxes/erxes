import type { Request } from 'express';

export interface IViberWebhookRequest
  extends Request<{ integrationId: string }, unknown, unknown> {
  rawBody?: Buffer;
}
