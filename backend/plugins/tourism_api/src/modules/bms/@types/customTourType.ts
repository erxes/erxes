import { Document } from 'mongoose';

export interface ICustomTourType {
  branchId: string;
  label: string;
  name?: string;
  pluralLabel: string;
  code: string;
  description?: string;
  isActive?: boolean;
}

export interface ICustomTourTypeDocument extends ICustomTourType, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomTourField {
  _id?: string;
  label: string;
  code?: string;
  type: string;
  description?: string;
  isRequired?: boolean;
  options?: string[];
}

export interface ICustomTourFieldGroup {
  branchId: string;
  label: string;
  code?: string;
  parentId?: string;
  order?: number;
  customTourTypeIds?: string[];
  enabledTourIds?: string[];
  type?: string;
  fields?: ICustomTourField[];
}

export interface ICustomTourFieldGroupDocument
  extends ICustomTourFieldGroup,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
