export interface ICategory {
  _id: string;
  clientPortalId: string;
  name: string;
  slug: string;
  description?: string;
  status?: string;
  parentId?: string;
  parent?: ICategory;
  customFieldsData?: any;
  customFieldsMap?: any;
  createdAt?: string;
  updatedAt?: string;
  __typename?: string;
}

export interface IUser {
  _id: string;
  details: {
    fullName: string;
    avatar: string;
  };
}

export interface PostCategoryInput {
  name: string;
  description?: string;
  slug?: string;
  status?: string;
  parentId?: string;
  clientPortalId?: string;
  customFieldsData?: any;
}
