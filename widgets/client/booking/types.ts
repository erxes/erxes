import { IBrand, IUser } from '../types';

export interface IStyle {
  itemShape?: string;
  widgetColor: string;
  productAvailable: string;
  productUnavailable: string;
  productSelected: string;

  textAvailable: string;
  textUnavailable: string;
  textSelected: string;
}

export interface IDisplayBlock {
  shape?: string;
  columns?: string;
  rows?: string;
  margin?: string;
}

export interface IProductCategory {
  _id: string;
  name: string;
  order: string;
  code: string;
  description?: string;
  attachment?: any;
  status: string;
  parentId?: string;
  createdAt: Date;
  productCount: number;
  isRoot: boolean;
}

export interface IProduct {
  _id: string;
  name?: string;
  type: string;
  categoryId: string;
  description: string;
  sku: string;
  code: string;
  unitPrice: number;
  customFieldsData?: any;
  createdAt: Date;
  vendorId?: string;

  attachment?: any;
  attachmentMore?: any[];
  supply: string;
  productCount: number;
  minimiumCount: number;
  category: IProductCategory;

  customFieldsDataWithText?: JSON;
}

export interface ICategoryTree {
  _id: string;
  name: string;
  parentId: string;
  type: string;
}

export interface IBooking {
  _id: string;
  // content
  name?: string;
  description?: string;
  userFilters?: string[];
  image?: any;

  productCategoryId?: string;

  // settings
  title?: string;
  formId?: string;

  buttonText?: string;

  // common
  createdDate?: Date;

  brand?: IBrand;
  createdUser?: IUser;

  // style
  styles: IStyle;

  // display blocks
  displayBlock: IDisplayBlock;

  // child categories
  childCategories: IProductCategory[];
  categoryTree: ICategoryTree[];

  mainProductCategory: IProductCategory;
}
