import { useEffect, useMemo, useRef, useState } from 'react';
import { usePlaceholderInputContext } from '../contexts/PlaceholderInputContext';

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
    selectionType,
    suggestionType,
    showSuggestions,
    isSelectionPopoverOpen,
    onChange,
    insertSuggestion,
    setIsSelectionPopoverOpen,
    inputRef,
    suggestionTypeMap,
  } = usePlaceholderInputContext();

  const internalRef = useRef<HTMLDivElement>(null);

  const type = useMemo(() => {
    if (selectionType) return selectionType;
    return suggestionType || 'attribute';
  }, [selectionType, suggestionType]);

  const suggestionConfig = suggestionTypeMap.get(type);
  const { mode, options } = suggestionConfig || {};
  const { formatSelection } = options || {};

  const isOpenPopover = useMemo(
    () =>
      !!(
        (showSuggestions && suggestionType && enabledTypes[suggestionType]) ||
        isSelectionPopoverOpen
      ),
    [showSuggestions, suggestionType, enabledTypes, isSelectionPopoverOpen],
  );

  // selection-only handlers moved into hook

  const onSelect = (suggestion: string) => {
    insertSuggestion(
      formatSelection ? formatSelection(suggestion) : suggestion,
    );
    setIsSelectionPopoverOpen(false);
  };

  const isCustomRenderer = mode === 'custom';

  const isCustomCommandRenderer = mode === 'command';

  useEffect(() => {
    if (!popoverRef) return;
    popoverRef.current = internalRef.current;
  }, [popoverRef, isOpenPopover]);

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
  }, [onClose]);

  return {
    type,
    isOpenPopover,
    onSelect,
    isCustomRenderer,
    internalRef,
    isCustomCommandRenderer,
    suggestionOptions: options,
    suggestionConfig,
  };
};
