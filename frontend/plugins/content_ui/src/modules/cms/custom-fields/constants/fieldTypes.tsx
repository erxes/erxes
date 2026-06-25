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
  IconShoppingCart,
  IconSquareCheck,
  IconTable,
  IconTextScan2,
  IconTextSize,
} from '@tabler/icons-react';
import { ReactNode } from 'react';

import { FieldType } from '@/cms/custom-fields/types/customFieldTypes';

interface FieldTypeOption {
  value: FieldType;
  label: string;
  icon: ReactNode;
}

export const FIELD_TYPES: FieldTypeOption[] = [
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
  { value: 'products', label: 'Products', icon: <IconShoppingCart /> },
];

export const FIELD_TYPES_OBJECT = FIELD_TYPES.reduce<
  Record<FieldType, FieldTypeOption>
>((fieldTypes, fieldType) => {
  fieldTypes[fieldType.value] = fieldType;
  return fieldTypes;
}, {} as Record<FieldType, FieldTypeOption>);
