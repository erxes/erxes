import { useRef, useState } from 'react';

interface UseSelectionOnlyHandlersParams {
  selectionMode?: 'single' | 'multi';
  selectionPolicy?: 'single' | 'multi';
  value?: string;
  onChange?: (value: string) => void;
}

export function useSelectionOnlyHandlers({
  selectionMode,
  selectionPolicy,
  value = '',
  onChange,
}: UseSelectionOnlyHandlersParams) {
  const isSelectionOnlyMode = !!(selectionMode || selectionPolicy);
  const [isSelectionPopoverOpen, setIsSelectionPopoverOpen] =
    useState<boolean>(false);
  const suggestionPopoverRef = useRef<HTMLDivElement | null>(null);

  const handleInputFocus = () => {
    if (isSelectionOnlyMode) setIsSelectionPopoverOpen(true);
  };

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
    if (!isSelectionOnlyMode) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const current = value || '';
      if (!current.trim()) return onChange && onChange('');
      const policy = selectionMode || selectionPolicy;
      if (policy === 'single') return onChange && onChange('');
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
    isSelectionOnlyMode,
    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    handleInputFocus,
    handleInputBlur,
    handleSelectionOnlyKeyPress,
    suggestionPopoverRef,
  };
}
