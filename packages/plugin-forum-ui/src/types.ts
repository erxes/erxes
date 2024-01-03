import { timeDuractionUnits } from './constants';

export type TimeDurationUnit = typeof timeDuractionUnits[number];

export interface ICategory {
  _id?: string;
  type?: string;
  name?: string;
  order?: number;
  description?: string | null;
  code?: string;
  postsCount?: number;
  ancestors?: ICategory[];
  parentId?: string | null;
  thumbnail?: string | null;
  postsReqCrmApproval?: boolean | null;
  userLevelReqPostRead?: string | null;
  userLevelReqPostWrite?: string | null;
  userLevelReqCommentWrite?: string | null;
  postReadRequiresPermissionGroup?: boolean | null;
  postWriteRequiresPermissionGroup?: boolean | null;
  commentWriteRequiresPermissionGroup?: boolean | null;
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
  tagIds?: string[];
  tags?: [
    {
      _id: string;
      colorCode?: string;
      createdAt?: string;
      name?: string;
      objectCount?: number;
      order?: string;
      parentId?: string;
      relatedIds?: string;
      totalObjectCount?: number;
      type?: string;
    }
  ];
  isFeaturedByAdmin?: boolean;
  isFeaturedByUser?: boolean;
  pollOptions?: [
    {
      _id: string;
      order: number;
      title: string;
      postId: string;
      voteCount: number;
    }
  ];
  isPollMultiChoice?: boolean;
  createdById?: string;
  pollEndDate?: string;
  categoryId: string;
  description?: string;
  content?: string;
  state?: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  createdAt?: string;
  updatedAt?: string;
  stateChangedAt?: string;
  lastPublishedAt?: string;
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

export interface IComment {
  _id: string;
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
  content: string;
  replies?: IComment[];
  postId: string;
}

export interface IUserGroupDocument {
  _id?: string;
  name?: string;
  users?: IClientPortalUser[];
}

export interface IClientPortalUser {
  _id?: string;
  avatar?: string;
  code?: string;
  company?: string;
  phone?: string;
  companyName?: string;
  firstName?: string;
  email?: string;
  username?: string;
  lastName?: string;
}

export interface IProduct {
  _id: string;
  name?: string | null;
  description?: string | null;
  userType?: string | null;
  listOrder: number;
  multiplier: number;
  price: number;
  unit: string;
}

export interface IPermission {
  _id: string;
  category: {
    name: string;
    _id: string;
  };
  permission: string;
  permissionGroup: {
    name: string;
    cpUserIds: string[];
  };
}

export interface IQuiz {
  _id?: string;
  name?: string;
  description?: string;
  company?: {
    _id?: string;
    primaryName?: string;
    primaryEmail?: string;
    primaryPhone?: string;
  };
  post?: {
    _id?: string;
    title?: string;
  };
  category?: {
    _id?: string;
    name?: string;
    parent?: {
      _id?: string;
      name?: string;
    };
  };
  tagIds?: string[];
  state?: string;
  isLocked?: string;
  categoryId?: string;
  companyId?: string;
  postId?: string;
  questions?: [
    {
      _id?: string;
    }
  ];
}

export interface ICompany {
  _id?: string;
  primaryEmail?: string;
  primaryName?: string;
  primaryPhone?: string;
}
export interface IPollOption {
  _id?: string;
  title: string;
  order: number;
  isNew?: boolean;
}

export interface IQuestion {
  _id?: string;
  text?: string | null;
  imageUrl?: string | null;
  isMultipleChoice?: boolean;
  listOrder?: number;
  choices?: [
    {
      _id: string;
      imageUrl?: string;
      isCorrect: boolean;
      questionId: string;
      listOrder: number;
      quizId: string;
      text?: string;
    }
  ];
}

export interface IChoiceEditable {
  imageUrl?: string;
  isCorrect: boolean;
  listOrder: number;
  text?: string;
}

export interface IChoice extends IChoiceEditable {
  _id: string;
  questionId: string;
}

export interface ITag {
  _id: string;
  colorCode?: string;
  createdAt?: string;
  name?: string;
  order?: string;
  objectCount?: number;
  parentId?: string;
  relatedIds?: string[];
  totalObjectCount?: number;
  type?: string;
}

/* queries */

export type PagesQueryResponse = {
  pages: IPage[];
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
  removeMutation: (params: {
    variables: { _id: string };
    refetchQueries?: any;
  }) => Promise<any>;
};
