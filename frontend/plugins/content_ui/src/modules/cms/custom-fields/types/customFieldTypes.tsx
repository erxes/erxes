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
  | 'richText';

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

import {
  IconAt,
  IconCalendarEvent,
  IconChevronDown,
  IconCircleCheck,
  IconFile,
  IconLink,
  IconListDetails,
  IconNumbers,
  IconPhoto,
  IconSquareCheck,
  IconTable,
  IconTextScan2,
  IconTextSize,
} from '@tabler/icons-react';

export const FIELD_TYPES: {
  value: FieldType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'text', label: 'Text', icon: <IconTextSize /> },
  { value: 'textarea', label: 'Textarea', icon: <IconTextScan2 /> },
  { value: 'number', label: 'Number', icon: <IconNumbers /> },
  { value: 'email', label: 'Email', icon: <IconAt /> },
  { value: 'url', label: 'URL', icon: <IconLink /> },
  { value: 'date', label: 'Date', icon: <IconCalendarEvent /> },
  { value: 'checkbox', label: 'Checkbox', icon: <IconSquareCheck /> },
  { value: 'select', label: 'Select', icon: <IconChevronDown /> },
  { value: 'radio', label: 'Radio', icon: <IconCircleCheck /> },
  { value: 'file', label: 'File', icon: <IconFile /> },
  { value: 'image', label: 'Image', icon: <IconPhoto /> },
  {
    value: 'spreadsheet',
    label: 'Spreadsheet (Excel paste)',
    icon: <IconTable />,
  },
  { value: 'richText', label: 'Rich Text (Editor)', icon: <IconListDetails /> },
];

export const FIELD_TYPES_OBJECT = FIELD_TYPES.reduce(
  (acc, type) => {
    acc[type.value] = type;
    return acc;
  },
  {} as Record<FieldType, { value: FieldType; label: string; icon: React.ReactNode }>,
);
