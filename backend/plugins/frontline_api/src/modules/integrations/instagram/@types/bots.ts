import { Document } from 'mongoose';

export interface IPersistentMenus {
    _id: number;
    text: string;
    type: string;
    link?: string;
  }
  export interface IBot {
    name: string;
    accountId: string;
    uid: string;
    pageId: string;
    token: string;
    status: string;
    persistentMenus: IPersistentMenus[];
    greetText?: string;
    tag?: string;
    isEnabledBackBtn?: boolean;
    backButtonText?: string;
  }
  
  export interface IInstagramBotDocument extends IBot, Document {
    _id: string;
  }
  