export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'radio'
  | 'file'
  | 'image';

export interface ICustomField {
  _id: string;
  label: string;
  code: string;
  type: FieldType;
  description?: string;
  isRequired?: boolean;
  options?: string[];
}

export interface ICustomFieldGroup {
  _id: string;
  label: string;
  code: string;
  clientPortalId: string;
  customPostTypeIds: string[];
  customPostTypes?: Array<{
    _id: string;
    code: string;
    label: string;
    pluralLabel: string;
  }>;
  fields: ICustomField[];
}

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'file', label: 'File' },
  { value: 'image', label: 'Image' },
];
