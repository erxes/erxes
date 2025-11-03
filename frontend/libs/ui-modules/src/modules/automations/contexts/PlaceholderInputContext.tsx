import { createContext, useContext, type ReactNode } from 'react';
import type {
  EnabledSuggestionObject,
  SuggestionConfig,
  SuggestionType,
} from '../types/placeholderInputTypes';

interface PlaceholderInputContextValue {
  enabledTypes: Record<SuggestionType, boolean>;
  suggestionConfigs: SuggestionConfig[];
  inputVariant: 'expression' | 'fixed';
  suggestionTypeToTitlesMap: Record<SuggestionType, string>;
  suggestionTypeToFormatsMap: Record<SuggestionType, (value: string) => string>;
  suggestionTypeToRenderersMap: Record<SuggestionType, 'command' | 'custom'>;
  enabledSuggestionsConfigMap: Record<string, EnabledSuggestionObject>;
  customRenderers?: Partial<Record<SuggestionType, React.ComponentType<any>>>;
  onInputModeChange?: (mode: 'expression' | 'fixed') => void;
  isSelectionOnlyMode: boolean;
  selectionMode?: 'single' | 'multi';
  selectionType?: SuggestionType;
  suggestionType?: SuggestionType | null;
  value: string;
  onChange: (value: string) => void;
  showSuggestions: boolean;
  isSelectionPopoverOpen: boolean;
  insertSuggestion: (suggestion: string) => void;
  setIsSelectionPopoverOpen: (open: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

const PlaceholderInputContext = createContext<
  PlaceholderInputContextValue | undefined
>(undefined);

interface PlaceholderInputProviderProps {
  children: ReactNode;
  value: PlaceholderInputContextValue;
}

export function PlaceholderInputProvider({
  children,
  value,
}: PlaceholderInputProviderProps) {
  return (
    <PlaceholderInputContext.Provider value={value}>
      {children}
    </PlaceholderInputContext.Provider>
  );
}

export function usePlaceholderInputContext() {
  const context = useContext(PlaceholderInputContext);
  if (!context) {
    throw new Error(
      'usePlaceholderInputContext must be used within PlaceholderInputProvider',
    );
  }
  return context;
}
