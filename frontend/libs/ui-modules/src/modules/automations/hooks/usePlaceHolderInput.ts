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
  selectionMode,
  selectionPolicy,
  selectionType,
  forcedSuggestionType,
  value = '',
  onChange,
  extraSuggestionConfigs = [],
  customRenderers,
}: UsePlaceHolderInputProps) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [inputVariant, setInputVariant] = useState<'expression' | 'fixed'>(
    variant,
  );

  const {
    suggestionConfigs,
    suggestionTriggerTypesMap,
    suggestionTypeToTitlesMap,
    suggestionTypeToFormatsMap,
    suggestionTypeToRenderersMap,
  } = useSuggestionMaps(extraSuggestionConfigs);

  const { enabledTypes, enabledSuggestionsConfigMap } =
    usePlaceholderEnabledTypes({
      enabled,
      suggestionGroups,
      enableAll,
      customRenderers,
    });
  const {
    isSelectionOnlyMode,
    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    handleInputFocus,
    handleInputBlur,
    handleSelectionOnlyKeyPress,
    suggestionPopoverRef,
  } = useSelectionOnlyHandlers({
    selectionMode,
    selectionPolicy,
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
    if (isSelectionOnlyMode) return;
    onChange && onChange(next);
  };

  return {
    inputRef,
    inputVariant,
    enabledTypes,
    suggestionConfigs,
    suggestionTriggerTypesMap,
    suggestionTypeToTitlesMap,
    suggestionTypeToFormatsMap,
    suggestionTypeToRenderersMap,
    enabledSuggestionsConfigMap,
    customRenderers,
    isSelectionOnlyMode,
    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    setInputVariant,
    setInputRef,
    handleInputModeChange,
    // selection-only api
    selectionMode,
    selectionPolicy,
    selectionType: forcedSuggestionType || selectionType,
    handleInputValueChange,
    handleInputFocus,
    handleInputBlur,
    handleSelectionOnlyKeyPress,
    suggestionPopoverRef,
  };
};
