import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IMessengerApp {
  kind: string;
  name: string;
  credentials?: any;
}

export interface IMessengerAppDocument extends IMessengerApp, Document {
  _id: string;
}

// Messenger apps ===============
export const messengerAppSchema = new Schema({
  _id: field({ pkey: true }),

  kind: field({
    type: String
  }),

  name: field({ type: String }),
  credentials: field({ type: Object })
});
