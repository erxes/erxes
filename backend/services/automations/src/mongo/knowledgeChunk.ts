import { Schema } from 'mongoose';
import { nanoid } from 'nanoid';
import {
  TAiKnowledgeLanguage,
  TAiKnowledgeMetadata,
  TAiKnowledgePriority,
} from '../ai/knowledge';

export interface IKnowledgeChunkDocument {
  _id: string;
  sourceType: string;
  sourceId: string;
  sourceVersion: string;
  sourceUpdatedAt: Date;
  sourceUrl?: string;
  agentId?: string;
  fileId?: string;
  fileName?: string;
  visibility: 'public' | 'internal';
  title: string;
  chunkIndex: number;
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

export const knowledgeChunkSchema = new Schema<IKnowledgeChunkDocument>(
  {
    _id: { type: String, default: () => nanoid() },
    sourceType: { type: String, required: true, index: true },
    sourceId: { type: String, required: true, index: true },
    sourceVersion: { type: String, required: true },
    sourceUpdatedAt: { type: Date, required: true },
    sourceUrl: { type: String },
    agentId: { type: String, index: true },
    fileId: { type: String, index: true },
    fileName: { type: String },
    visibility: {
      type: String,
      enum: ['public', 'internal'],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
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

knowledgeChunkSchema.index(
  { sourceType: 1, sourceId: 1, chunkIndex: 1 },
  { unique: true, name: 'knowledge_chunk_source_position_unique' },
);

knowledgeChunkSchema.index({
  sourceType: 1,
  sourceId: 1,
  sourceUpdatedAt: -1,
});

knowledgeChunkSchema.index({
  agentId: 1,
  sourceType: 1,
  fileId: 1,
});

knowledgeChunkSchema.index({
  agentId: 1,
  priority: 1,
});

knowledgeChunkSchema.index({
  agentId: 1,
  topics: 1,
});

knowledgeChunkSchema.index({
  agentId: 1,
  keywords: 1,
});

knowledgeChunkSchema.index({
  visibility: 1,
  topics: 1,
});

knowledgeChunkSchema.index({
  visibility: 1,
  keywords: 1,
});

knowledgeChunkSchema.index(
  {
    title: 'text',
    content: 'text',
    keywords: 'text',
    topics: 'text',
  },
  {
    name: 'knowledge_chunk_text_search',
    default_language: 'none',
    language_override: 'textSearchLanguage',
    weights: {
      title: 8,
      keywords: 6,
      topics: 4,
      content: 1,
    },
  },
);
