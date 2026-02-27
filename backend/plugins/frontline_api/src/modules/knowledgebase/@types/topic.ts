import { Document } from 'mongoose';
import { ICommonFields } from '@/knowledgebase/@types/common';

export interface ITopic {
  clientPortalId?: string;
  title?: string;
  code?: string;
  description?: string;
  brandId?: string;
  categoryIds?: string[];
  color?: string;
  backgroundImage?: string;
  languageCode?: string;
  notificationSegmentId?: string;
}

export interface ITopicDocument extends ICommonFields, ITopic, Document {
  _id: string;
}
