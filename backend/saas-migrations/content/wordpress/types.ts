import type { ObjectId } from 'mongodb';

export interface WordPressSite {
  title: string;
  description: string;
  link: string;
  language: string;
  baseSiteUrl: string;
  baseBlogUrl: string;
  wxrVersion: string;
}

export interface WordPressAuthor {
  id: string;
  login: string;
  email: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

export interface WordPressTerm {
  id: string;
  taxonomy: string;
  slug: string;
  parentSlug: string;
  name: string;
  description: string;
}

export interface WordPressTaxonomyReference {
  taxonomy: string;
  slug: string;
  name: string;
}

export interface WordPressItem {
  id: string;
  title: string;
  link: string;
  creatorLogin: string;
  content: string;
  excerpt: string;
  postDate: string;
  postDateGmt: string;
  modifiedDate: string;
  modifiedDateGmt: string;
  commentStatus: string;
  slug: string;
  status: string;
  parentId: string;
  menuOrder: number;
  postType: string;
  postPassword: string;
  isSticky: boolean;
  attachmentUrl: string;
  taxonomies: WordPressTaxonomyReference[];
  meta: Record<string, string[]>;
  commentCount: number;
}

export interface WordPressExport {
  site: WordPressSite;
  authors: WordPressAuthor[];
  terms: WordPressTerm[];
  items: WordPressItem[];
}

export interface ErxesAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface ErxesCustomFieldValue {
  field: string;
  value: string | string[];
  stringValue: string;
}

export interface ErxesPostDocument {
  _id: string;
  clientPortalId: string;
  count: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  categoryIds: string[];
  type: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  tagIds: string[];
  authorKind: 'user';
  authorId: string;
  featured: boolean;
  publishedDate?: Date;
  scheduledDate?: Date;
  thumbnail?: ErxesAttachment;
  images?: ErxesAttachment[];
  attachments?: ErxesAttachment[];
  customFieldsData: ErxesCustomFieldValue[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ErxesPageDocument {
  _id: string;
  clientPortalId: string;
  name: string;
  parentId?: string;
  description: string;
  content: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  createdUserId: string;
  thumbnail?: ErxesAttachment;
  pageImages?: ErxesAttachment[];
  attachments?: ErxesAttachment[];
  customFieldsData: ErxesCustomFieldValue[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ErxesCategoryDocument {
  _id: string;
  clientPortalId: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  status: 'active';
}

export interface ErxesTagDocument {
  _id: string;
  clientPortalId: string;
  name: string;
  slug: string;
  createdUserId: string;
}

export interface ErxesTranslationDocument {
  _id: string;
  objectId: string;
  language: string;
  title: string;
  content: string;
  excerpt?: string;
  customFieldsData?: ErxesCustomFieldValue[];
  type: 'post' | 'page' | 'category' | 'tag';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ErxesCustomPostTypeDocument {
  _id: string;
  clientPortalId: string;
  label: string;
  name: string;
  pluralLabel: string;
  code: string;
  description: string;
  isActive: true;
}

export interface ErxesCustomFieldDefinition {
  _id: string;
  label: string;
  code: string;
  type: 'text';
  description: string;
  isRequired: false;
  options: string[];
}

export interface ErxesCustomFieldGroupDocument {
  _id: string;
  clientPortalId: string;
  label: string;
  code: string;
  order: number;
  customPostTypeIds: string[];
  enabledPageIds: string[];
  enabledPostIds: string[];
  type: 'wordpress';
  fields: ErxesCustomFieldDefinition[];
}

export type ErxesMenuLinkType = 'URL' | 'PAGE' | 'POST' | 'CATEGORY' | 'TAG';

export interface ErxesMenuDocument {
  _id: string;
  clientPortalId: string;
  label: string;
  contentType?: string;
  contentTypeId?: string;
  type?: 'cms';
  linkType: ErxesMenuLinkType;
  kind: string;
  url?: string;
  parentId?: string;
  order: number;
  openInNewTab: boolean;
  target: string;
}

export interface WordPressMediaSource {
  sourceId: string;
  sourceUrl: string;
  fileName: string;
  parentTarget?: {
    collection: 'cms_posts' | 'cms_pages';
    targetId: string;
  };
  featuredTargets: {
    collection: 'cms_posts' | 'cms_pages';
    targetId: string;
  }[];
}

export interface WordPressMappingDocument {
  _id: string;
  source: 'wordpress';
  sourceSite: string;
  clientPortalId: string;
  sourceType: string;
  sourceId: string;
  targetCollection: string;
  targetId: string;
  sourceAuthorLogin?: string;
  targetUrl?: string;
  mediaName?: string;
  mediaType?: string;
  mediaSize?: number;
  updatedAt: Date;
}

export interface WordPressImportPlan {
  sourceSite: string;
  clientPortalId: string;
  cmsUpdate: Record<string, string | boolean | string[]>;
  categories: ErxesCategoryDocument[];
  tags: ErxesTagDocument[];
  customPostTypes: ErxesCustomPostTypeDocument[];
  customFieldGroups: ErxesCustomFieldGroupDocument[];
  posts: ErxesPostDocument[];
  pages: ErxesPageDocument[];
  translations: ErxesTranslationDocument[];
  menus: ErxesMenuDocument[];
  media: WordPressMediaSource[];
  mappings: WordPressMappingDocument[];
  warnings: string[];
  skipped: Record<string, number>;
}

export interface WordPressImportTarget {
  targetDbName: string;
  cmsId: string | ObjectId;
}

export interface WordPressImportOptions {
  wxrPath: string;
  targetSubdomain: string;
  clientPortalId: string;
  adminUserId: string;
  dryRun: boolean;
  skipMedia: boolean;
  batchSize: number;
  maxWxrBytes: number;
  maxMediaBytes: number;
  mediaTimeoutMs: number;
  mediaConcurrency: number;
}

export interface MediaImportFailure {
  sourceId: string;
  sourceUrl: string;
  message: string;
}

export interface MediaImportResult {
  attachments: Map<string, ErxesAttachment>;
  failures: MediaImportFailure[];
}
