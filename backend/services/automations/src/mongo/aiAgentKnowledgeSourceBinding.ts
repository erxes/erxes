import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export type TAiKnowledgeSourceIndexStatus =
  | 'queued'
  | 'indexing'
  | 'indexed'
  | 'failed'
  | 'skipped';

export interface IAiAgentKnowledgeSourceBindingDocument {
  _id: string;
  agentId: string;
  pluginName: string;
  moduleName: string;
  sourceKey: string;
  sourceId: string;
  materialized?: boolean;
  configHash?: string;
  lastSyncedRunId?: string;
  status: TAiKnowledgeSourceIndexStatus;
  chunkCount?: number;
  indexedAt?: Date;
  indexError?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const aiAgentKnowledgeSourceBindingSchema =
  new Schema<IAiAgentKnowledgeSourceBindingDocument>(
    {
      _id: { type: String, default: () => nanoid() },
      agentId: { type: String, required: true, index: true },
      pluginName: { type: String, required: true },
      moduleName: { type: String, required: true },
      sourceKey: { type: String, required: true },
      sourceId: { type: String, required: true },
      materialized: { type: Boolean, default: false, index: true },
      configHash: { type: String },
      lastSyncedRunId: { type: String },
      status: {
        type: String,
        enum: ['queued', 'indexing', 'indexed', 'failed', 'skipped'],
        default: 'queued',
        required: true,
      },
      chunkCount: { type: Number },
      indexedAt: { type: Date },
      indexError: { type: String },
    },
    { timestamps: true },
  );

aiAgentKnowledgeSourceBindingSchema.index(
  {
    agentId: 1,
    pluginName: 1,
    moduleName: 1,
    sourceKey: 1,
    sourceId: 1,
  },
  { unique: true, name: 'ai_agent_knowledge_source_binding_unique' },
);

aiAgentKnowledgeSourceBindingSchema.index(
  {
    pluginName: 1,
    moduleName: 1,
    sourceKey: 1,
    sourceId: 1,
  },
  { name: 'ai_agent_knowledge_source_lookup' },
);

aiAgentKnowledgeSourceBindingSchema.index(
  {
    agentId: 1,
    pluginName: 1,
    moduleName: 1,
    sourceKey: 1,
    materialized: 1,
    configHash: 1,
  },
  { name: 'ai_agent_knowledge_source_materialized' },
);
