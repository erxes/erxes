import { IIntegration } from "../types";

export interface IConnectResponse {
  form: IForm;
  integration: IIntegration;
}

export interface ILogic {
  fieldId: string;
  logicOperator: string;
  logicValue: FieldValue;
}

export interface IProduct {
  _id: string;
  name: string;
  unitPrice: number;
}

export interface IObjectListConfig {
  key: string;
  label: string;
  type: string;
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
  locationOptions?: ILocationOption[];
  objectListConfigs?: IObjectListConfig[];
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
  productCategoryId?: string;
  products?: IProduct[];
}

export interface ICallout {
  title?: string;
  body?: string;
  buttonText?: string;
  featuredImage?: string;
  skip?: boolean;
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
  googleMapApiKey?: string;
}

interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export type FieldValue =
  | string
  | number
  | Date
  | string[]
  | IAttachment[]
  | ILocationOption
  | IObjectListConfig[]
  | object;

export interface IFieldError {
  fieldId?: string;
  code?: string;
  text: string;
}

export interface ICurrentStatus {
  status: string;
  errors?: IFieldError[];
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
    productId?: string;
  };
}

export interface ISaveFormResponse {
  status: string;
  conversationId: string;
  errors?: IFieldError[];
}

export interface ILocationOption {
  lat: number;
  lng: number;
  description?: string;
}


export type EnabledServices = {
  [key: string]: boolean;
}