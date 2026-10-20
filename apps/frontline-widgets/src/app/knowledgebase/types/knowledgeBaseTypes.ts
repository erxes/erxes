export type TKbArticle = {
  _id: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  modifiedDate?: string | null;
  publishedAt?: string | null;
};

export type TKbCategory = {
  _id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  parentCategoryId?: string | null;
  articles?: TKbArticle[] | null;
};

export type TKbTopic = {
  _id: string;
  title?: string | null;
  description?: string | null;
  color?: string | null;
  categories?: TKbCategory[] | null;
};

export type TKbTopicResponse = {
  cpKnowledgeBaseTopicDetail: TKbTopic | null;
};

export type TKbHostMessage =
  | { type: 'ready'; color?: string | null }
  | { type: 'close' };

export type TKbView =
  | { type: 'category'; id: string }
  | { type: 'article'; id: string };
