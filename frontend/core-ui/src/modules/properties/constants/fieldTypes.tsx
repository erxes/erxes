import {
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconChevronsDown,
  IconCircleCheck,
  IconFile,
  IconNumbers,
  IconRelationManyToMany,
  IconSquareCheck,
  IconTextScan2,
  IconTextSize
} from '@tabler/icons-react';

export const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: <IconTextSize /> },
  { value: 'textarea', label: 'Textarea', icon: <IconTextScan2 /> },
  { value: 'number', label: 'Number', icon: <IconNumbers /> },
  { value: 'boolean', label: 'True/False', icon: <IconCheck /> },
  { value: 'date', label: 'Date', icon: <IconCalendarEvent /> },
  { value: 'select', label: 'Select', icon: <IconChevronDown /> },
  { value: 'multiSelect', label: 'Multiple Select', icon: <IconChevronsDown /> },
  { value: 'check', label: 'Checkbox', icon: <IconSquareCheck /> },
  { value: 'radio', label: 'Radio Button', icon: <IconCircleCheck /> },
  { value: 'relation', label: 'Relation', icon: <IconRelationManyToMany /> },
  { value: 'file', label: 'File', icon: <IconFile /> },
];

export const FIELD_TYPES_OBJECT = FIELD_TYPES.reduce((acc, type) => {
  acc[type.value as keyof typeof acc] = type;
  return acc;
}, {} as Record<string, { value: string; label: string; icon: React.ReactNode }>);
