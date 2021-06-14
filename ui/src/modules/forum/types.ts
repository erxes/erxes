import { QueryResponse } from 'modules/common/types';
import { IUser } from 'modules/auth/types';
import { IBrand } from 'modules/settings/brands/types';
import { ICustomer } from 'erxes-ui/lib/customers/types';

export interface IForum {
  _id: string;
  title: string;
  description: string;
  languageCode: string;
  brand: IBrand;

  createdBy: string;
  createdUser: IUser;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  topics: ITopic[];
}

export interface ITopic {
  _id: string;
  title: string;
  description: string;
  forumId: string;

  createdBy: string;
  createdUser: IUser;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;

  discussions: IDiscussion[];
}

export interface IDiscussion {
  _id: string;
  title: string;
  description: string;

  createdBy: string;
  createdUser: IUser;
  createdDate: Date;
  modifiedBy: string;
  modifiedDate: Date;
  comments: IComment[];
  content: string;
  status: string;
  startDate: Date;
  closeDate: Date;
  isComplete: boolean;
}

export interface IComment {
  _id: string;
  title: string;
  content: string;
  createdUser: IUser;
  createdDate: Date;
  createdCustomer: ICustomer;
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

// topic

export type RemoveTopicsMutationResponse = {
  removeTopicsMutation: (params: {
    variables: { _id: string };
  }) => Promise<any>;
};

// discussion

export type RemoveDiscussionsMutationResponse = {
  removeDiscussionsMutation: (params: {
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

// Topic

export type TopicsQueryResponse = {
  forumTopics: ITopic[];
} & QueryResponse;

export type TopicDetailQueryResponse = {
  forumTopicDetail: ITopic;
} & QueryResponse;

export type LastTopicQueryResponse = {
  forumTopicsGetLast: ITopic;
} & QueryResponse;

// discussions

export type DiscussionsQueryResponse = {
  forumDiscussions: IDiscussion[];
} & QueryResponse;

export type DiscussionsTotalCountQueryResponse = {
  forumDiscussionsTotalCount: number;
} & QueryResponse;
