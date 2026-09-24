import { Document } from 'mongoose';

export interface IWhatsappConfig {
  code: string;
  value: unknown;
}

export interface IWhatsappConfigDocument extends IWhatsappConfig, Document {
  _id: string;
}
