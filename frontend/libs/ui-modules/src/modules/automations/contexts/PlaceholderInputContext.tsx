import { createContext, useContext, type ReactNode } from 'react';
import type { SuggestionConfig } from '../types/placeholderInputTypes';

interface PlaceholderInputContextValue {
  enabledTypes: Record<string, boolean>;
  suggestions: SuggestionConfig[];
  inputVariant: 'expression' | 'fixed';
  suggestionTypeMap: Map<string, SuggestionConfig>;
  suggestionTypeByTriggerMap: Map<string, SuggestionConfig>;
  onInputModeChange?: (mode: 'expression' | 'fixed') => void;
  selectionType?: string;
  suggestionType?: string | null;
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
