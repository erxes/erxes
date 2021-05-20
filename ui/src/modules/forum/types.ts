import { QueryResponse } from 'modules/common/types';

export interface IForum {
  _id: string;
  title: string;
  description: string;
  languageCode: string;
  brandId: string;
}

export interface ITopic {
  _id: string;
  title: string;
  description: string;
}

export interface IDiscussion {
  _id: string;
  title: string;
  description: string;
}

// mutation types

export type ForumVariables = {
  title: string;
  description: string;
  languageCode: string;
  brandId: string;
};

export type AddForumsMutationResponse = {
  addForumsMutation: (params: { variables: ForumVariables }) => Promise<any>;
};

export type EditForumsMutationResponse = {
  editForumsMutation: (params: { variables: ForumVariables }) => Promise<any>;
};

export type RemoveForumsMutationResponse = {
  removeForumsMutation: (params: {
    variables: { _id: string };
  }) => Promise<any>;
};

// query types

export type ForumsQueryResponse = {
  forums: IForum[];
} & QueryResponse;

export type ForumDetailQueryResponse = {
  forumDetails: IForum;
} & QueryResponse;

export type ForumsTotalCountQueryResponse = {
  forumsTotalCount: number;
} & QueryResponse;
