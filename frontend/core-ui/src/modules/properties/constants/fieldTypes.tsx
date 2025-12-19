import {
  IconCalendarEvent,
  IconCheck,
  IconFile,
  IconNumbers,
  IconRelationManyToMany,
  IconTag,
  IconTextSize,
} from '@tabler/icons-react';

export const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: <IconTextSize /> },
  { value: 'number', label: 'Number', icon: <IconNumbers /> },
  { value: 'boolean', label: 'True/False', icon: <IconCheck /> },
  { value: 'date', label: 'Date', icon: <IconCalendarEvent /> },
  { value: 'select', label: 'Select', icon: <IconTag /> },
  { value: 'relation', label: 'Relation', icon: <IconRelationManyToMany /> },
  { value: 'file', label: 'File', icon: <IconFile /> },
];

export const FIELD_TYPES_OBJECT = FIELD_TYPES.reduce((acc, type) => {
  acc[type.value as keyof typeof acc] = type;
  return acc;
}, {} as Record<string, { value: string; label: string; icon: React.ReactNode }>);
