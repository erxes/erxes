import { Document } from 'mongoose';

export interface ICustomTourType {
  _id: string;
  branchId: string;

  label: string;
  name?: string;
  pluralLabel: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface ICustomTourTypeDocument extends ICustomTourType, Document {
  _id: string;
}

export interface ICustomTourFieldGroup {
  _id: string;
  branchId: string;
  label: string;
  code?: string;
  parentId?: string;
  order?: number;
  customTourTypeIds?: string[];
  enabledTourIds?: string[];
  type?: string;
  fields?: any[];
}

export interface ICustomTourFieldGroupDocument
  extends ICustomTourFieldGroup,
    Document {
  _id: string;
}
