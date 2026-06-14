export interface IKnowledgeBaseImage {
  url: string;
  name: string;
  type: string;
  size: number;
  duration: number;
}

export interface IKnowledgeBaseFirstTopic {
  _id: string;
  title: string;
  code: string;
  color: string;
  backgroundImage: string;
}

export interface IKnowledgeBaseArticle {
  _id: string;
  viewCount: number;
  topicId: string;
  title: string;
  summary: string;
  status: string;
  reactionCounts: Record<string, number>;
  reactionChoices: string[];
  publishedAt: string;
  modifiedDate: string;
  isPrivate: boolean;
  image: IKnowledgeBaseImage;
  content: string;
  code: string;
  categoryId: string;
  attachments: IKnowledgeBaseImage[];
  firstTopic?: IKnowledgeBaseFirstTopic;
}

export interface IKnowledgeBaseTopicCategory {
  _id: string;
  title: string;
  description: string;
  numOfArticles: number;
  countArticles: number;
  parentCategoryId: string;
  icon: string;
  color: string;
  backgroundImage: string;
  code: string;
  firstTopic?: IKnowledgeBaseFirstTopic;
  articles: IKnowledgeBaseArticle[];
}

export interface IKnowledgeBaseTopic {
  _id: string;
  title: string;
  description: string;
  color: string;
  code: string;
  categories: IKnowledgeBaseTopicCategory[];
  parentCategories: (IKnowledgeBaseTopicCategory & {
    childrens?: {
      _id: string;
    }[];
  })[];
}
