export interface ICategory {
  _id: string;
  type: string;
  name: string;
  order?: string;
  code: string;
  postsCount?: number;
  thumbnail?: string;
  ancestors?: any;
}

export interface IPost {
  _id?: string;
  title?: string;
  category?: {
    _id: string;
    code: string;
    name: string;
    thumbnail: string;
    postsReqCrmApproval: boolean;
  };
  categoryId: string;
  description?: string;
  content?: string;
  state?: string;
  thumbnail?: string;
  createdAt?: string;
  updatedAt?: string;
  stateChangedAt?: string;
  commentCount?: number;
  categoryApprovalState?: string;
  viewCount?: number;
  upVoteCount?: number;
  downVoteCount?: number;
  createdUserType?: string;
  createdBy?: {
    _id?: string;
    username?: string;
    email?: string;
  };
  createdByCp?: {
    _id?: string;
    email?: string;
    username?: string;
  };
  updatedUserType?: string;
  updatedBy?: {
    _id?: string;
    username?: string;
    email?: string;
  };
  updatedByCp?: {
    _id?: string;
    email?: string;
    username?: string;
  };
  stateChangedUserType?: string;
  stateChangedBy?: {
    _id?: string;
    username?: string;
    email?: string;
  };
  stateChangedByCp?: {
    _id?: string;
    email?: string;
    username?: string;
  };
}

export interface IPage {
  _id: string;
  code?: string;
  content?: string;
  custom?: JSON;
  customIndexed?: JSON;
  description?: string;
  listOrder?: number;
  thumbnail?: string;
  title?: string;
}

/* queries */

export type PagesQueryResponse = {
  pages: IPage[];
  loading: boolean;
  refetch: () => void;
};

export type PostsQueryResponse = {
  pages: IPost[];
  loading: boolean;
  refetch: () => void;
};

export type PageDetailQueryResponse = {
  forumPage: IPage;
  loading: boolean;
};

export type PostDetailQueryResponse = {
  forumPost: IPost;
  loading: boolean;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};
