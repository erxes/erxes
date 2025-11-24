import { useRef, useState } from 'react';

interface UseSelectionOnlyHandlersParams {
  value?: string;
  onChange?: (value: string) => void;
}

export function useSelectionOnlyHandlers({
  value = '',
  onChange,
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
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const current = value || '';
      if (!current.trim()) return onChange && onChange('');
      const parts = current
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      parts.pop();
      const next = parts.length ? parts.join(', ') + ', ' : '';
      onChange && onChange(next);
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
