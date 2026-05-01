import { Document } from 'mongoose';

export interface IInstagramPersistentMenus {
  _id: number;
  text: string;
  type: string;
  link?: string;
}
export interface IInstagramBot {
  name: string;
  accountId: string;
  uid: string;
  pageId: string;
  token: string;
  status: string;
  persistentMenus: IInstagramPersistentMenus[];
  greetText?: string;
  tag?: string;
  isEnabledBackBtn?: boolean;
  backButtonText?: string;
}

export interface IInstagramBotDocument extends IInstagramBot, Document {
  _id: string;
}
