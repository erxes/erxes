export const DATA_MODEL_FIELD_PRESETS = [
  {
    label: 'Status',
    type: 'select',
    options: ['Not started', 'In progress', 'Done'],
  },
  {
    label: 'Priority',
    type: 'select',
    options: ['Low', 'Normal', 'High', 'Urgent'],
  },
  { label: 'Due date', type: 'date', options: [] },
  { label: 'Notes', type: 'textarea', options: [] },
] as const;

export const FIELD_TYPE_DESCRIPTIONS: Record<string, string> = {
  text: 'Names, codes and short answers',
  textarea: 'Notes and longer descriptions',
  number: 'Amounts, scores and quantities',
  boolean: 'A yes or no answer',
  date: 'Choose a date and time',
  phone: 'A contact phone number',
  list: 'Several free-form text values',
  select: 'Choose one from your options',
  multiSelect: 'Choose several from your options',
  relation: 'Select existing records from another object',
};
