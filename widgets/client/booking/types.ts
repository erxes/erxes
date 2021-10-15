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

export type FieldValue = string | number | Date | string[] | IAttachment[];

export interface IFieldError {
  fieldId?: string;
  code?: string;
  text: string;
}

export interface ILogic {
  fieldId: string;
  logicOperator: string;
  logicValue: FieldValue;
}

export interface IField {
  _id: string;
  contentType: string;
  contentTypeId: string;
  type: string;
  validation?: string;
  text: string;
  content?: string;
  description?: string;
  options?: string[];
  isRequired: boolean;
  isDefinedByErxes: boolean;
  order: number;
  groupId: string;
  isVisible: boolean;
  lastUpdatedUserId: string;
  associatedFieldId?: string;
  column?: number;

  logicAction?: string;
  logics?: ILogic[];
  pageNumber?: number;
}

export interface IForm {
  _id: string;
  title: string;
  code: string;
  description?: string;
  buttonText?: string;
  createdUserId: string;
  fields: IField[];
  numberOfPages?: number;
}

interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}
export interface ILeadData {
  loadType?: string;
  successAction?: string;
  fromEmail?: string;
  userEmailTitle?: string;
  userEmailContent?: string;
  adminEmails?: string[];
  adminEmailTitle?: string;
  adminEmailContent?: string;
  thankTitle?: string;
  thankContent?: string;
  redirectUrl?: string;
  themeColor?: string;
  createdUserId?: string;
  createdUser?: IUser;
  createdDate?: Date;
  viewCount?: number;
  contactsGathered?: number;
  tagIds?: string[];
  form?: IForm;
  isRequireOnce?: boolean;
  templateId?: string;
  attachments?: IAttachment[];
  conversionRate?: number;
}

export interface IEmailParams {
  toEmails: string[];
  fromEmail: string;
  title: string;
  content: string;
  formId: string;
  attachments?: IAttachment[];
}

export interface IFieldError {
  fieldId?: string;
  code?: string;
  text: string;
}

export interface IFormDoc {
  [fieldId: string]: {
    value: FieldValue;
    text: string;
    type: string;
    validation: string;
    associatedFieldId: string;
    groupId: string;
    isHidden?: boolean;
    column?: number;
  };
}

export interface ICurrentStatus {
  status: string;
  errors?: IFieldError[];
}
