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

  const [selectedIndex, setSelectedIndex] = useState(0);
  const internalRef = useRef<HTMLDivElement>(null);

  const type = useMemo(() => {
    if (selectionType) return selectionType;
    return suggestionType || 'attribute';
  }, [selectionType, suggestionType]);

  const { mode, options } = suggestionTypeMap.get(type) || {};
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
    setSelectedIndex(0);
  }, [searchQuery, type]);

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
    suggestionOptions: options,
  };
};
