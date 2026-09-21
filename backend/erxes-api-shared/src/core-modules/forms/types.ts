export type PropertySystemFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select'
  | 'multiSelect'
  | 'relation'
  | 'file'
  | 'phone';

export interface IPropertySystemField {
  code: string;
  name: string;
  type: PropertySystemFieldType;
}

export interface IPropertyType {
  type: string;
  description: string;
  systemFields?: IPropertySystemField[];
}

export interface IPropertyMeta {
  types: IPropertyType[];
}
