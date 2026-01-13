import { Document } from "mongoose";

interface IPersistentMenus {
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
  
  export interface IBotDocument extends IBot, Document {
    _id: string;
  }
  