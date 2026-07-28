import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export type TAiKnowledgeIndexRunStatus =
  | 'queued'
  | 'indexing'
  | 'indexed'
  | 'failed'
  | 'cancelled';

export interface IAiAgentKnowledgeIndexRunDocument {
  _id: string;
  agentId: string;
  pluginName: string;
  moduleName: string;
  sourceKey: string;
  status: TAiKnowledgeIndexRunStatus;
  config: Record<string, unknown>;
  configHash: string;
  totalCount: number;
  processedCount: number;
  indexedCount: number;
  failedCount: number;
  removedCount: number;
  lastCursor?: string;
  jobId?: string;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const aiAgentKnowledgeIndexRunSchema =
  new Schema<IAiAgentKnowledgeIndexRunDocument>(
    {
      _id: { type: String, default: () => nanoid() },
      agentId: { type: String, required: true, index: true },
      pluginName: { type: String, required: true },
      moduleName: { type: String, required: true },
      sourceKey: { type: String, required: true },
      status: {
        type: String,
        enum: ['queued', 'indexing', 'indexed', 'failed', 'cancelled'],
        default: 'queued',
        required: true,
      },
      config: {
        type: Object,
        default: () => ({}),
      },
      configHash: { type: String, required: true },
      totalCount: { type: Number, default: 0 },
      processedCount: { type: Number, default: 0 },
      indexedCount: { type: Number, default: 0 },
      failedCount: { type: Number, default: 0 },
      removedCount: { type: Number, default: 0 },
      lastCursor: { type: String },
      jobId: { type: String },
      errorMessage: { type: String },
      startedAt: { type: Date },
      completedAt: { type: Date },
    },
    { timestamps: true },
  );

aiAgentKnowledgeIndexRunSchema.index(
  {
    agentId: 1,
    pluginName: 1,
    moduleName: 1,
    sourceKey: 1,
    status: 1,
  },
  { name: 'ai_agent_knowledge_index_run_status' },
);

aiAgentKnowledgeIndexRunSchema.index(
  {
    agentId: 1,
    pluginName: 1,
    moduleName: 1,
    sourceKey: 1,
    configHash: 1,
    createdAt: -1,
  },
  { name: 'ai_agent_knowledge_index_run_config' },
);

aiAgentKnowledgeIndexRunSchema.index(
  { jobId: 1 },
  { name: 'ai_agent_knowledge_index_run_job' },
);
