import {
  SuggestionConfig,
  SuggestionItem,
  SuggestionType,
} from '../types/placeholderInputTypes';

// Group definitions to toggle multiple types at once
export const SUGGESTION_GROUPS: Record<string, SuggestionType[]> = {
  common: ['attribute', 'emoji', 'date'],
  options: ['option'],
  calls: [
    'call_user',
    'call_tag',
    'call_product',
    'call_company',
    'call_customer',
  ],
  all: [
    'attribute',
    'emoji',
    'date',
    'option',
    'call_user',
    'call_tag',
    'call_product',
    'call_company',
    'call_customer',
  ],
  none: [],
};

export const DEFAULT_ENABLED_SUGGESTIONS = {
  attribute: true,
  emoji: true,
  date: true,
  option: false,
  call_user: false,
  call_tag: false,
  call_product: false,
  call_company: false,
  call_customer: false,
};

export const DATE_OPTIONS: SuggestionItem[] = [
  { id: '4', label: 'Now', value: '{{ now }}' },
  { id: '5', label: 'Tomorrow', value: '{{ tomorrow }}' },
  { id: '6', label: 'Next week', value: '{{ nextWeek }}' },
  { id: '7', label: 'Next month', value: '{{ nextMonth }}' },
];

// Single source of truth for suggestion config
export const DEFAULT_SUGGESTION_CONFIGS: SuggestionConfig[] = [
  {
    type: 'attribute',
    trigger: '{',
    title: 'Attributes',
    options: {
      formatSelection: (value) => `{{ ${value} }}`,
    },
    mode: 'command',
  },
  {
    type: 'option',
    trigger: '[',
    title: 'Options',
    options: {
      formatSelection: (value) => `[[ ${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: 'date',
    trigger: '/',
    title: 'Date',
    mode: 'command',
  },
  {
    type: 'emoji',
    trigger: ':',
    title: 'Emoji',
    mode: 'custom',
  },
  {
    type: 'call_user',
    trigger: '@',
    title: 'User Mention',
    options: {
      formatSelection: (value) => `[[ user.${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: 'call_tag',
    trigger: '#',
    title: 'Tag Mention',
    options: {
      formatSelection: (value) => `[[ tag.${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: 'call_product',
    trigger: '$',
    title: 'Product Mention',
    options: {
      formatSelection: (value) => `[[ product.${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: 'call_company',
    trigger: '%',
    title: 'Company Mention',
    options: {
      formatSelection: (value) => `[[ company.${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: 'call_customer',
    trigger: '&',
    title: 'Customer Mention',
    options: {
      formatSelection: (value) => `[[ customer.${value} ]]`,
    },
    mode: 'command',
  },
];
