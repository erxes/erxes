import {
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconNumbers,
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
];

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];
