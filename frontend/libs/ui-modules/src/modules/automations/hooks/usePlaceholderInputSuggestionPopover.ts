import { useEffect, useMemo, useRef, useState } from 'react';
import { usePlaceholderInputContext } from '../contexts/PlaceholderInputContext';
import { SuggestionType } from '../types/placeholderInputTypes';

export const usePlaceholderInputSuggestionPopover = ({
  popoverRef,
  searchQuery,
  onClose,
}: {
  popoverRef?: React.MutableRefObject<HTMLDivElement | null>;
  searchQuery: string;
  onClose: () => void;
}) => {
  const {
    enabledTypes,
    isSelectionOnlyMode,
    selectionType,
    suggestionType,
    showSuggestions,
    isSelectionPopoverOpen,
    selectionMode,
    onChange,
    insertSuggestion,
    setIsSelectionPopoverOpen,
    inputRef,
    suggestionTypeToRenderersMap,
    suggestionTypeToFormatsMap,
    enabledSuggestionsConfigMap,
  } = usePlaceholderInputContext();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const internalRef = useRef<HTMLDivElement>(null);

  const type: SuggestionType = useMemo(() => {
    if (isSelectionOnlyMode && selectionType) return selectionType;
    return (suggestionType || 'attribute') as SuggestionType;
  }, [isSelectionOnlyMode, selectionType, suggestionType]);

  const isOpenPopover = useMemo(
    () =>
      !!(
        (showSuggestions && suggestionType && enabledTypes[suggestionType]) ||
        (isSelectionOnlyMode && isSelectionPopoverOpen)
      ),
    [
      showSuggestions,
      suggestionType,
      enabledTypes,
      isSelectionOnlyMode,
      isSelectionPopoverOpen,
    ],
  );

  const enabledSuggestionsConfig = useMemo(
    () => enabledSuggestionsConfigMap[type] || {},
    [type, enabledSuggestionsConfigMap],
  );

  // selection-only handlers moved into hook

  const onSelect = (suggestion: string) => {
    // Insert suggestion via existing logic
    // Use custom formatSelection from enabled config if available, otherwise use default
    const formatFunction =
      enabledSuggestionsConfig.formatSelection ||
      suggestionTypeToFormatsMap[type];
    insertSuggestion(formatFunction(suggestion));
    if (selectionMode === 'multi') {
      // Append delimiter if not already present at end
      const next = inputRef.current?.value || '';
      const trimmed = next.trim();
      const needsComma = trimmed.length > 0 && !trimmed.endsWith(',');
      const withComma = needsComma ? `${trimmed}, ` : `${trimmed}`;
      if (withComma !== next) onChange(withComma);
      // keep popover open
      setIsSelectionPopoverOpen(true);
    } else {
      // single: close popover
      setIsSelectionPopoverOpen(false);
    }
  };

  const isCustomRenderer = useMemo(
    () => suggestionTypeToRenderersMap[type] === 'custom',
    [type, suggestionTypeToRenderersMap],
  );

  const isCustomCommandRenderer = useMemo(
    () => suggestionTypeToRenderersMap[type] === 'command',
    [type, suggestionTypeToRenderersMap],
  );

  // expose internal ref to parent when requested
  useEffect(() => {
    if (!popoverRef) return;
    popoverRef.current = internalRef.current;
  }, [popoverRef, isOpenPopover]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, type]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelect, onClose]);

  return {
    type,
    isOpenPopover,
    onSelect,
    isCustomRenderer,
    selectedIndex,
    internalRef,
    isCustomCommandRenderer,
    enabledSuggestionsConfig,
  };
};
