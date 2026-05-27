import { forwardRef } from 'react';
import { PlaceholderInputProvider } from '../../contexts/PlaceholderInputContext';
import { usePlaceHolderInput } from '../../hooks/usePlaceHolderInput';
import { usePlaceHolderInputChildren } from '../../hooks/usePlaceHolderInputChildren';
import { useAutomationVariableDrop } from '../../hooks/useAutomationVariableDrop';
import { usePlaceHolderInputTriggerDetection } from '../../hooks/usePlaceholderInputDetection';
import { PlaceholderInputProps } from '../../types/placeholderInputTypes';
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
      value,
      onChange,
    });

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
              onBlur={handleInputBlur}
              onFocus={handleInputFocus}
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
