import { Document } from 'mongoose';

export interface IRule {
  kind: string;
  text: string;
  condition: string;
  value: string;
}

export interface ILink {
  [key: string]: string;
}

export interface IRuleDocument extends IRule, Document {
  _id: string;
}

export interface ICustomField {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date;
}

export interface IBrowserInfo {
  language?: string;
  url?: string;
  city?: string;
  countryCode?: string;
}
