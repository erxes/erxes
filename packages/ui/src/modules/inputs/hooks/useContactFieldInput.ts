import { useEffect, useRef, useState } from 'react';

/**
 * Whether the add/edit input of PhoneField or EmailField is open, and which value it edits.
 * The input is always open while there is no value yet.
 */
export const useContactFieldInput = (hasValues: boolean) => {
  const [inputOpen, setInputOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  return {
    showInput: inputOpen || !hasValues,
    openInput: () => setInputOpen(true),
    editing,
    startEditing: (value: string) => {
      setEditing(value);
      setInputOpen(true);
    },
    closeInput: () => {
      setEditing(null);
      setInputOpen(false);
    },
  };
};

export type ContactFieldInput = ReturnType<typeof useContactFieldInput>;

/** Focuses the input once it shows, after the popover around it has opened. */
export const useFocusWhenShown = (showInput: boolean) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showInput) return;

    const timer = setTimeout(() => inputRef.current?.focus(), 180);

    return () => clearTimeout(timer);
  }, [showInput]);

  return inputRef;
};
