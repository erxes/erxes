import { IIntegration, IRule } from "../types";

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
  createdUserId: string;
  fields: IField[];
}

export type FieldValue = string | number | Date | string[];

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
  };
}

export interface ISaveFormResponse {
  status: string;
  errors?: IFieldError[];
}
