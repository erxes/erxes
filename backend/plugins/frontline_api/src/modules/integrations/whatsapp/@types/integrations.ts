import { Document } from 'mongoose';

export type WhatsappHealthStatus = 'healthy' | 'unhealthy';

/** One WhatsApp Business phone number connected through Embedded Signup. */
export interface IWhatsappIntegration {
  erxesApiId?: string;
  businessId?: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName?: string;
  phoneStatus?: string;
  accessToken: string;
  healthStatus: WhatsappHealthStatus;
  error?: string;
  connectedBy: string;
  /** Set until the connection is attached to an inbox; drives the TTL cleanup. */
  pendingSince?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWhatsappIntegrationDocument
  extends IWhatsappIntegration,
    Document {
  _id: string;
}

export interface IWhatsappConnectionView {
  _id: string;
  erxesApiId?: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber: string;
  verifiedName?: string;
  phoneStatus?: string;
  needsRegistration: boolean;
  healthStatus: WhatsappHealthStatus;
  error?: string;
}
