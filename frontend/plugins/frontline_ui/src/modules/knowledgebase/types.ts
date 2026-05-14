import type { IAttachment, IPdfAttachment } from 'erxes-ui';

export type { IUser, ICategory, ITopic } from '../../../../content_ui/src/modules/cms/types';

export interface IArticleCustomFormField {
  id: string;
  label: string;
  value: string;
}

export interface IKnowledgeBaseArticle {
  _id: string;
  code?: string;
  title: string;
  summary?: string;
  content?: string;
  status: string;
  isPrivate?: boolean;
  reactionChoices?: string[];
  image?: IAttachment;
  attachments?: IAttachment[];
  pdfAttachment?: IPdfAttachment;
  categoryId?: string;
  fileUrl?: string;
  fileSize?: number;
  fileDuration?: number;
  fileName?: string;
  fileType?: string;
  customForms?: IArticleCustomFormField[];
}

export interface ArticleFormData {
  code?: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  isPrivate: boolean;
  reactionChoices: string[];
  image?: IAttachment;
  attachments: IAttachment[];
  pdfAttachment?: IPdfAttachment;
  fileUrl?: string;
  fileSize?: number;
  fileDuration?: number;
  fileName?: string;
  fileType?: string;
  customForms: IArticleCustomFormField[];
}

export type ArticleInput = Omit<
  ArticleFormData,
  'fileUrl' | 'fileSize' | 'fileDuration' | 'fileName' | 'fileType'
>;
