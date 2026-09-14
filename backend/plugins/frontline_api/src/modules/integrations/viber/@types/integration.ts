import { Document } from 'mongoose';
import type { ViberHealthStatus } from '@/integrations/viber/constants';

export interface IViberIntegration {
  inboxId: string;
  botId: string;
  token: string;
  healthStatus?: ViberHealthStatus;
  error?: string;
}

export interface IViberIntegrationDocument extends IViberIntegration, Document {
  _id: string;
}
