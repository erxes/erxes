import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { useOptionalAutomationVariableInsertion } from '../../contexts/AutomationVariableInsertionContext';
import { PlaceholderInputProvider } from '../../contexts/PlaceholderInputContext';
import { usePlaceHolderInput } from '../../hooks/usePlaceHolderInput';
import { usePlaceHolderInputChildren } from '../../hooks/usePlaceHolderInputChildren';
import { useAutomationVariableDrop } from '../../hooks/useAutomationVariableDrop';
import { usePlaceHolderInputTriggerDetection } from '../../hooks/usePlaceholderInputDetection';
import { PlaceholderInputProps } from '../../types/placeholderInputTypes';
import {
  TAutomationVariableDragPayload,
  insertAutomationVariableToken,
} from '../../utils/automationVariableDragUtils';
import { PlaceholderInputField } from './PlaceholderInputField';
import { PlaceholderInputHeader } from './PlaceholderInputHeader';
import { PlaceholderInputSuggestionPopover } from './PlaceholderInputSuggestionPopover';

const PlaceholderInputRoot = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PlaceholderInputProps
>(
  (
    {
      propertyType,
      value = '',
      onChange,
      isDisabled,
      selectionType,
      popoverPosition = 'bottom',
      variant,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
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
        if (!input || window.getComputedStyle(input).visibility === 'hidden') {
          return;
        }

        requestAnimationFrame(() => {
          input.focus();
          input.setSelectionRange(nextCursorPosition, nextCursorPosition);
        });
      },
      [inputRef],
    );

    useEffect(() => {
      return () => variableInsertion?.clearInsertionTarget(insertVariable);
    }, [insertVariable, variableInsertion]);

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
    const { isDragActive, handleDragOver, handleDragLeave, handleDrop } =
      useAutomationVariableDrop({
        value,
        onChange,
        inputRef,
      });

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

    return (
      <PlaceholderInputProvider value={contextValue}>
        <div className="flex flex-col gap-2">
          {headerElement}

          <div className="relative">
            <PlaceholderInputField
              ref={setInputRef}
              value={value}
              onChange={handleInputValueChange}
              onKeyDown={(e) => {
                handleSelectionOnlyKeyPress(e);
                if (!e.defaultPrevented) handleKeyDown(e);
              }}
              onBlur={(event) => {
                rememberSelection();
                handleInputBlur(event);
              }}
              onFocus={() => {
                rememberSelection();
                variableInsertion?.registerInsertionTarget(insertVariable);
                handleInputFocus();
              }}
              isDisabled={isDisabled}
              isDragActive={isDragActive}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />

            <PlaceholderInputSuggestionPopover
              contentType={propertyType}
              searchQuery={searchQuery}
              onClose={closeSuggestions}
              cursorPosition={cursorPosition}
              popoverPosition={popoverPosition}
              ref={suggestionPopoverRef}
            />
          </div>
          {otherChildren?.length > 0 && otherChildren}
        </div>
      </PlaceholderInputProvider>
    );
  },
);

PlaceholderInputRoot.displayName = 'PlaceholderInput';

// Create compound component pattern
export const PlaceholderInput = Object.assign(PlaceholderInputRoot, {
  Header: PlaceholderInputHeader,
});
