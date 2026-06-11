import { OperatorOption } from '../types/fieldsTypes';

const TEXT_OPERATORS: OperatorOption[] = [
  { value: 'contains', label: 'Contains' },
  { value: 'doesNotContain', label: 'Does not contain' },
  { value: 'eq', label: 'Is equal to' },
  { value: 'ne', label: 'Is not equal to' },
  { value: 'isSet', label: 'Is set', noValue: true },
  { value: 'isNotSet', label: 'Is not set', noValue: true },
];

const NUMBER_OPERATORS: OperatorOption[] = [
  { value: 'eq', label: 'Is equal to' },
  { value: 'ne', label: 'Is not equal to' },
  { value: 'gt', label: 'Greater than' },
  { value: 'gte', label: 'Greater than or equal' },
  { value: 'lt', label: 'Less than' },
  { value: 'lte', label: 'Less than or equal' },
  { value: 'isSet', label: 'Is set', noValue: true },
  { value: 'isNotSet', label: 'Is not set', noValue: true },
];

const DATE_OPERATORS: OperatorOption[] = [
  { value: 'eq', label: 'On' },
  { value: 'gt', label: 'After' },
  { value: 'lt', label: 'Before' },
  { value: 'gte', label: 'On or after' },
  { value: 'lte', label: 'On or before' },
  { value: 'isSet', label: 'Is set', noValue: true },
  { value: 'isNotSet', label: 'Is not set', noValue: true },
];

const BOOLEAN_OPERATORS: OperatorOption[] = [
  { value: 'isTrue', label: 'Is true', noValue: true },
  { value: 'isFalse', label: 'Is false', noValue: true },
];

const OPTION_OPERATORS: OperatorOption[] = [
  { value: 'in', label: 'Is any of' },
  { value: 'notIn', label: 'Is none of' },
  { value: 'isSet', label: 'Is set', noValue: true },
  { value: 'isNotSet', label: 'Is not set', noValue: true },
];

const RELATION_OPERATORS: OperatorOption[] = [
  { value: 'in', label: 'Is any of' },
  { value: 'notIn', label: 'Is none of' },
  { value: 'isSet', label: 'Is set', noValue: true },
  { value: 'isNotSet', label: 'Is not set', noValue: true },
];

const FILE_OPERATORS: OperatorOption[] = [
  { value: 'isSet', label: 'Has file', noValue: true },
  { value: 'isNotSet', label: 'No file', noValue: true },
  { value: 'fileType', label: 'File type is' },
];

export const OPERATOR_BY_TYPE: Record<string, OperatorOption[]> = {
  text: TEXT_OPERATORS,
  textarea: TEXT_OPERATORS,
  phone: TEXT_OPERATORS,
  number: NUMBER_OPERATORS,
  date: DATE_OPERATORS,
  boolean: BOOLEAN_OPERATORS,
  select: OPTION_OPERATORS,
  radio: OPTION_OPERATORS,
  check: OPTION_OPERATORS,
  multiSelect: OPTION_OPERATORS,
  relation: RELATION_OPERATORS,
  file: FILE_OPERATORS,
};
