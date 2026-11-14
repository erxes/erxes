import { Document } from 'mongoose';

/** The tenant's Papa Logistic client credentials (one document per tenant). */
export interface IPapaConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  staffId?: string;
  callbackSecret: string;
  callbackUrl?: string;
  callbackRegisteredAt?: Date;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface IPapaConfigDocument extends IPapaConfig, Document {
  _id: string;
}
