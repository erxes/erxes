import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const providerSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    provider: { type: String, required: true, unique: true, label: 'Provider' },
    label: { type: String, label: 'Display Name' },
    apiKey: { type: String, label: 'API Key' },
    baseUrl: { type: String, label: 'Base URL' },
    isDefault: { type: Boolean, default: false },
    isEnabled: { type: Boolean, default: true },
    isOpenAICompatible: { type: Boolean, default: false },
    modelsEndpoint: { type: String },
    envKey: { type: String },
  },
  { timestamps: true },
);
