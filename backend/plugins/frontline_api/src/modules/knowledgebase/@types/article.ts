import { IPdfAttachment } from 'erxes-api-shared/core-types';
import { ICommonFields } from '@/knowledgebase/@types/common';
import { Document } from 'mongoose';

interface IFormCodes {
    brandId: string;
    formId: string;
}

export interface IArticle {
    code?: string;
    title?: string;
    summary?: string;
    content?: string;
    status?: string;
    isPrivate?: boolean;
    reactionChoices?: string[];
    reactionCounts?: { [key: string]: number };
    viewCount?: number;
    categoryId?: string;
    topicId?: string;
    publishedUserId?: string;
    publishedAt?: Date;
    scheduledDate?: Date;
  
    forms?: IFormCodes[];
  
    pdfAttachment?: IPdfAttachment;
}

export interface IArticleDocument extends ICommonFields, IArticle, Document {
    _id: string;
}