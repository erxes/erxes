export type CustomTourFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox';

export interface ICustomTourType {
  _id: string;
  branchId: string;
  code: string;
  label: string;
  pluralLabel: string;
  description?: string;
  createdAt?: string;
}

export interface ICustomTourField {
  _id: string;
  label: string;
  code?: string;
  type: CustomTourFieldType;
  description?: string;
  isRequired?: boolean;
  options?: string[];
}

export interface ICustomTourFieldGroup {
  _id: string;
  branchId: string;
  label: string;
  code?: string;
  customTourTypeIds?: string[];
  customTourTypes?: ICustomTourType[];
  enabledTourIds?: string[];
  fields?: ICustomTourField[];
}

export interface ICustomFieldValue {
  field: string;
  value: any;
  stringValue?: string;
  numberValue?: number;
  dateValue?: Date | string;
}

export const CUSTOM_TOUR_FIELD_TYPES: Array<{
  label: string;
  value: CustomTourFieldType;
}> = [
  { label: 'Text', value: 'text' },
  { label: 'Long text', value: 'textarea' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Select', value: 'select' },
  { label: 'Radio', value: 'radio' },
  { label: 'Checkbox', value: 'checkbox' },
];
