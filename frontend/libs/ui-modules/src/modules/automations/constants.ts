export type SuggestionType =
  | 'attribute'
  | 'option'
  | 'date'
  | 'emoji'
  | 'command'
  | 'call_user'
  | 'call_tag'
  | 'call_product'
  | 'call_company'
  | 'call_customer';

export interface SuggestionItem {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface SuggestionConfig {
  type: SuggestionType;
  trigger: string;
  title: string;
  // Returns the final string to insert when an item with `value` is selected
  formatSelection: (value: string) => string;
  // Controls how the popover renders for this type
  renderer?: 'command' | 'custom';
}

// Dynamic enabling config
export interface EnabledSuggestions
  extends Partial<Record<SuggestionType, boolean>> {}

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
  command: false,
  call_user: false,
  call_tag: false,
  call_product: false,
  call_company: false,
  call_customer: false,
};

export const DATE_OPTIONS: SuggestionItem[] = [
  { id: '1', label: 'Today', value: '{{today}}' },
  { id: '2', label: 'Tomorrow', value: '{{tomorrow}}' },
  { id: '3', label: 'Current time', value: '{{current_time}}' },
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
    formatSelection: (value) => `@${value}`,
    renderer: 'command',
  },
  {
    type: 'call_tag',
    trigger: '#',
    title: 'Tag Mention',
    formatSelection: (value) => `#${value}`,
    renderer: 'command',
  },
  {
    type: 'call_product',
    trigger: '$',
    title: 'Product Mention',
    formatSelection: (value) => `$${value}`,
    renderer: 'command',
  },
  {
    type: 'call_company',
    trigger: '%',
    title: 'Company Mention',
    formatSelection: (value) => `%${value}`,
    renderer: 'command',
  },
  {
    type: 'call_customer',
    trigger: '&',
    title: 'Customer Mention',
    formatSelection: (value) => `&${value}`,
    renderer: 'command',
  },
];

// Backward-compatible static export expected by some components
export const SUGGESTION_CONFIGS: SuggestionConfig[] =
  DEFAULT_SUGGESTION_CONFIGS;

// Derived maps for convenient lookup
export function buildSuggestionMaps(extra: SuggestionConfig[] = []) {
  const configs = [...DEFAULT_SUGGESTION_CONFIGS, ...extra];
  const triggerToType = configs.reduce((acc, cfg) => {
    acc[cfg.trigger] = cfg.type;
    return acc;
  }, {} as Record<string, SuggestionType>);

  const typeToTitle = configs.reduce((acc, cfg) => {
    acc[cfg.type] = cfg.title;
    return acc;
  }, {} as Record<SuggestionType, string>);

  const typeToFormat = configs.reduce((acc, cfg) => {
    acc[cfg.type] = cfg.formatSelection;
    return acc;
  }, {} as Record<SuggestionType, (value: string) => string>);

  const typeToRenderer = configs.reduce((acc, cfg) => {
    acc[cfg.type] = (cfg.renderer || 'command') as 'command' | 'custom';
    return acc;
  }, {} as Record<SuggestionType, 'command' | 'custom'>);

  return { configs, triggerToType, typeToTitle, typeToFormat, typeToRenderer };
}

// Backward-compatible static maps (built from defaults only)
export const TRIGGER_TO_TYPE = buildSuggestionMaps().triggerToType;
export const TYPE_TO_TITLE = buildSuggestionMaps().typeToTitle;
export const TYPE_TO_FORMAT = buildSuggestionMaps().typeToFormat;
export const TYPE_TO_RENDERER = buildSuggestionMaps().typeToRenderer;
