import { Document, Schema } from "mongoose";
import { field } from "./utils";

interface IPersistentMenusBot {
  _id: string;
  text: string;
  type: string;
  link?: string;
  isEditing?: boolean;
}
export interface IBot {
  name: string;
  accountId: string;
  uid: string;
  token: string;
  status: string;
  persistentMenus?: IPersistentMenusBot[];
  botGreetMessage?: string;
  getStarted?: boolean;
  tag?: string;
  isEnabledBackBtn?: boolean;
  backButtonText?: string;
}

export interface IBotDocument extends IBot, Document {
  _id: string;
}

const persistentMenuSchema = new Schema({
  _id: { type: Number },
  text: { type: String },
  type: { type: String },
  link: { type: String, optional: true }
});

export const botSchema = new Schema({
  _id: field({ pkey: true }),
  name: { type: String },
  accountId: { type: String },
  uid: { type: String },
  token: { type: String },
  persistentMenus: { type: [persistentMenuSchema] },
  botGreetMessage: { type: String, optional: true },
  tag: { type: String, optional: true },
  getStarted: field({ type: Boolean }),
  createdAt: { type: Date, default: Date.now() },
  isEnabledBackBtn: { type: Boolean, optional: true },
  backButtonText: { type: String, optional: true }
});
