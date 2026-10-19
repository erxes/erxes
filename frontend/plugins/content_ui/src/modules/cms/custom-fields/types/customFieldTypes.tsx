import {
  IconAt,
  IconCalendarEvent,
  IconChecks,
  IconChevronDown,
  IconCircleCheck,
  IconFile,
  IconLink,
  IconListDetails,
  IconNumbers,
  IconPhoto,
  IconShoppingCart,
  IconSquareCheck,
  IconTable,
  IconTextScan2,
  IconTextSize,
} from '@tabler/icons-react';
import type { CmsCustomFieldGroupListQuery } from '~/gql/graphql';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'url'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'multiSelect'
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

export type ICustomFieldGroup = Omit<
  NonNullable<
    NonNullable<
      NonNullable<
        CmsCustomFieldGroupListQuery['cmsCustomFieldGroupList']
      >['list']
    >[number]
  >,
  'fields'
> & { fields: ICustomField[] };

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
  { value: 'multiSelect', label: 'Multi-Select', icon: <IconChecks /> },
  { value: 'radio', label: 'Radio', icon: <IconCircleCheck /> },
  { value: 'file', label: 'File', icon: <IconFile /> },
  { value: 'image', label: 'Image', icon: <IconPhoto /> },
  {
    value: 'spreadsheet',
    label: 'Spreadsheet (Excel paste)',
    icon: <IconTable />,
  },
  { value: 'richText', label: 'Rich Text (Editor)', icon: <IconListDetails /> },
  { value: 'products', label: 'Products', icon: <IconShoppingCart /> },
];

export const FIELD_TYPES_OBJECT = FIELD_TYPES.reduce(
  (acc, type) => {
    acc[type.value] = type;
    return acc;
  },
  {} as Record<FieldType, { value: FieldType; label: string; icon: React.ReactNode }>,
);
