import { IBrand, IProductCategory, IUser } from '../types';

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

export interface ICategoryTree {
  _id: string;
  name: string;
  parentId: string;
  type: string;
}

export interface IBookingData {
  _id: string;
  // content
  name: string;
  description: string;
  userFilters?: string[];
  image?: any;

  productCategoryId?: string;
  // style
  style: IStyle;

  // display blocks
  displayBlock: IDisplayBlock;

  // child categories
  childCategories: IProductCategory[];
  categoryTree: ICategoryTree[];

  mainProductCategory: IProductCategory;
}
