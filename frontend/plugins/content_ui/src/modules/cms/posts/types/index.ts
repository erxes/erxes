import type { Posts } from './postsType';

export { Posts } from './postsType';
export { PostsHotKeyScope } from './PostsHotKeyScope';

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export type PostCustomFieldValue =
  | string
  | boolean
  | string[]
  | null
  | undefined;

export interface PostCustomFieldInput {
  field: string;
  value: PostCustomFieldValue;
}

export interface AttachmentInput {
  url: string;
  name: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface PostTranslationInput {
  objectId?: string;
  language: string;
  title?: string;
  content?: string;
  excerpt?: string;
  customFieldsData?: PostCustomFieldInput[];
  type?: string;
}

export interface PostDetailResponse {
  cmsPost: Posts;
}

export interface PostInput {
  clientPortalId?: string;
  webId?: string;
  language?: string;
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string | null;
  status?: PostStatus;
  featured?: boolean;
  authorId?: string;
  publishedDate?: Date | string | null;
  scheduledDate?: Date | string | null;
  autoArchiveDate?: Date | string | null;
  tagIds?: string[];
  categoryIds?: string[];
  reactions?: string[];
  reactionCounts?: Record<string, number>;
  thumbnail?: AttachmentInput;
  images?: AttachmentInput[];
  video?: AttachmentInput;
  audio?: AttachmentInput;
  documents?: AttachmentInput[];
  attachments?: AttachmentInput[];
  pdfAttachment?: {
    pdf?: AttachmentInput;
    pages?: AttachmentInput[];
  };
  videoUrl?: string;
  customFieldsData?: PostCustomFieldInput[];
  type?: string;
  translations?: PostTranslationInput[];
}

export interface PostEditVariables {
  id: string;
  input: PostInput;
}
