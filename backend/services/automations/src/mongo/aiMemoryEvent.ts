import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

// Long-term memory of what an AI agent's tools did — "the request became
// record #482". Working memory (automations_memories) expires with the
// conversation turn; these stay. A record is kept by id only: its current
// state is read from its owner whenever the memory is recalled.
export interface IAiMemoryEventDocument {
  _id: string;
  scopes: { type: string; id: string }[];
  automationId: string;
  executionId: string;
  aiActionId: string;
  toolId?: string;
  toolName?: string;
  sourceActionId: string;
  sourceActionType: string;
  record?: { type: string; id: string };
  fields: Record<string, unknown>;
  createdAt: Date;
}

export const aiMemoryEventSchema = new Schema<IAiMemoryEventDocument>({
  _id: { type: String, default: () => nanoid() },
  scopes: {
    type: [
      new Schema(
        {
          type: { type: String, required: true },
          id: { type: String, required: true },
        },
        { _id: false },
      ),
    ],
    required: true,
  },
  automationId: { type: String, required: true },
  executionId: { type: String, required: true },
  aiActionId: { type: String, required: true },
  toolId: { type: String },
  toolName: { type: String },
  sourceActionId: { type: String, required: true },
  sourceActionType: { type: String, required: true },
  record: {
    type: new Schema(
      {
        type: { type: String, required: true },
        id: { type: String, required: true },
      },
      { _id: false },
    ),
  },
  fields: { type: Object, default: () => ({}) },
  createdAt: { type: Date, default: () => new Date() },
});

aiMemoryEventSchema.index(
  { 'scopes.type': 1, 'scopes.id': 1, createdAt: -1 },
  { name: 'ai_memory_event_scope' },
);
aiMemoryEventSchema.index({
  automationId: 1,
  sourceActionId: 1,
  createdAt: -1,
});
