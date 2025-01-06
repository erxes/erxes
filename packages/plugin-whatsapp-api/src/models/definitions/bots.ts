import { Document, Schema } from "mongoose";
import { field } from "./utils";

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
  whatsappNumberIds?: string[];
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
  whatsappNumberIds: field({
    type: [String],
    label: "whatsapp Number ids",
    optional: true
  }),
  token: { type: String },
  persistentMenus: { type: [persistentMenuSchema] },
  greetText: { type: String, optional: true },
  tag: { type: String, optional: true },
  createdAt: { type: Date, default: Date.now() },
  isEnabledBackBtn: { type: Boolean, optional: true },
  backButtonText: { type: String, optional: true }
});
