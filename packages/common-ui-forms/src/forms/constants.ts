const stringTypeChoices = [
  { value: '', label: '' },
  { value: 'is', label: 'is' },
  { value: 'isNot', label: 'is not' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
  { value: 'contains', label: 'contains' },
  { value: 'doesNotContain', label: 'does not contain' },
  { value: 'isUnknown', label: 'is unknown' },
  { value: 'hasAnyValue', label: 'has any value' }
];

const numberTypeChoices = [
  { value: '', label: '' },
  { value: 'greaterThan', label: 'greater than' },
  { value: 'lessThan', label: 'less than' },
  { value: 'is', label: 'equal' },
  { value: 'isNot', label: 'not equal' },
  { value: 'isUnknown', label: 'is unknown' },
  { value: 'hasAnyValue', label: 'has any value' }
];

const dateTypeChoices = [
  { value: '', label: '' },
  { value: 'dateGreaterThan', label: 'Greater than' },
  { value: 'dateLessThan', label: 'Less than' }
];

export { numberTypeChoices, stringTypeChoices, dateTypeChoices };
