import { Schema } from 'mongoose';

/**
 * Per-user BYOK agents connections. One document per user per tenant (the
 * tenant scope comes from the per-subdomain mongoose connection this schema
 * is registered on); `userId` is unique and `connections` holds one entry
 * per configured provider so the chat can pick between them.
 * `defaultProvider` optionally names the entry an unselected chat turn runs;
 * absent (every pre-existing document) or stale, the first entry applies.
 */
export const agentsConnectionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    connections: {
      type: [
        {
          provider: {
            type: String,
            required: true,
            enum: ['cloudflare-ai-gateway', 'openai', 'kimi', 'kimi-code', 'grok'],
          },
          model: { type: String, required: true },
          config: { type: Object, default: {} },
        },
      ],
      default: [],
    },
    defaultProvider: { type: String },
  },
  {
    timestamps: true,
  },
);
