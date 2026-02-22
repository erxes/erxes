import { Document, Schema } from 'mongoose';

// export interface IGolomtBankConfig {
//   registerId: string;
//   name: string;
//   organizationName: string;
//   clientId: string;
//   ivKey: string;
//   sessionKey: string;
//   configPassword: string;
//   accountId: string;
//   golomtCode: string;
//   apiUrl: string;
// }

// export interface IGolomtBankConfigDocument extends IGolomtBankConfig, Document {
//   _id: string;
//   createdAt: Date;
// }

export const golomtBankConfigSchema = new Schema(
  {
    registerId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    organizationName: {
      type: String,
    },
    ivKey: {
      type: String,
    },
    clientId: {
      type: String,
      required: true,
    },
    sessionKey: {
      type: String,
      required: true,
    },
    configPassword: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    golomtCode: {
      type: String,
      required: true,
    },
    apiUrl: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'golomt_bank_configs',
  },
);
