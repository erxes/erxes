import type { FieldType } from '@erxes/core-contract';
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
import { oneOf } from '~/lib/text';

/** The property types core supports, with their labels and icons, in menu order. */
export const FIELD_TYPES_OBJECT: Record<
  FieldType,
  { value: FieldType; label: string; icon: Icon; i18nKey: string }
> = {
  text: { value: 'text', label: 'Text', icon: IconTextSize, i18nKey: 'text' },
  textarea: { value: 'textarea', label: 'Textarea', icon: IconTextScan2, i18nKey: 'textarea' },
  list: { value: 'list', label: 'String List', icon: IconList, i18nKey: 'list' },
  number: { value: 'number', label: 'Number', icon: IconNumbers, i18nKey: 'number' },
  boolean: { value: 'boolean', label: 'True/False', icon: IconCheck, i18nKey: 'boolean' },
  date: { value: 'date', label: 'Date', icon: IconCalendarEvent, i18nKey: 'date' },
  select: { value: 'select', label: 'Select', icon: IconChevronDown, i18nKey: 'select' },
  multiselect: {
    value: 'multiselect',
    label: 'Multiple Select',
    icon: IconChevronsDown,
    i18nKey: 'multiSelect',
  },
  check: { value: 'check', label: 'Checkbox', icon: IconSquareCheck, i18nKey: 'check' },
  radio: { value: 'radio', label: 'Radio Button', icon: IconCircleCheck, i18nKey: 'radio' },
  phone: { value: 'phone', label: 'Phone', icon: IconPhone, i18nKey: 'phone' },
};

export const FIELD_TYPES = Object.values(FIELD_TYPES_OBJECT);

export const hasOptions = (type: string) => oneOf(OPTION_FIELD_TYPES, type) !== undefined;

/** Types a field holding values may change to (same stored value). */
export const getEditableTypes = (savedType: FieldType): FieldType[] => [
  ...(FIELD_TYPE_FAMILIES.find((family) => family.includes(savedType)) ?? [savedType]),
];
