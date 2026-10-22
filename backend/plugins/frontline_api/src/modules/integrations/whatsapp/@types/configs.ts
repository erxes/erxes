import { Document } from 'mongoose';

export interface IWhatsappConfig {
  code: string;
  value: string;
}

export interface IWhatsappConfigDocument extends IWhatsappConfig, Document {
  _id: string;
}

export interface IWhatsappApp {
  appId: string;
  appSecret: string;
  configId: string;
  verifyToken: string;
}
