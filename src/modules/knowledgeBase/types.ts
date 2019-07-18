import { IUser } from 'modules/auth/types';
import { IBrand } from 'modules/settings/brands/types';

export interface IArticle {
  _id: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  reactionChoices: string[];
  reactionCounts: any;
  createdBy: string;
  createdUser: IUser;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface ITopic {
  _id: string;
  title: string;
  description: string;
  categories: ICategory[];
  brand: IBrand;
  color: string;
  backgroundImage: string;
  languageCode: string;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
}

export interface ICategory {
  _id: string;
  title: string;
  description: string;
  articles: IArticle[];
  icon: string;
  createdBy: string;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  firstTopic: ITopic;
}

// mutation types

export type ArticleVariables = {
  title: string;
  summary: string;
  content: string;
  status: string;
  categoryIds: string[];
};

export type AddArticlesMutationResponse = {
  addArticlesMutation: (
    params: { variables: ArticleVariables }
  ) => Promise<any>;
};

export type EditArticlesMutationResponse = {
  editArticlesMutation: (
    params: { variables: ArticleVariables }
  ) => Promise<any>;
};

export type RemoveArticlesMutationResponse = {
  removeArticlesMutation: (
    params: { variables: { _id: string } }
  ) => Promise<any>;
};

export type CategoryVariables = {
  title: string;
  description: string;
  icon: string;
  topicIds: string[];
};

export type AddCategoriesMutationResponse = {
  addCategoriesMutation: (
    params: { variables: CategoryVariables }
  ) => Promise<any>;
};

export type EditCategoriesMutationResponse = {
  editCategoriesMutation: (
    params: { variables: CategoryVariables }
  ) => Promise<any>;
};

export type RemoveCategoriesMutationResponse = {
  removeCategoriesMutation: (params: { variables: { _id: string } }) => any;
};

export type TopicVariables = {
  title: string;
  description: string;
  brandId: string;
  languageCode: string;
  color: string;
};

export type AddTopicsMutationResponse = {
  addTopicsMutation: (params: { variables: TopicVariables }) => Promise<any>;
};

export type EditTopicsMutationResponse = {
  editTopicsMutation: (params: { variables: TopicVariables }) => Promise<any>;
};

export type RemoveTopicsMutation = {
  removeTopicsMutation: (
    params: { variables: { _id: string } }
  ) => Promise<any>;
};

// query types

export type ArticlesQueryResponse = {
  knowledgeBaseArticles: IArticle[];
  loading: boolean;
  refetch: () => void;
};

export type CategoriesQueryResponse = {
  knowledgeBaseCategories: ICategory[];
  loading: boolean;
  refetch: () => void;
};

export type TopicsQueryResponse = {
  knowledgeBaseTopics: ITopic[];
  loading: boolean;
  refetch: () => void;
};

export type ArticlesTotalCountQueryResponse = {
  knowledgeBaseArticlesTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type CategoriesTotalCountQueryResponse = {
  knowledgeBaseCategoriesTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type TopicsTotalCountQueryResponse = {
  knowledgeBaseTopicsTotalCount: number;
  loading: boolean;
  refetch: () => void;
};

export type CategoryDetailQueryResponse = {
  knowledgeBaseCategoryDetail: ICategory;
  loading: boolean;
  refetch: () => void;
};

export type LastCategoryQueryResponse = {
  knowledgeBaseCategoriesGetLast: ICategory;
  loading: boolean;
  refetch: () => void;
};
