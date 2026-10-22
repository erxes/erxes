import { Document } from 'mongoose';

/** A WhatsApp contact of one inbox integration, keyed by phone (wa_id) or business-scoped user id. */
export interface IWhatsappCustomer {
  integrationId: string;
  waId?: string;
  userId?: string;
  name?: string;
  erxesApiId?: string;
}

export interface IWhatsappCustomerDocument extends IWhatsappCustomer, Document {
  _id: string;
}

export interface IWhatsappContact {
  waId?: string;
  userId?: string;
  name?: string;
}
