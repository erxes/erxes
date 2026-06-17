import { useRef, useState } from 'react';
import { SuggestionType } from '../types/placeholderInputTypes';

interface UseSelectionOnlyHandlersParams {
  value?: string;
  onChange?: (value: string) => void;
  selectionType?: SuggestionType;
}

export function useSelectionOnlyHandlers({
  value = '',
  onChange,
  selectionType,
}: UseSelectionOnlyHandlersParams) {
  const [isSelectionPopoverOpen, setIsSelectionPopoverOpen] =
    useState<boolean>(false);
  const suggestionPopoverRef = useRef<HTMLDivElement | null>(null);

  const handleInputFocus = () => {};

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextTarget = e.relatedTarget as Node | null;
    const container = suggestionPopoverRef.current;
    if (container && nextTarget && container.contains(nextTarget)) return;
    setIsSelectionPopoverOpen(false);
  };

  const handleSelectionOnlyKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!selectionType) {
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const current = value || '';
      if (!current.trim()) return onChange?.('');
      const parts = current
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      parts.pop();
      const next = parts.length ? parts.join(', ') + ', ' : '';
      onChange?.(next);
      setIsSelectionPopoverOpen(true);
    }
  };

  return {
    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    handleInputFocus,
    handleInputBlur,
    handleSelectionOnlyKeyPress,
    suggestionPopoverRef,
  };
}
