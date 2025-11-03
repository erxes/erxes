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
  formatSelection: (value: string) => string;
  // Controls how the popover renders for this type
  renderer?: 'command' | 'custom';
}

// Dynamic enabling config
export interface EnabledSuggestions
  extends Partial<
    Record<
      string,
      | boolean
      | {
          enabled: boolean;
          selectFieldName?: string;
          formatSelection?: (value: string) => string;
          options?: { label: string; value: string }[];
        }
    >
  > {}

export type EnabledSuggestionValue = EnabledSuggestions[string];

export type EnabledSuggestionObject = Extract<
  EnabledSuggestionValue,
  { enabled: boolean }
>;

type CustomRendererProps = {
  searchValue: string;
  onSelect: (value: string) => void;
  selectField: string;
};

export type PlaceholderInputProps = {
  propertyType?: string;
  value?: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  selectedField?: any;
  additionalAttributes?: any[];
  // Dynamic enablement API (preferred)
  variant?: 'fixed' | 'expression';
  enabled?: EnabledSuggestions;
  suggestionGroups?: string[];
  enableAll?: boolean;
  onChangeInputMode?: (mode: 'expression' | 'fixed') => void;
  // New controls
  hideModeToggle?: boolean;
  hideInfoPopover?: boolean;
  // Selection-only mode: restrict input to suggestions
  selectionMode?: 'single' | 'multi';
  selectionType?: SuggestionType; // which suggestion list to show when selection-only
  // Dynamic: add/override triggers and renderers
  extraSuggestionConfigs?: SuggestionConfig[];
  // Provide custom renderer components per type when renderer === 'custom'
  customRenderers?: Partial<
    Record<string, React.ComponentType<CustomRendererProps>>
  >;
  children?: React.ReactNode;
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
  selectionMode?: 'single' | 'multi';
  selectionPolicy?: 'single' | 'multi'; // alias for clarity
  selectionType?: SuggestionType;
  forcedSuggestionType?: SuggestionType; // alias for clarity
  value?: string;
  onChange?: (value: string) => void;
  // Dynamic suggestion configs: add or override trigger/type/format/renderer
  extraSuggestionConfigs?: SuggestionConfig[];
  // Custom renderers per type when renderer === 'custom'
  customRenderers?: Partial<Record<SuggestionType, React.ComponentType<any>>>;
  variant?: 'fixed' | 'expression';
};
