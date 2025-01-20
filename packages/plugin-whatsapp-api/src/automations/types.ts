import { IIntegrationDocument } from '../models/Integrations';

export type Message = {
  senderId: string;
  recipientId: string;
  integration: IIntegrationDocument;
  message: any;
  tag?: string;
};
