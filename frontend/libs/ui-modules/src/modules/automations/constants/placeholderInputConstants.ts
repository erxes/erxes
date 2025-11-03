import {
  EnabledSuggestions,
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

export const DEFAULT_ENABLED_SUGGESTIONS: EnabledSuggestions = {
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
  { id: '1', label: 'Today', value: '{{ today }}' },
  { id: '2', label: 'Tomorrow', value: '{{ tomorrow }}' },
  { id: '3', label: 'Current time', value: '{{ current_time }}' },
];

// Single source of truth for suggestion config
export const DEFAULT_SUGGESTION_CONFIGS: SuggestionConfig[] = [
  {
    type: 'attribute',
    trigger: '{',
    title: 'Attributes',
    formatSelection: (value) => `{{ ${value} }}`,
    renderer: 'command',
  },
  {
    type: 'option',
    trigger: '[',
    title: 'Options',
    formatSelection: (value) => `[[ ${value} ]]`,
    renderer: 'command',
  },
  {
    type: 'date',
    trigger: '/',
    title: 'Date',
    formatSelection: (value) => value,
    renderer: 'command',
  },
  {
    type: 'emoji',
    trigger: ':',
    title: 'Emoji',
    formatSelection: (value) => value,
    renderer: 'custom',
  },
  {
    type: 'call_user',
    trigger: '@',
    title: 'User Mention',
    formatSelection: (value) => `[[ user.${value} ]]`,
    renderer: 'command',
  },
  {
    type: 'call_tag',
    trigger: '#',
    title: 'Tag Mention',
    formatSelection: (value) => `[[ tag.${value} ]]`,
    renderer: 'command',
  },
  {
    type: 'call_product',
    trigger: '$',
    title: 'Product Mention',
    formatSelection: (value) => `[[ product.${value} ]]`,
    renderer: 'command',
  },
  {
    type: 'call_company',
    trigger: '%',
    title: 'Company Mention',
    formatSelection: (value) => `[[ company.${value} ]]`,
    renderer: 'command',
  },
  {
    type: 'call_customer',
    trigger: '&',
    title: 'Customer Mention',
    formatSelection: (value) => `[[ customer.${value} ]]`,
    renderer: 'command',
  },
];
