import { Document } from 'mongoose';

export type DataType = 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';

export interface IAttributeDefinition {
  name: string;
  key: string;
  dataType: DataType;
  required?: boolean;
  description?: string;
  options?: string[];
  min?: number;
  max?: number;
  subAttributes?: IAttributeDefinition[];
}

export interface IInsuranceType {
  name: string;
  code: string;
  attributes: IAttributeDefinition[];
}

export interface IInsuranceTypeDocument extends IInsuranceType, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
