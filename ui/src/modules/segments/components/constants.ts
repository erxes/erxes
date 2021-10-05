export const PROPERTY_TYPES = {
  deal: [
    { label: 'Deal', value: 'deal' },
    { label: 'Contact', value: 'customer' }
  ],

  customer: [
    { label: 'Contact', value: 'customer' },
    { label: 'Company', value: 'company' },
    { label: 'Deal', value: 'deal' },
    { label: 'Task', value: 'task' },
    { label: 'Ticket', value: 'ticket' },
    { label: 'Conversation', value: 'conversation' },
    { label: 'Form Submission', value: 'form_submission' }
  ],

  company: [
    { label: 'Company', value: 'company' },
    { label: 'Deal', value: 'deal' },
    { label: 'Task', value: 'task' },
    { label: 'Ticket', value: 'ticket' }
  ],

  conversation: [{ label: 'Conversation', value: 'conversation' }],
  user: [{ label: 'User', value: 'user' }],

  lead: [
    { label: 'Lead', value: 'lead' },
    { label: 'Company', value: 'company' },
    { label: 'Deal', value: 'deal' },
    { label: 'Task', value: 'task' },
    { label: 'Ticket', value: 'ticket' },
    { label: 'Conversation', value: 'conversation' },
    { label: 'Form Submission', value: 'form_submission' }
  ],

  visitor: [
    { label: 'Visitor', value: 'visitor' },
    { label: 'Company', value: 'company' },
    { label: 'Deal', value: 'deal' },
    { label: 'Task', value: 'task' },
    { label: 'Ticket', value: 'ticket' },
    { label: 'Conversation', value: 'conversation' },
    { label: 'Form Submission', value: 'form_submission' }
  ],
  task: [{ label: 'task', value: 'task' }],
  ticket: [{ label: 'ticket', value: 'ticket' }]
};

export const OPERATORS = {
  string: [
    { name: 'equals to', value: 'e' },
    { name: 'is not equal to', value: 'dne' },
    { name: 'contains with', value: 'c' },
    { name: 'does not contain with', value: 'dnc' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  boolean: [
    { name: 'is true', value: 'it', noInput: true },
    { name: 'is false', value: 'if', noInput: true },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  number: [
    { name: 'number: equals to', value: 'numbere' },
    { name: 'number: is not equal to', value: 'numberdne' },
    { name: 'number: is greater than', value: 'numberigt' },
    { name: 'number: is less than', value: 'numberilt' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ],
  date: [
    { name: 'date: is greater than', value: 'dateigt' },
    { name: 'date: is less than', value: 'dateilt' },
    { name: 'minute(s) before', value: 'wobm' },
    { name: 'minute(s) later', value: 'woam' },
    { name: 'day(s) before', value: 'wobd' },
    { name: 'day(s) later', value: 'woad' },
    { name: 'date relative less than', value: 'drlt' },
    { name: 'date relative greater than', value: 'drgt' },
    { name: 'is set', value: 'is', noInput: true },
    { name: 'is not set', value: 'ins', noInput: true }
  ]
};

export const DEFAULT_OPERATORS = [
  ...OPERATORS.string,
  ...OPERATORS.boolean,
  ...OPERATORS.number,
  ...OPERATORS.date
];

export const EVENT_OCCURENCES = [
  { name: 'exactly', value: 'exactly' },
  { name: 'atleast', value: 'atleast' },
  { name: 'atmost', value: 'atmost' }
];
