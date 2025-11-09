import { useRef, useState } from 'react';
import { UsePlaceHolderInputProps } from '../types/placeholderInputTypes';
import { usePlaceholderEnabledTypes } from './usePlaceholderEnabledTypes';
import { useSelectionOnlyHandlers } from './useSelectionOnlyHandlers';
import { useSuggestionMaps } from './useSuggestionMaps';

export const usePlaceHolderInput = ({
  variant = 'fixed',
  enabled,
  suggestionGroups,
  enableAll = false,
  ref,
  onChangeInputMode,
  selectionType,
  suggestionsOptions,
  value = '',
  onChange,
  extraSuggestionConfigs = [],
}: UsePlaceHolderInputProps) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [inputVariant, setInputVariant] = useState<'expression' | 'fixed'>(
    variant,
  );

  const { enabledTypes } = usePlaceholderEnabledTypes({
    enabled,
    suggestionGroups,
    enableAll,
    extraSuggestionConfigs,
  });

  const { suggestions, suggestionTypeMap, suggestionTypeByTriggerMap } =
    useSuggestionMaps(enabledTypes, extraSuggestionConfigs, suggestionsOptions);
  const {
    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    handleInputFocus,
    handleInputBlur,
    handleSelectionOnlyKeyPress,
    suggestionPopoverRef,
  } = useSelectionOnlyHandlers({
    value,
    onChange,
  });

  const setInputRef = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
    (
      inputRef as React.MutableRefObject<
        HTMLInputElement | HTMLTextAreaElement | null
      >
    ).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (
        ref as React.MutableRefObject<
          HTMLInputElement | HTMLTextAreaElement | null
        >
      ).current = node;
    }
  };

  const handleInputModeChange = (mode: 'expression' | 'fixed') => {
    setInputVariant(mode);
    if (onChangeInputMode) {
      onChangeInputMode(mode);
    }
  };

  const handleInputValueChange = (next: string) => {
    onChange && onChange(next);
  };

  return {
    inputRef,
    inputVariant,
    enabledTypes,
    suggestions,

    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    setInputVariant,
    setInputRef,
    handleInputModeChange,
    selectionType,
    handleInputValueChange,
    handleInputFocus,
    handleInputBlur,
    handleSelectionOnlyKeyPress,
    suggestionPopoverRef,
    suggestionTypeMap,
    suggestionTypeByTriggerMap,
  };
};
