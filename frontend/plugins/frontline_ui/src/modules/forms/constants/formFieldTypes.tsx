import {
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconCircleCheck,
  IconNumbers,
  IconSquareCheck,
  IconTextScan2,
  IconTextSize,
} from '@tabler/icons-react';

export const FORM_FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: <IconTextSize /> },
  { value: 'number', label: 'Number', icon: <IconNumbers /> },
  { value: 'boolean', label: 'Checkbox', icon: <IconCheck /> },
  { value: 'date', label: 'Date', icon: <IconCalendarEvent /> },
  { value: 'select', label: 'Select', icon: <IconChevronDown /> },
  { value: 'textarea', label: 'Textarea', icon: <IconTextScan2 /> },
  { value: 'check', label: 'Checkbox', icon: <IconSquareCheck /> },
  { value: 'radio', label: 'Radio Button', icon: <IconCircleCheck /> },
];

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];
