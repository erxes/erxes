import { QueryResponse } from 'modules/common/types';
import { IBrand } from 'modules/settings/brands/types';

export interface IForum {
  _id: string;
  title: string;
  description: string;
  languageCode: string;
  brand: IBrand;

  topics: ITopic[];
}

export interface ITopic {
  _id: string;
  title: string;
  description: string;
  forumId: string;

  discussions: IDiscussion[];
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
