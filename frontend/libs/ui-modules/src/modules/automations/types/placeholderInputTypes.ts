export type SuggestionType =
  | 'attribute'
  | 'option'
  | 'date'
  | 'emoji'
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
  type: string;
  trigger: string;
  title: string;
  // Returns the final string to insert when an item with `value` is selected
  // Controls how the popover renders for this type
  mode?: 'command' | 'custom';
  render?: (props: CustomRendererProps) => React.ReactNode;
  options?: SuggestionsOption;
}

// Dynamic enabling config
export interface EnabledSuggestions extends Partial<Record<string, boolean>> {}

type CustomRendererProps = {
  searchValue: string;
  onSelect: (value: string) => void;
  selectField: string;
};

export type SuggestionsOption = {
  selectFieldName?: string;
  formatSelection?: (value: string) => string;
  options?: { label: string; value: string }[];
  attributeTypes?: string[];
  additionalAttributes?: any[];
  attributesConfig?: any;
};

export type PlaceholderInputProps = {
  propertyType?: string;
  value?: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  // Dynamic enablement API (preferred)
  variant?: 'fixed' | 'expression';
  enabled?: EnabledSuggestions;
  suggestionGroups?: string[];
  suggestionsOptions?: Partial<Record<string, SuggestionsOption>>;
  enableAll?: boolean;
  onChangeInputMode?: (mode: 'expression' | 'fixed') => void;
  // Selection-only mode: restrict input to suggestions
  selectionType?: SuggestionType; // which suggestion list to show when selection-only
  // Dynamic: add/override triggers and renderers
  extraSuggestionConfigs?: SuggestionConfig[];
  // Popover positioning
  popoverPosition?: 'left' | 'right' | 'top' | 'bottom';
  children?: React.ReactNode;
  // Unified behavior configuration for composing tokens and typing rules
  placeholderConfig?: {
    // How many tokens are allowed to be selected/inserted
    selectMode?: 'one' | 'many';
    // Delimiter for many tokens
    delimiter?: string;
    // Wrap a single selected token before insertion
    wrap?: (text: string) => string;
    // If true, when suggestions are not open, only trigger characters are allowed to be typed
    allowOnlyTriggers?: boolean;
  };
};

export type UsePlaceHolderInputProps = {
  // New dynamic configuration: supply explicit per-type enables
  enabled?: EnabledSuggestions;
  // Optional suggestionGroups to toggle in bulk: e.g., ['common'], ['calls'], ['all']
  suggestionGroups?: string[];
  // Backward-compat toggles; prefer using `enabled` or `suggestionGroups`
  enableAll?: boolean;
  ref: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>;
  onChangeInputMode?: (mode: 'expression' | 'fixed') => void;
  // selection-only controls
  selectionType?: SuggestionType;
  suggestionsOptions?: Partial<Record<string, SuggestionsOption>>;

  value?: string;
  onChange?: (value: string) => void;
  // Dynamic suggestion configs: add or override trigger/type/format/mode
  extraSuggestionConfigs?: SuggestionConfig[];
  // Custom renderers per type when mode === 'custom'
  variant?: 'fixed' | 'expression';
  // Unified behavior configuration for composing tokens and typing rules
  placeholderConfig?: {
    selectMode?: 'one' | 'many';
    delimiter?: string;
    // Wrap whole composed value: either via prefix/suffix or a function
    wrapPrefix?: string;
    wrapSuffix?: string;
    wrap?: (text: string) => string;
    allowOnlyTriggers?: boolean;
  };
};
