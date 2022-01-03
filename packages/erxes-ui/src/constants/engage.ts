
const stringTypeChoices = [
  { value: '', text: '' },
  { value: 'is', text: 'is' },
  { value: 'isNot', text: 'is not' },
  { value: 'startsWith', text: 'starts with' },
  { value: 'endsWith', text: 'ends with' },
  { value: 'contains', text: 'contains' },
  { value: 'doesNotContain', text: 'does not contain' },
  { value: 'isUnknown', text: 'is unknown' },
  { value: 'hasAnyValue', text: 'has any value' }
];

const numberTypeChoices = [
  { value: '', text: '' },
  { value: 'greaterThan', text: 'Greater than' },
  { value: 'lessThan', text: 'Less than' },
  { value: 'is', text: 'is' },
  { value: 'isNot', text: 'is not' },
  { value: 'isUnknown', text: 'is unknown' },
  { value: 'hasAnyValue', text: 'has any value' }
];

export const RULE_CONDITIONS = {
  browserLanguage: stringTypeChoices,
  currentPageUrl: stringTypeChoices,
  country: stringTypeChoices,
  city: stringTypeChoices,
  numberOfVisits: numberTypeChoices
};

export const VISITOR_AUDIENCE_RULES = [
  { value: '', text: '' },
  { value: 'browserLanguage', text: 'Browser language' },
  { value: 'currentPageUrl', text: 'Current page url' },
  { value: 'country', text: 'Country' },
  { value: 'city', text: 'City' },
  { value: 'numberOfVisits', text: 'Number of visits' }
];
