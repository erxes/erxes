export interface IAttachment {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

export interface ICategoryTranslation {
  _id?: string;
  language: string;
  name?: string;
}

export interface ICategory {
  _id: string;
  name?: string;
  code?: string;
  tourCount?: number;
  parentId?: string;
  branchId?: string;
  order?: string;
  attachment?: IAttachment;
  language?: string;
  translations?: ICategoryTranslation[];
  createdAt?: string;
  modifiedAt?: string;
}
