import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

// How customers ask for a knowledge section, learned from answers that worked.
// It stores the path, never the answer: the section is read fresh every time.
export interface IAiKnowledgeRouteDocument {
  _id: string;
  agentId: string;
  phrase: string;
  section: string;
  hits: number;
  misses: number;
  lastUsedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const aiKnowledgeRouteSchema = new Schema<IAiKnowledgeRouteDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    agentId: { type: String, required: true, index: true },
    phrase: { type: String, required: true },
    section: { type: String, required: true },
    hits: { type: Number, default: 0 },
    misses: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

aiKnowledgeRouteSchema.index(
  { agentId: 1, phrase: 1, section: 1 },
  { unique: true, name: 'ai_knowledge_route_unique' },
);
