export enum TPlaceholderInputSuggestion {
  Attribute = 'attribute',
  Emoji = 'emoji',
  Date = 'date',
  Option = 'option',
  CallUser = 'call_user',
  CallTag = 'call_tag',
  CallProduct = 'call_product',
  CallCompany = 'call_company',
  CallCustomer = 'call_customer',
}
export type TPlaceholderInputSuggestions = `${TPlaceholderInputSuggestion}`;

export type TPlaceholderInputSuggestionType =
  | TPlaceholderInputSuggestion.Attribute
  | TPlaceholderInputSuggestion.Option
  | TPlaceholderInputSuggestion.Date
  | TPlaceholderInputSuggestion.Emoji
  | TPlaceholderInputSuggestion.CallUser
  | TPlaceholderInputSuggestion.CallTag
  | TPlaceholderInputSuggestion.CallProduct
  | TPlaceholderInputSuggestion.CallCustomer
  | TPlaceholderInputSuggestion.CallCompany;

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
  options?: TPlaceholderInputSuggestionsOption;
}

export type EnabledSuggestions = readonly TPlaceholderInputSuggestionType[];

export type DisabledSuggestions = readonly TPlaceholderInputSuggestionType[];

type CustomRendererProps = {
  searchValue: string;
  onSelect: (value: string) => void;
  selectField: string;
};

export type TPlaceholderInputSuggestionsOption = {
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
  suggestionsOptions?: Partial<
    Record<TPlaceholderInputSuggestions, TPlaceholderInputSuggestionsOption>
  >;
  enableAll?: boolean;
  // Selection-only mode: restrict input to suggestions
  selectionType?: TPlaceholderInputSuggestionType;
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
