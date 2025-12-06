import {
  IAttachment,
  ICustomField,
  IPdfAttachment,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IPostTag {
  clientPortalId: string;
  name: string;
  colorCode?: string;
  slug: string;

  createdUserId: string;
}

export interface IPostTagDocument extends IPostTag, Document {
  _id: string;
}

export interface IPostCategory {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
  clientPortalId: string;
  customFieldsData?: ICustomField[];
}

export interface IPostCategoryDocument extends IPostCategory, Document {
  _id: string;
  createdAt: Date;
}

export interface IPost {
  clientPortalId: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  categoryIds?: string[];
  type: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  tagIds?: string[];
  authorKind?: 'user' | 'clientPortalUser';
  authorId?: string;
  featured?: boolean;
  featuredDate?: Date | null;
  scheduledDate?: Date;
  autoArchiveDate?: Date;
  publishedDate?: Date;

  viewCount?: number;

  reactions?: string[];
  reactionCounts?: { [key: string]: number };

  thumbnail?: IAttachment;
  images?: IAttachment[];
  video?: IAttachment;
  audio?: IAttachment;
  documents?: IAttachment[];
  attachments?: IAttachment[];
  videoUrl?: string;
  pdfAttachment?: IPdfAttachment;

  customFieldsData?: ICustomField;
}

export interface IPostDocument extends IPost, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
