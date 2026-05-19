import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import {
  TAiKnowledgeLanguage,
  TAiKnowledgeMetadata,
  TAiKnowledgePriority,
} from '../ai/knowledge';

export interface IAiAgentKnowledgeChunkDocument {
  _id: string;
  agentId: string;
  fileId: string;
  fileName: string;
  chunkIndex: number;
  title?: string;
  headingPath: string[];
  content: string;
  contentHash: string;
  byteSize: number;
  tokenCount?: number;
  topics: string[];
  keywords: string[];
  priority: TAiKnowledgePriority;
  language: TAiKnowledgeLanguage;
  metadata: TAiKnowledgeMetadata;
  embedding?: number[];
  embeddingModel?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const aiAgentKnowledgeChunkSchema =
  new Schema<IAiAgentKnowledgeChunkDocument>(
    {
      _id: { type: String, default: () => nanoid() },
      agentId: { type: String, required: true, index: true },
      fileId: { type: String, required: true, index: true },
      fileName: { type: String, required: true },
      chunkIndex: { type: Number, required: true },
      title: { type: String },
      headingPath: { type: [String], default: () => [] },
      content: { type: String, required: true },
      contentHash: { type: String, required: true },
      byteSize: { type: Number, required: true },
      tokenCount: { type: Number },
      topics: { type: [String], default: () => [], index: true },
      keywords: { type: [String], default: () => [], index: true },
      priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'always'],
        default: 'normal',
        index: true,
      },
      language: {
        type: String,
        enum: ['mn', 'en', 'mixed', 'unknown'],
        default: 'unknown',
      },
      metadata: { type: Object, default: () => ({}) },
      embedding: { type: [Number], default: undefined },
      embeddingModel: { type: String },
    },
    { timestamps: true },
  );

aiAgentKnowledgeChunkSchema.index(
  { agentId: 1, fileId: 1, chunkIndex: 1 },
  { unique: true, name: 'ai_agent_chunk_position_unique' },
);

aiAgentKnowledgeChunkSchema.index({
  agentId: 1,
  priority: 1,
});

aiAgentKnowledgeChunkSchema.index({
  agentId: 1,
  topics: 1,
});

aiAgentKnowledgeChunkSchema.index({
  agentId: 1,
  keywords: 1,
});

aiAgentKnowledgeChunkSchema.index(
  {
    title: 'text',
    content: 'text',
    keywords: 'text',
    topics: 'text',
  },
  {
    name: 'ai_agent_chunk_text_search',
    language_override: 'textSearchLanguage',
    weights: {
      title: 8,
      keywords: 6,
      topics: 4,
      content: 1,
    },
  },
);
