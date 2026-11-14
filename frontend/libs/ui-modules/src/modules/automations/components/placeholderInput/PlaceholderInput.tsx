import { forwardRef } from 'react';
import { PlaceholderInputProvider } from '../../contexts/PlaceholderInputContext';
import { usePlaceholderInputRoot } from '../../hooks/usePlaceholderInputRoot';
import { PlaceholderInputProps } from '../../types/placeholderInputTypes';
import { PlaceholderInputField } from './PlaceholderInputField';
import { PlaceholderInputHeader } from './PlaceholderInputHeader';
import { PlaceholderInputSuggestionPopover } from './PlaceholderInputSuggestionPopover';

const PlaceholderInputRoot = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PlaceholderInputProps
>(({ propertyType, isDisabled, popoverPosition = 'bottom', ...props }, ref) => {
  const {
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
    hasOtherChildren,
    suggestionPopoverRef,
    searchQuery,
    cursorPosition,
    closeSuggestions,
  } = usePlaceholderInputRoot(props, ref);

  return (
    <PlaceholderInputProvider value={contextValue}>
      <div className="flex flex-col gap-2">
        {headerElement}

        <div className="relative">
          <PlaceholderInputField
            ref={setInputRef}
            value={value}
            onChange={handleInputValueChange}
            onKeyDown={onFieldKeyDown}
            onBlur={onFieldBlur}
            onFocus={onFieldFocus}
            isDisabled={isDisabled}
            isDragActive={drop.isDragActive}
            onDragOver={drop.handleDragOver}
            onDragLeave={drop.handleDragLeave}
            onDrop={drop.handleDrop}
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
        {hasOtherChildren && otherChildren}
      </div>
    </PlaceholderInputProvider>
  );
});

PlaceholderInputRoot.displayName = 'PlaceholderInput';

// Create compound component pattern
export const PlaceholderInput = Object.assign(PlaceholderInputRoot, {
  Header: PlaceholderInputHeader,
});
