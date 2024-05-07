export interface IAccountCategory {
  name: string;
  code: string;
  order: string;
  scopeBrandIds?: string[];
  description?: string;
  parentId?: string;
  status?: string;
  mergeIds?: string[];
  maskType?: string;
  mask?: any;
}

export interface IAccountCategoryDocument extends IAccountCategory {
  _id: string;
  createdAt: Date;
}