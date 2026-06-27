import type { UseFormReturn } from 'react-hook-form';

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

export interface PostFormThumbnail {
  url: string;
  name?: string;
  type?: string;
}

export interface PostFormData {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  type?: string;
  status?: PostStatus;
  categoryIds?: string[];
  tagIds?: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  thumbnail?: string | PostFormThumbnail | null;
  gallery?: string[];
  video?: string | null;
  videoUrl?: string;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  publishDate?: Date | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
  customFieldsData?: PostCustomFieldInput[];
}

export interface PostFormTranslation {
  title: string;
  content: string;
  excerpt: string;
  customFieldsData: PostCustomFieldInput[];
}

export type PostFormTranslations = Record<string, PostFormTranslation>;

export interface PostFormPost {
  _id: string;
  count?: number;
  clientPortalId?: string;
  title?: string;
  slug?: string;
  content?: string;
  description?: string;
  excerpt?: string;
  type?: string;
  status?: PostStatus;
  categoryIds?: string[];
  tagIds?: string[];
  categories?: { _id: string }[];
  tags?: { _id: string }[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  thumbnail?: PostFormThumbnail | null;
  images?: AttachmentInput[];
  video?: AttachmentInput;
  audio?: AttachmentInput;
  videoUrl?: string;
  documents?: AttachmentInput[];
  attachments?: AttachmentInput[];
  pdf?: string | null;
  pdfAttachment?: {
    pdf?: AttachmentInput;
    pages?: AttachmentInput[];
  };
  publishedDate?: string | Date | null;
  scheduledDate?: string | Date | null;
  autoArchiveDate?: string | Date | null;
  customFieldsData?: PostCustomFieldInput[];
}

export interface PostFormReadyState {
  form: UseFormReturn<PostFormData>;
  onSubmit: (data: PostFormData) => void | Promise<void>;
  creating: boolean;
  saving: boolean;
  handleLanguageChange: (language: string) => void;
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
  cmsPost: PostFormPost;
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
