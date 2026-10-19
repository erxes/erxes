import type {
  FrontlineKbArticleDetailQuery,
  FrontlineKbArticlesQuery,
  FrontlineKbAuthorFieldsFragment,
  FrontlineKbCategoriesQuery,
  FrontlineKbCategoryFieldsFragment,
  FrontlineKbTopicContentQuery,
  FrontlineKbTopicDetailQuery,
  FrontlineKbTopicsQuery,
} from '~/gql/graphql';

export interface IKbAttachment {
  url: string;
  name: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface IKbPdfAttachment {
  pdf?: IKbAttachment;
  pages?: IKbAttachment[];
}

export type TKnowledgeBaseSection = 'articles' | 'categories' | 'kbsettings';

export enum KnowledgeBaseHotKeyScope {
  CategoriesPage = 'knowledge-base-categories-page',
  ArticlesPage = 'knowledge-base-articles-page',
  FormSheet = 'knowledge-base-form-sheet',
}

export type IKnowledgeBaseAuthor = FrontlineKbAuthorFieldsFragment;

export type ITopic = NonNullable<
  NonNullable<FrontlineKbTopicsQuery['knowledgeBaseTopics']>[number]
>;

export type ITopicDetail = NonNullable<
  FrontlineKbTopicDetailQuery['knowledgeBaseTopicDetail']
>;

export type IKnowledgeBaseBrand = NonNullable<ITopic['brand']>;

export type ICategoryFields = FrontlineKbCategoryFieldsFragment;

export type ICategory = NonNullable<
  NonNullable<FrontlineKbCategoriesQuery['knowledgeBaseCategories']>[number]
>;

export type IArticle = NonNullable<
  NonNullable<FrontlineKbArticlesQuery['knowledgeBaseArticles']>[number]
>;

export type IArticleDetail = NonNullable<
  FrontlineKbArticleDetailQuery['knowledgeBaseArticleDetail']
>;

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
  topicId?: string;
  categoryId: string;
  image?: IKbAttachment;
  attachments?: IKbAttachment[];
  pdfAttachment?: IKbPdfAttachment;
  scheduledDate?: string;
}

export type IKnowledgeBaseTopic = NonNullable<
  FrontlineKbTopicContentQuery['knowledgeBaseTopicDetail']
>;

export type IKnowledgeBaseTopicCategory = NonNullable<
  NonNullable<IKnowledgeBaseTopic['categories']>[number]
>;

export type IKnowledgeBaseTopicArticle = NonNullable<
  NonNullable<IKnowledgeBaseTopicCategory['articles']>[number]
>;
