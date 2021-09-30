import { IBrand, IUser } from '../types';

export interface IStyle {
  itemShape?: string;
  widgetColor?: string;
  productAvailable?: string;
  productUnavailable?: string;
  productSelected?: string;

  textAvailable?: string;
  textUnavailable?: string;
  textSelected?: string;
}

export interface IProductCategory {
  _id: string;
  name: string;
  code: string;
  order: string;
  description?: string;
  parentId?: string;
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
  image?: any;
  description?: string;
  userFilters?: string[];

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
  styles?: IStyle;

  // child categories
  childCategories: IProductCategory[];

  categoryTree: [ICategoryTree];
}
