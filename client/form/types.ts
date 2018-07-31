import { IIntegration } from '../types';

export interface IConnectResponse {
  form: IForm;
  integration: IIntegration;
}

export interface IField {
  _id: string;
  contentType: string;
  contentTypeId: string;
  type: string;
  validation?: string;
  text: string;
  description?: string;
  options?: string[];
  isRequired: boolean;
  isDefinedByErxes: boolean;
  order: number;
  groupId: string;
  isVisible: boolean;
  lastUpdatedUserId: string;
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
  themeColor?: string;
  createdUserId: string;
  fields: IField[];
  callout?: ICallout;
}

export type FieldValue = string | number | Date | string[];

export interface IFieldError {
  fieldId: string;
  code: string;
  text: string;
}

export interface ICurrentStatus {
  status: string;
  errors?: IFieldError[];
}