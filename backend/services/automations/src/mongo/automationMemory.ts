import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IAutomationMemoryDocument {
  _id: string;
  automationId: string;
  namespace: string;
  scopeKey: string;
  data: Record<string, unknown>;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const automationMemorySchema = new Schema<IAutomationMemoryDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    automationId: { type: String, required: true, index: true },
    namespace: { type: String, required: true, index: true },
    scopeKey: { type: String, required: true, index: true },
    data: { type: Object, default: () => ({}) },
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true },
);

automationMemorySchema.index(
  { automationId: 1, namespace: 1, scopeKey: 1 },
  { unique: true, name: 'automation_memory_scope_unique' },
);

automationMemorySchema.index(
  { expiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { expiresAt: { $exists: true } },
  },
);
