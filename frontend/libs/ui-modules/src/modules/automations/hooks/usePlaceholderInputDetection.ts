import type React from 'react';

import { RefObject, useCallback, useEffect, useState } from 'react';
import {
  SuggestionConfig,
  SuggestionType,
} from '../types/placeholderInputTypes';
import {
  findActualTriggerPosition,
  getDateNowContext,
  getEnclosingExpressionRangeOnBackspace,
  isAllowedDateNowEditKey,
  isInsideLockedExpression,
  shouldEnableDateSuggestions,
} from '../utils/placeholderInputDetectionUtils';
import { UsePlaceHolderInputProps } from '../types/placeholderInputTypes';

type PlaceholderInputTriggerDetectionProps = {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement> | null;
  enabledTypes?: Record<SuggestionType, boolean>;
  suggestionTypeByTriggerMap: Map<string, SuggestionConfig>;
  allowOnlyTriggers?: boolean;
  placeholderConfig?: UsePlaceHolderInputProps['placeholderConfig'];
};

export function usePlaceHolderInputTriggerDetection({
  value,
  onChange,
  inputRef,
  enabledTypes,
  suggestionTypeByTriggerMap,
  allowOnlyTriggers,
  placeholderConfig,
}: PlaceholderInputTriggerDetectionProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerPosition, setTriggerPosition] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Detect trigger characters
  useEffect(() => {
    if (!inputRef?.current) return;

    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = (value || '').slice(0, cursorPos);
    // lock when cursor is inside {{ }} or [[ ]]
    const { inCurly, inBracket } = isInsideLockedExpression(
      value || '',
      cursorPos,
    );
    const isInsideLocked = inCurly || inBracket;

    if (isInsideLocked) {
      // Only allow date suggestions while inside date-now expression
      const canDateSuggest = shouldEnableDateSuggestions(
        value || '',
        cursorPos,
        enabledTypes,
      );
      if (!canDateSuggest) {
        setShowSuggestions(false);
        return;
      }
    }

    // trigger only when last char before cursor is a trigger
    const lastChar = textBeforeCursor.slice(-1);
    const { type } = suggestionTypeByTriggerMap.get(lastChar) || {};
    const isEnabled =
      !enabledTypes || (type && enabledTypes[type as SuggestionType]);

    if (type && isEnabled) {
      setShowSuggestions(true);
      setSuggestionType(type);
      setSearchQuery('');
      setTriggerPosition(cursorPos - 1);
      setCursorPosition(cursorPos);
      return;
    }

    setShowSuggestions(false);
  }, [value, inputRef, enabledTypes, suggestionTypeByTriggerMap]);

  // close on blur
  useEffect(() => {
    const node = inputRef?.current;
    if (!node) return;
    const onBlur = () => setShowSuggestions(false);
    node.addEventListener('blur', onBlur);
    return () => node.removeEventListener('blur', onBlur);
  }, [inputRef]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.key === 'Escape' && showSuggestions) {
        setShowSuggestions(false);
        e.preventDefault();
        return;
      }

      if (!inputRef?.current) return;
      const start = inputRef.current.selectionStart || 0;
      const end = inputRef.current.selectionEnd || start;

      const text = value || '';

      // Shortcut: Backspace at the end of an expression like `...}}|` or `...]]|`
      if (e.key === 'Backspace' && start === end) {
        const range = getEnclosingExpressionRangeOnBackspace(text, start);
        if (range) {
          e.preventDefault();
          const newValue = text.slice(0, range.start) + text.slice(range.end);
          onChange(newValue);
          // place caret at the start of removed expression
          requestAnimationFrame(() => {
            inputRef.current?.setSelectionRange(range.start, range.start);
          });
          return;
        }
      }

      const { inCurly: inCurlyStart, inBracket: inBracketStart } =
        isInsideLockedExpression(text, start);
      const { inCurly: inCurlyEnd, inBracket: inBracketEnd } =
        isInsideLockedExpression(text, end);

      const isLocked =
        inCurlyStart || inBracketStart || inCurlyEnd || inBracketEnd;

      const isEditingKey =
        e.key.length === 1 ||
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'Enter';

      if (isLocked && isEditingKey) {
        // Allow inside {{ now ... }} only for date-related simple arithmetic: +, -, digits
        const { inside, afterNow } = getDateNowContext(text, start);
        const allowDateArithmetic =
          inside &&
          afterNow &&
          (isAllowedDateNowEditKey(e.key) ||
            e.key === 'Backspace' ||
            e.key === 'Delete');
        if (!allowDateArithmetic) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }

      // If only triggers are allowed when suggestions are closed, block non-trigger character input
      if (allowOnlyTriggers) {
        const isCharInput =
          e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
        if (isCharInput && !showSuggestions) {
          const isTrigger = !!suggestionTypeByTriggerMap.get(e.key);
          if (!isTrigger) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
      }
    },
    [
      showSuggestions,
      inputRef,
      value,
      allowOnlyTriggers,
      suggestionTypeByTriggerMap,
    ],
  );

  const insertSuggestion = useCallback(
    (suggestion: string) => {
      if (!inputRef?.current) return;

      // Get current cursor position to ensure accuracy
      const currentCursorPos =
        inputRef.current.selectionStart || cursorPosition;
      const currentValue = inputRef.current.value || value;

      // If placeholderConfig is provided, compose whole value using group-level wrap/delimiter
      if (placeholderConfig) {
        const selectMode = placeholderConfig.selectMode || 'one';
        const delimiter = placeholderConfig.delimiter ?? '';
        const wrap = placeholderConfig.wrap;
        const wrapPrefix = placeholderConfig.wrapPrefix || '';
        const wrapSuffix = placeholderConfig.wrapSuffix || '';

        // Remove the active trigger character from the text before composing
        const actualTriggerPos = findActualTriggerPosition(
          currentValue,
          currentCursorPos,
          suggestionTypeByTriggerMap,
          triggerPosition,
        );
        const beforeTrigger = currentValue.slice(0, actualTriggerPos);
        const afterCursor = currentValue.slice(currentCursorPos);
        let base = `${beforeTrigger}${afterCursor}`;

        // Unwrap if explicit prefix/suffix provided and value is wrapped (even when wrap fn exists)
        if (
          wrapPrefix &&
          wrapSuffix &&
          base.startsWith(wrapPrefix) &&
          base.endsWith(wrapSuffix)
        ) {
          base = base.slice(wrapPrefix.length, base.length - wrapSuffix.length);
        }

        // If no explicit prefix/suffix but a wrap function is used, try to auto-unwrap common wrappers
        if (!wrapPrefix && !wrapSuffix && wrap && base.length >= 2) {
          const pairs: Array<[string, string]> = [
            ['[', ']'],
            ['{', '}'],
            ['(', ')'],
            ['<', '>'],
          ];
          for (const [open, close] of pairs) {
            if (base.startsWith(open) && base.endsWith(close)) {
              base = base.slice(open.length, base.length - close.length);
              break;
            }
          }
        }

        const composed =
          selectMode === 'many' && base
            ? `${base}${delimiter}${suggestion}`
            : suggestion;

        const finalValue = wrap
          ? wrap(composed)
          : wrapPrefix || wrapSuffix
          ? `${wrapPrefix}${composed}${wrapSuffix}`
          : composed;

        onChange(finalValue);
        setShowSuggestions(false);

        // place caret at end
        setTimeout(() => {
          const newCursorPos = finalValue.length;
          inputRef?.current?.setSelectionRange(newCursorPos, newCursorPos);
          inputRef?.current?.focus();
        }, 0);
        return;
      }

      // block changes inside locked expressions, except allow inside {{ now ... }} for date
      const { inCurly, inBracket } = isInsideLockedExpression(
        currentValue,
        currentCursorPos,
      );
      if (inBracket) return;
      if (inCurly) {
        const { inside } = getDateNowContext(currentValue, currentCursorPos);
        if (!inside || suggestionType !== 'date') return;
      }

      // Verify trigger position is still valid
      // If trigger position seems off, try to find the correct one
      const actualTriggerPos = findActualTriggerPosition(
        currentValue,
        currentCursorPos,
        suggestionTypeByTriggerMap,
        triggerPosition,
      );

      const beforeTrigger = currentValue.slice(0, actualTriggerPos);
      const afterCursor = currentValue.slice(currentCursorPos);
      const newValue = `${beforeTrigger}${suggestion}${afterCursor}`;

      onChange(newValue);
      setShowSuggestions(false);

      // Set cursor position after inserted text
      setTimeout(() => {
        const newCursorPos = beforeTrigger.length + suggestion.length;
        inputRef?.current?.setSelectionRange(newCursorPos, newCursorPos);
        inputRef?.current?.focus();
      }, 0);
    },
    [
      value,
      triggerPosition,
      cursorPosition,
      inputRef,
      onChange,
      suggestionTypeByTriggerMap,
      suggestionType,
      placeholderConfig,
    ],
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
