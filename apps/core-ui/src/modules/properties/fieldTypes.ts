import type { Field, FieldType } from '@erxes/core-contract';
import { FIELD_TYPE_FAMILIES, OPTION_FIELD_TYPES } from '@erxes/core-contract';
import {
  IconCalendarEvent,
  IconCheck,
  IconChevronDown,
  IconChevronsDown,
  IconCircleCheck,
  IconList,
  IconNumbers,
  IconPhone,
  IconSquareCheck,
  IconTextScan2,
  IconTextSize,
  type Icon,
} from '@tabler/icons-react';

/** The property types core supports, in old erxes's order, with its labels and icons. */
export const FIELD_TYPES: { value: FieldType; label: string; icon: Icon; i18nKey: string }[] = [
  { value: 'text', label: 'Text', icon: IconTextSize, i18nKey: 'text' },
  { value: 'textarea', label: 'Textarea', icon: IconTextScan2, i18nKey: 'textarea' },
  { value: 'list', label: 'String List', icon: IconList, i18nKey: 'list' },
  { value: 'number', label: 'Number', icon: IconNumbers, i18nKey: 'number' },
  { value: 'boolean', label: 'True/False', icon: IconCheck, i18nKey: 'boolean' },
  { value: 'date', label: 'Date', icon: IconCalendarEvent, i18nKey: 'date' },
  { value: 'select', label: 'Select', icon: IconChevronDown, i18nKey: 'select' },
  {
    value: 'multiselect',
    label: 'Multiple Select',
    icon: IconChevronsDown,
    i18nKey: 'multiSelect',
  },
  { value: 'check', label: 'Checkbox', icon: IconSquareCheck, i18nKey: 'check' },
  { value: 'radio', label: 'Radio Button', icon: IconCircleCheck, i18nKey: 'radio' },
  { value: 'phone', label: 'Phone', icon: IconPhone, i18nKey: 'phone' },
];

export const FIELD_TYPES_OBJECT = Object.fromEntries(
  FIELD_TYPES.map((type) => [type.value, type]),
) as Record<FieldType, (typeof FIELD_TYPES)[number]>;

export const FIELD_TYPE_ICONS = Object.fromEntries(
  FIELD_TYPES.map((type) => [type.value, type.icon]),
) as Record<Field['type'], Icon>;

export const FIELD_TYPE_LABELS = Object.fromEntries(
  FIELD_TYPES.map((type) => [type.value, type.label]),
) as Record<Field['type'], string>;

export const hasOptions = (type: FieldType | string) =>
  (OPTION_FIELD_TYPES as readonly string[]).includes(type);

/** Types a field holding values may change to (same stored value). */
export const getEditableTypes = (savedType: FieldType): FieldType[] => [
  ...(FIELD_TYPE_FAMILIES.find((family) => family.includes(savedType)) ?? [savedType]),
];
