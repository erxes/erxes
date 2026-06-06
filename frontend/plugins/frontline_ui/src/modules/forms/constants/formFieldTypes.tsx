import {
  IconAt,
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconGenderBigender,
  IconListDetails,
  IconNumbers,
  IconPaperclip,
  IconPhoneSpark,
  IconTextScan2,
  IconTextSize,
  IconUserCircle,
} from '@tabler/icons-react';

export const FORM_FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: <IconTextSize /> },
  { value: 'number', label: 'Number', icon: <IconNumbers /> },
  { value: 'boolean', label: 'Checkbox', icon: <IconCheck /> },
  { value: 'date', label: 'Date', icon: <IconCalendarEvent /> },
  { value: 'select', label: 'Select', icon: <IconChevronDown /> },
  { value: 'textarea', label: 'Textarea', icon: <IconTextScan2 /> },
  { value: 'radio', label: 'Radio Group', icon: <IconCircleCheck /> },
  { value: 'check', label: 'Checkbox Group', icon: <IconListDetails /> },
  { value: 'file', label: 'Attachment', icon: <IconPaperclip /> },

  // Customer core fields
  { value: 'core:customer:avatar', label: 'Avatar', icon: <IconUserCircle /> },
  {
    value: 'core:customer:firstName',
    label: 'First Name',
    icon: <IconTextSize />,
  },
  {
    value: 'core:customer:middleName',
    label: 'Middle Name',
    icon: <IconTextSize />,
  },
  {
    value: 'core:customer:lastName',
    label: 'Last Name',
    icon: <IconTextSize />,
  },
  { value: 'core:customer:email', label: 'Email', icon: <IconAt /> },
  {
    value: 'core:customer:phone',
    label: 'Phone',
    icon: <IconPhoneSpark />,
  },
  {
    value: 'core:customer:description',
    label: 'Description',
    icon: <IconTextSize />,
  },
  { value: 'core:customer:sex', label: 'Gender', icon: <IconGenderBigender /> },
  {
    value: 'core:customer:birthDate',
    label: 'Birth date',
    icon: <IconCalendarEvent />,
  },
];

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export type FormGroupKey = 'basic' | 'core:customer';
export type GroupedFields = Record<FormGroupKey, FormFieldType[]>;

export interface FormGroupMetadata {
  label: string;
  description?: string;
}
