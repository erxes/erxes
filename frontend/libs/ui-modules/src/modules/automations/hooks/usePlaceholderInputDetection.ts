import type React from 'react';

import { useState, useCallback, useEffect, RefObject, useMemo } from 'react';
import { SuggestionType, TRIGGER_TO_TYPE } from '../constants';

type PlaceholderInputTriggerDetectionProps = {
  value: string;
  setValue: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement> | null;
  enabledTypes?: Record<SuggestionType, boolean>;
  overrideTriggerToType?: Record<string, SuggestionType>;
};

export function usePlaceHolderInputTriggerDetection({
  value,
  setValue,
  inputRef,
  enabledTypes,
  overrideTriggerToType,
}: PlaceholderInputTriggerDetectionProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<SuggestionType | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerPosition, setTriggerPosition] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  const triggerToType = useMemo(
    () => overrideTriggerToType || TRIGGER_TO_TYPE,
    [overrideTriggerToType],
  );

  // Detect trigger characters
  useEffect(() => {
    if (!inputRef?.current) return;

    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    // Find the last trigger character before cursor
    let lastTriggerPos = -1;
    let lastTriggerChar = '';

    for (const [char, type] of Object.entries(triggerToType)) {
      // Skip if this type is not enabled
      if (enabledTypes && !enabledTypes[type]) {
        continue;
      }

      const pos = textBeforeCursor.lastIndexOf(char);
      if (pos > lastTriggerPos) {
        lastTriggerPos = pos;
        lastTriggerChar = char;
      }
    }

    // Check if we should show suggestions
    if (lastTriggerPos !== -1) {
      const textAfterTrigger = textBeforeCursor.slice(lastTriggerPos + 1);
      // Only show if there's no space after trigger (still typing the query)
      if (!textAfterTrigger.includes(' ')) {
        setShowSuggestions(true);
        setSuggestionType(triggerToType[lastTriggerChar]);
        setSearchQuery(textAfterTrigger);
        setTriggerPosition(lastTriggerPos);
        setCursorPosition(cursorPos);
        return;
      }
    }

    setShowSuggestions(false);
  }, [value, inputRef, enabledTypes, triggerToType]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Escape' && showSuggestions) {
        setShowSuggestions(false);
        e.preventDefault();
      }
    },
    [showSuggestions],
  );

  const insertSuggestion = useCallback(
    (suggestion: string) => {
      if (!inputRef?.current) return;

      const beforeTrigger = value.slice(0, triggerPosition);
      const afterCursor = value.slice(cursorPosition);
      const newValue = `${beforeTrigger}${suggestion}${afterCursor}`;

      setValue(newValue);
      setShowSuggestions(false);

      // Set cursor position after inserted text
      setTimeout(() => {
        const newCursorPos = beforeTrigger.length + suggestion.length;
        inputRef?.current?.setSelectionRange(newCursorPos, newCursorPos);
        inputRef?.current?.focus();
      }, 0);
    },
    [value, triggerPosition, cursorPosition, inputRef, setValue],
  );

  const closeSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return {
    showSuggestions,
    suggestionType,
    searchQuery,
    cursorPosition,
    handleKeyDown,
    insertSuggestion,
    closeSuggestions,
  };
}
