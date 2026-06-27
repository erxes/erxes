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
  | 'image'
  | 'spreadsheet'
  | 'richText'
  | 'products';

export interface ICustomField {
  _id: string;
  label: string;
  code: string;
  type: FieldType;
  description?: string;
  isRequired?: boolean;
  options?: string[];
}

export interface FieldFormValues {
  label: string;
  code: string;
  type: FieldType;
  description: string;
  isRequired: boolean;
  options: string;
}

export interface FieldGroupFormValues {
  label: string;
  code: string;
  customPostTypeIds: string[];
  enabledPageId?: string;
  enabledPageIds: string[];
  enabledCategoryIds: string[];
  enabledPostIds: string[];
}

export interface ICustomFieldGroup {
  _id: string;
  label: string;
  code: string;
  order?: number;
  clientPortalId: string;
  customPostTypeIds: string[];
  customPostTypes?: Array<{
    _id: string;
    code: string;
    label: string;
    pluralLabel: string;
  }>;
  fields: ICustomField[];
  enabledPageIds?: string[];
  enabledCategoryIds?: string[];
  enabledPostIds?: string[];
}
