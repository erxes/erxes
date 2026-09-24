export interface IKbAttachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface IKbPdfAttachment {
  pdf?: IKbAttachment;
  pages?: IKbAttachment[];
}

export type TKnowledgeBaseSection =
  | 'articles'
  | 'categories'
  | 'kbsettings';

export enum KnowledgeBaseHotKeyScope {
  TopicsPage = 'knowledge-base-topics-page',
  CategoriesPage = 'knowledge-base-categories-page',
  ArticlesPage = 'knowledge-base-articles-page',
}

export interface IKnowledgeBaseAuthor {
  _id: string;
  username?: string;
  email?: string;
  details?: {
    fullName?: string;
    avatar?: string;
  };
}

export interface IKnowledgeBaseBrand {
  _id: string;
  name: string;
}

export interface ICategory {
  _id: string;
  title: string;
  code?: string;
  description?: string;
  icon?: string;
  numOfArticles?: number;
  parentCategoryId?: string;
  createdDate?: string;
  modifiedDate?: string;
  authors?: IKnowledgeBaseAuthor[];
}

export interface ITopic {
  _id: string;
  title: string;
  code?: string;
  description?: string;
  brandId?: string;
  brand?: IKnowledgeBaseBrand | null;
  color?: string;
  backgroundImage?: string;
  languageCode?: string;
  notificationSegmentId?: string;
  categories?: ICategory[];
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface IArticle {
  _id: string;
  code?: string;
  title: string;
  summary?: string;
  content?: string;
  status: string;
  isPrivate?: boolean;
  reactionChoices?: string[];
  image?: IKbAttachment | null;
  attachments?: IKbAttachment[];
  pdfAttachment?: IKbPdfAttachment | null;
  topicId?: string;
  categoryId?: string;
  viewCount?: number;
  createdDate?: string;
  modifiedDate?: string;
  scheduledDate?: string;
  createdUser?: IKnowledgeBaseAuthor | null;
  publishedUser?: IKnowledgeBaseAuthor | null;
}

export interface ITopicDoc {
  title: string;
  description?: string;
  code?: string;
  brandId?: string;
  color?: string;
  backgroundImage?: string;
  languageCode?: string;
  notificationSegmentId?: string;
}

export interface ICategoryDoc {
  title: string;
  code?: string;
  description?: string;
  icon: string;
  topicId: string;
  parentCategoryId?: string;
}

export interface IArticleDoc {
  title: string;
  summary?: string;
  content: string;
  status: string;
  isPrivate: boolean;
  reactionChoices: string[];
  categoryId: string;
  image?: IKbAttachment;
  attachments?: IKbAttachment[];
  pdfAttachment?: IKbPdfAttachment;
}

export interface ITopicListResponse {
  knowledgeBaseTopics: ITopic[];
  knowledgeBaseTopicsTotalCount: number;
}

export interface ITopicDetailResponse {
  knowledgeBaseTopicDetail: ITopic;
}

export interface ICategoryListResponse {
  knowledgeBaseCategories: ICategory[];
  knowledgeBaseCategoriesTotalCount: number;
}

export interface IArticleListResponse {
  knowledgeBaseArticles: IArticle[];
  knowledgeBaseArticlesTotalCount: number;
}

export interface IArticleDetailResponse {
  knowledgeBaseArticleDetail: IArticle;
}

export interface IKnowledgeBaseTopicArticle {
  _id: string;
  title: string;
  summary?: string;
  content?: string;
  status?: string;
  code?: string;
  categoryId?: string;
  topicId?: string;
  viewCount?: number;
  isPrivate?: boolean;
  reactionChoices?: string[];
  reactionCounts?: Record<string, number>;
  publishedAt?: string;
  modifiedDate?: string;
  image?: IKbAttachment | null;
  attachments?: IKbAttachment[];
}

export interface IKnowledgeBaseTopicCategory {
  _id: string;
  title: string;
  description?: string;
  numOfArticles?: number;
  countArticles?: number;
  parentCategoryId?: string;
  icon?: string;
  childrens?: { _id: string }[];
  articles?: IKnowledgeBaseTopicArticle[];
}

export interface IKnowledgeBaseTopic {
  _id: string;
  title: string;
  description?: string;
  color?: string;
  code?: string;
  categories?: IKnowledgeBaseTopicCategory[];
  parentCategories?: IKnowledgeBaseTopicCategory[];
}
