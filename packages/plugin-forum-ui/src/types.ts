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
