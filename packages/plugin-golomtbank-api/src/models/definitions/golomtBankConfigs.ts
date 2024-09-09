import { field } from "@erxes/api-utils/src/definitions/utils";
import { Document, Schema } from "mongoose";
export interface IGolomtBankConfig {
  registerId: string;
  name: string;
  organizationName: string;
  clientId: string;
  ivKey: string;
  sessionKey: string;
  configPassword: string;
  accountId: string;
  golomtCode: string;
  apiUrl: string;
}

export interface IGolomtBankConfigDocument extends IGolomtBankConfig, Document {
  _id: string;
  createdAt: Date;
}

export const golomtBankConfigSchema = new Schema({
  _id: field({ pkey: true }),
  registerId: field({ type: String, required: true }),
  name: field({ type: String, required: true }),
  organizationName: field({ type: String }),
  ivKey: field({ type: String }),
  clientId: field({ type: String, required: true }),
  sessionKey: field({ type: String, required: true }),
  configPassword: field({ type: String, required: true }),
  accountId: field({ type: String, required: true }),
  golomtCode: field({ type: String, required: true }),
  apiUrl: field({ type: String, required: true }),
  createdAt: field({ type: Date, default: Date.now })
});
