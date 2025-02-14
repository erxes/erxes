import { IIntegrationDocument } from "../models/definitions/integrations";

export type Message = {
  senderId: string;
  recipientId: string;
  integration: IIntegrationDocument;
  message: any;
  tag?: string;
};
