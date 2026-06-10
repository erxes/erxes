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
    // Custom HTTP headers sent with every request (e.g. a User-Agent that a
    // gated endpoint like Kimi For Coding requires). Free-form key→value map.
    headers: { type: Object, label: 'Custom HTTP Headers' },
  },
  { timestamps: true },
);
