import {
  FocusEvent,
  ForwardedRef,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useOptionalAutomationVariableInsertion } from '../contexts/AutomationVariableInsertionContext';
import { PlaceholderInputProps } from '../types/placeholderInputTypes';
import {
  TAutomationVariableDragPayload,
  insertAutomationVariableToken,
} from '../utils/automationVariableDragUtils';
import { useAutomationVariableDrop } from './useAutomationVariableDrop';
import { usePlaceHolderInput } from './usePlaceHolderInput';
import { usePlaceHolderInputChildren } from './usePlaceHolderInputChildren';
import { usePlaceHolderInputTriggerDetection } from './usePlaceholderInputDetection';

type TInputElement = HTMLInputElement | HTMLTextAreaElement;

// A config written outside the builder can hold a number or a list where the
// field writes text; it is shown as text instead of breaking the form
const asText = (value: unknown) =>
  typeof value === 'string' ? value : String(value ?? '');

const isHidden = (input: TInputElement) =>
  window.getComputedStyle(input).visibility === 'hidden';

/**
 * Everything the placeholder input does besides drawing itself: suggestions
 * opened by trigger characters, variables dropped or inserted from the
 * sidebar at the last cursor position, and the context its parts read.
 */
export const usePlaceholderInputRoot = (
  {
    value: storedValue = '',
    onChange,
    selectionType,
    variant,
    children,
    disabled,
    ...props
  }: Omit<
    PlaceholderInputProps,
    'propertyType' | 'isDisabled' | 'popoverPosition'
  >,
  ref: ForwardedRef<TInputElement>,
) => {
  const value = asText(storedValue);
  const variableInsertion = useOptionalAutomationVariableInsertion();
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const selectionRef = useRef({ start: value.length, end: value.length });
  const {
    inputRef,
    setInputRef,
    inputVariant,
    enabledTypes,
    handleInputModeChange,
    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    handleInputValueChange,
    handleInputFocus,
    handleInputBlur,
    handleSelectionOnlyKeyPress,
    suggestionPopoverRef,
    suggestions,
    suggestionTypeMap,
    suggestionTypeByTriggerMap,
  } = usePlaceHolderInput({
    ...props,
    disabled,
    ref,
    selectionType,
    variant,
    value,
    onChange,
  });

  valueRef.current = value;
  onChangeRef.current = onChange;

  const rememberSelection = useCallback(() => {
    const start = inputRef.current?.selectionStart ?? valueRef.current.length;
    const end = inputRef.current?.selectionEnd ?? start;

    selectionRef.current = { start, end };
  }, [inputRef]);

  const insertVariable = useCallback(
    (payload: TAutomationVariableDragPayload) => {
      const { nextCursorPosition, nextValue } = insertAutomationVariableToken({
        value: valueRef.current,
        token: payload.token,
        selectionStart: selectionRef.current.start,
        selectionEnd: selectionRef.current.end,
      });

      valueRef.current = nextValue;
      selectionRef.current = {
        start: nextCursorPosition,
        end: nextCursorPosition,
      };
      onChangeRef.current(nextValue);

      const input = inputRef.current;

      if (!input || isHidden(input)) {
        return;
      }

      requestAnimationFrame(() => {
        input.focus();
        input.setSelectionRange(nextCursorPosition, nextCursorPosition);
      });
    },
    [inputRef],
  );

  useEffect(
    () => () => variableInsertion?.clearInsertionTarget(insertVariable),
    [insertVariable, variableInsertion],
  );

  const {
    showSuggestions,
    suggestionType,
    searchQuery,
    cursorPosition,
    handleKeyDown,
    insertSuggestion,
    closeSuggestions,
  } = usePlaceHolderInputTriggerDetection({
    value,
    onChange,
    inputRef,
    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    enabledTypes,
    suggestionTypeByTriggerMap,
    allowOnlyTriggers: props.placeholderConfig?.allowOnlyTriggers,
    placeholderConfig: props.placeholderConfig,
    suggestionPopoverRef,
  });

  const { headerElement, otherChildren } = usePlaceHolderInputChildren({
    children,
    variant,
  });
  const drop = useAutomationVariableDrop({ value, onChange, inputRef });

  // Selection-only fields handle the key first; suggestions get the rest
  const onFieldKeyDown = useCallback(
    (event: KeyboardEvent<TInputElement>) => {
      handleSelectionOnlyKeyPress(event);

      if (!event.defaultPrevented) {
        handleKeyDown(event);
      }
    },
    [handleSelectionOnlyKeyPress, handleKeyDown],
  );

  const onFieldBlur = useCallback(
    (event: FocusEvent<TInputElement>) => {
      rememberSelection();
      handleInputBlur(event);
    },
    [rememberSelection, handleInputBlur],
  );

  // The focused field is where the sidebar inserts variables
  const onFieldFocus = useCallback(() => {
    rememberSelection();
    variableInsertion?.registerInsertionTarget(insertVariable);
    handleInputFocus();
  }, [rememberSelection, variableInsertion, insertVariable, handleInputFocus]);

  const contextValue = {
    enabledTypes,
    suggestions,
    inputVariant,
    suggestionTypeMap,
    suggestionTypeByTriggerMap,
    onInputModeChange: handleInputModeChange,
    selectionType,
    suggestionType,
    value,
    onChange,
    showSuggestions,
    isSelectionPopoverOpen,
    insertSuggestion,
    setIsSelectionPopoverOpen,
    inputRef,
  };

  return {
    value,
    contextValue,
    setInputRef,
    handleInputValueChange,
    onFieldKeyDown,
    onFieldBlur,
    onFieldFocus,
    drop,
    headerElement,
    otherChildren,
    hasOtherChildren: otherChildren?.length > 0,
    suggestionPopoverRef,
    searchQuery,
    cursorPosition,
    closeSuggestions,
  };
};
