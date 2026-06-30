import {
  SuggestionConfig,
  SuggestionItem,
  TPlaceholderInputSuggestionType,
  TPlaceholderInputSuggestion,
} from '../types/placeholderInputTypes';

// Group definitions to toggle multiple types at once
export const SUGGESTION_GROUPS: Record<
  string,
  TPlaceholderInputSuggestionType[]
> = {
  common: [
    TPlaceholderInputSuggestion.Attribute,
    TPlaceholderInputSuggestion.Emoji,
    TPlaceholderInputSuggestion.Date,
  ],
  options: [TPlaceholderInputSuggestion.Option],
  calls: [
    TPlaceholderInputSuggestion.CallUser,
    TPlaceholderInputSuggestion.CallTag,
    TPlaceholderInputSuggestion.CallProduct,
    TPlaceholderInputSuggestion.CallCompany,
    TPlaceholderInputSuggestion.CallCustomer,
  ],
  all: Object.values(TPlaceholderInputSuggestion),
  none: [],
};

export const DEFAULT_ENABLED_SUGGESTIONS = {
  attribute: false,
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
    type: TPlaceholderInputSuggestion.Attribute,
    trigger: '{',
    title: 'Attributes',
    options: {
      formatSelection: (value) => `{{ ${value} }}`,
    },
    mode: 'command',
  },
  {
    type: TPlaceholderInputSuggestion.Option,
    trigger: '[',
    title: 'Options',
    options: {
      formatSelection: (value) => `[[ ${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: TPlaceholderInputSuggestion.Date,
    trigger: '/',
    title: 'Date',
    mode: 'command',
  },
  {
    type: TPlaceholderInputSuggestion.Emoji,
    trigger: ':',
    title: 'Emoji',
    mode: 'custom',
  },
  {
    type: TPlaceholderInputSuggestion.CallUser,
    trigger: '@',
    title: 'User Mention',
    options: {
      formatSelection: (value) => `[[ user.${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: TPlaceholderInputSuggestion.CallTag,
    trigger: '#',
    title: 'Tag Mention',
    options: {
      formatSelection: (value) => `[[ tag.${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: TPlaceholderInputSuggestion.CallProduct,
    trigger: '$',
    title: 'Product Mention',
    options: {
      formatSelection: (value) => `[[ product.${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: TPlaceholderInputSuggestion.CallCompany,
    trigger: '%',
    title: 'Company Mention',
    options: {
      formatSelection: (value) => `[[ company.${value} ]]`,
    },
    mode: 'command',
  },
  {
    type: TPlaceholderInputSuggestion.CallCustomer,
    trigger: '&',
    title: 'Customer Mention',
    options: {
      formatSelection: (value) => `[[ customer.${value} ]]`,
    },
    mode: 'command',
  },
];
