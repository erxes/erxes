/** Shapes returned by the Frontline `cpKnowledgeBaseTopicDetail` query. */

export type KbUser = {
  _id: string;
  details?: {
    fullName?: string | null;
    avatar?: string | null;
  } | null;
} | null;

export type KbArticle = {
  _id: string;
  title: string | null;
  summary: string | null;
  content: string | null;
  categoryId: string | null;
  viewCount: number | null;
  createdDate: string | null;
  modifiedDate: string | null;
  publishedAt: string | null;
  createdUser: KbUser;
};

export type KbCategory = {
  _id: string;
  title: string | null;
  description: string | null;
  icon: string | null;
  numOfArticles: number | null;
  authors: { _id: string }[] | null;
  articles?: KbArticle[] | null;
};

export type KbSection = KbCategory & {
  childrens: KbCategory[] | null;
};

export type KbTopic = {
  _id: string;
  title: string | null;
  description: string | null;
  color: string | null;
  parentCategories: KbSection[] | null;
};
