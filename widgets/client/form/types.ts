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
}

interface IAttachment {
  name: string;
  url: string;
  size: number;
  type: string;
}

export type FieldValue = string | number | Date | string[]| IAttachment[];

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
  };
}

export interface ISaveFormResponse {
  status: string;
  errors?: IFieldError[];
}
