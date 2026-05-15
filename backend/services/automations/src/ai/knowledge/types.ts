export type TAiKnowledgePriority = 'low' | 'normal' | 'high' | 'always';

export type TAiKnowledgeLanguage = 'mn' | 'en' | 'mixed' | 'unknown';

export type TAiKnowledgeSourceFile = {
  agentId?: string;
  fileId: string;
  fileName: string;
  content: string;
  metadata?: TAiKnowledgeMetadata;
};

export type TAiKnowledgeMetadata = {
  topics?: string[];
  keywords?: string[];
  priority?: TAiKnowledgePriority;
  language?: TAiKnowledgeLanguage;
  [key: string]: unknown;
};

export type TAiKnowledgeChunk = {
  id?: string;
  agentId?: string;
  fileId: string;
  fileName: string;
  chunkIndex: number;
  title?: string;
  headingPath: string[];
  content: string;
  contentHash: string;
  byteSize: number;
  tokenCount: number;
  topics: string[];
  keywords: string[];
  priority: TAiKnowledgePriority;
  language: TAiKnowledgeLanguage;
  metadata: TAiKnowledgeMetadata;
};

export type TAiKnowledgeChunkerConfig = {
  maxChunkBytes?: number;
  minChunkBytes?: number;
};

export type TAiKnowledgeQuery = {
  text: string;
  topics?: string[];
  keywords?: string[];
};

export type TAiKnowledgeRetrievalConfig = {
  topK?: number;
  maxContextBytes?: number;
  minScore?: number;
  includeAlways?: boolean;
};

export type TAiKnowledgeScoredChunk = {
  chunk: TAiKnowledgeChunk;
  score: number;
  reasons: string[];
};

export type TAiKnowledgeRetrievalResult = {
  chunks: TAiKnowledgeChunk[];
  scored: TAiKnowledgeScoredChunk[];
  query: {
    normalizedText: string;
    terms: string[];
    topics: string[];
    keywords: string[];
  };
  totalBytes: number;
};
