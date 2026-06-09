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

export interface DisabledSuggestions extends Partial<Record<string, boolean>> {}

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

type InputMode = 'expression' | 'fixed';

type PlaceholderBehaviorConfig = {
  // How many tokens are allowed to be selected/inserted
  selectMode?: 'one' | 'many';
  // Delimiter for many tokens
  delimiter?: string;
  // Wrap selected/composed text before insertion
  wrap?: (text: string) => string;
  // If true, when suggestions are not open, only trigger characters are allowed to be typed
  allowOnlyTriggers?: boolean;
};

type PlaceholderSuggestionProps = {
  // Dynamic enablement API (preferred)
  enabled?: EnabledSuggestions;
  disabled?: DisabledSuggestions;
  suggestionGroups?: string[];
  suggestionsOptions?: Partial<Record<string, SuggestionsOption>>;
  enableAll?: boolean;
  // Selection-only mode: restrict input to suggestions
  selectionType?: SuggestionType;
  // Dynamic: add/override triggers and renderers
  extraSuggestionConfigs?: SuggestionConfig[];
};

type PlaceholderModeProps = {
  variant?: InputMode;
  isExpression?: boolean;
  onChangeInputMode?: (mode: InputMode) => void;
};

type CommonPlaceholderInputProps = PlaceholderSuggestionProps &
  PlaceholderModeProps & {
    value?: string;
    onChange?: (value: string) => void;
    // Unified behavior configuration for composing tokens and typing rules
    placeholderConfig?: PlaceholderBehaviorConfig;
  };

export type PlaceholderInputProps = Omit<
  CommonPlaceholderInputProps,
  'onChange'
> & {
  propertyType?: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  // Popover positioning
  popoverPosition?: 'left' | 'right' | 'top' | 'bottom';
  children?: React.ReactNode;
};

export type UsePlaceHolderInputProps = CommonPlaceholderInputProps & {
  ref: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>;
  // Unified behavior configuration for composing tokens and typing rules
  placeholderConfig?: PlaceholderBehaviorConfig & {
    // Wrap whole composed value with prefix/suffix
    wrapPrefix?: string;
    wrapSuffix?: string;
  };
};
