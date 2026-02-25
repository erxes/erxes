export interface IUser {
  _id: string;
  details: {
    fullName: string;
    avatar: string;
  };
}

export interface ICategory {
  _id: string;
  topicId: string;
  title: string;
  code?: string;
  description?: string;
  icon?: string;
  numOfArticles?: number;
  countArticles?: number;
  authors?: IUser[];
  parentCategoryId?: string;
  children?: ICategory[];
}

export interface ITopic {
  _id: string;
  title: string;
  code: string;
  description: string;
  brandId: string;
  color: string;
  backgroundImage: string;
  languageCode: string;
  notificationSegmentId: string;
  categories?: ICategory[];
  createdBy?: string;
  createdDate?: string;
  modifiedBy?: string;
  parentCategories?: ICategory[];
}
