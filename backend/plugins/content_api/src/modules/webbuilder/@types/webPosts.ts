import {
  IAttachment,
  ICustomField,
  IPdfAttachment,
} from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonFields } from '@/webbuilder/@types/common';

export interface IWebPost {
  webId: string;
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

export interface IWebPostDocument extends IWebPost, ICommonFields, Document {
  _id: string;
}

