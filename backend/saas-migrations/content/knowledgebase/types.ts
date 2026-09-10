import type { ObjectId } from 'mongodb';

export interface RecordDocument extends Record<string, unknown> {
  _id: string;
}

export type EntityKind =
  | 'topic'
  | 'category'
  | 'article'
  | 'translation'
  | 'postType';
export type TargetCollection =
  | 'cms_categories'
  | 'cms_posts'
  | 'cms_translations'
  | 'cms_custom_post_types';

export interface ImportOptions {
  mongoUrl: string;
  sourceSubdomain: string;
  targetSubdomain: string;
  clientPortalId: string;
  topicIds: string[];
  authorMap: Record<string, string>;
  fallbackAuthorId?: string;
  dryRun: boolean;
  batchSize: number;
  maxDocuments: number;
  maxBytes: number;
  sourceArticleUrlTemplate?: string;
  mediaBaseUrl?: string;
}

export interface Mapping extends RecordDocument {
  version: 1;
  sourceDb: string;
  clientPortalId: string;
  kind: EntityKind;
  sourceId: string;
  sourceHash: string;
  sourceDocument: RecordDocument;
  targetCollection: TargetCollection;
  targetDocument: RecordDocument;
  targetHash: string;
  sourceUrl?: string;
  targetUrl?: string;
}

export interface Snapshot {
  sourceDb: string;
  targetDb: string;
  cms: Record<string, unknown> & {
    _id: string | ObjectId;
    clientPortalId: string;
  };
  topics: RecordDocument[];
  categories: RecordDocument[];
  articles: RecordDocument[];
  translations: RecordDocument[];
  userIds: Set<string>;
  target: Record<TargetCollection, RecordDocument[]>;
  mappings: Mapping[];
}

export interface ImportPlan {
  mappings: Mapping[];
  warnings: string[];
  errors: string[];
  counts: Record<string, number>;
  reusedPostTypeId?: string;
}

export const MAPPING_COLLECTION = 'migration_knowledgebase_mappings';
export const TARGET_COLLECTIONS: TargetCollection[] = [
  'cms_custom_post_types',
  'cms_categories',
  'cms_posts',
  'cms_translations',
];
