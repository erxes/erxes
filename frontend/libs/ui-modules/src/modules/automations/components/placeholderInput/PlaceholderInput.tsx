import { Children, cloneElement, forwardRef, isValidElement } from 'react';
import { PlaceholderInputProvider } from '../../contexts/PlaceholderInputContext';
import { usePlaceHolderInput } from '../../hooks/usePlaceHolderInput';
import { usePlaceHolderInputTriggerDetection } from '../../hooks/usePlaceholderInputDetection';
import { PlaceholderInputProps } from '../../types/placeholderInputTypes';
import { PlaceholderInputField } from './PlaceholderInputField';
import { PlaceholderInputHeader } from './PlaceholderInputHeader';
import { PlaceholderInputSuggestionPopover } from './PlaceholderInputSuggestionPopover';

const PlaceholderInputComponent = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  PlaceholderInputProps
>(
  (
    {
      propertyType,
      value = '',
      onChange,
      isDisabled,
      selectedField,
      additionalAttributes,
      hideModeToggle,
      hideInfoPopover,
      selectionType,
      selectionMode,
      children,
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
      isSelectionOnlyMode,
      isSelectionPopoverOpen,
      setIsSelectionPopoverOpen,
      handleInputValueChange,
      handleInputFocus,
      handleInputBlur,
      handleSelectionOnlyKeyPress,
      suggestionPopoverRef,
      suggestionTriggerTypesMap,
      suggestionTypeToTitlesMap,
      suggestionTypeToFormatsMap,
      suggestionTypeToRenderersMap,
      enabledSuggestionsConfigMap,
      customRenderers,
      suggestionConfigs,
    } = usePlaceHolderInput({
      ...props,
      ref,
      selectionType,
      selectionMode,
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
      enabledTypes,
      overrideTriggerToType: suggestionTriggerTypesMap,
    });

    const contextValue = {
      enabledTypes,
      suggestionConfigs,
      inputVariant,
      suggestionTypeToTitlesMap,
      suggestionTypeToFormatsMap,
      suggestionTypeToRenderersMap,
      enabledSuggestionsConfigMap,
      customRenderers,
      onInputModeChange: handleInputModeChange,
      isSelectionOnlyMode,
      selectionMode,
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

    // Check if Header is present in children
    let headerElement: React.ReactElement | null = null;
    const otherChildren: React.ReactNode[] = [];

    Children.forEach(children, (child) => {
      if (
        isValidElement(child) &&
        (child.type === PlaceholderInputHeader ||
          (child.type as any)?.displayName === 'PlaceholderInput.Header')
      ) {
        if (props?.variant) {
          return;
        }
        headerElement = cloneElement(child, {
          hideModeToggle: hideModeToggle ?? child.props?.hideModeToggle,
          hideInfoPopover: hideInfoPopover ?? child.props?.hideInfoPopover,
        });
      } else {
        otherChildren.push(child);
      }
    });

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
              readOnly={isSelectionOnlyMode}
            />

            <PlaceholderInputSuggestionPopover
              contentType={propertyType}
              attrConfig={selectedField?.config}
              customAttributions={additionalAttributes}
              searchQuery={searchQuery}
              onClose={closeSuggestions}
              cursorPosition={cursorPosition}
              popoverRef={suggestionPopoverRef}
            />
          </div>
          {otherChildren.length > 0 && otherChildren}
        </div>
      </PlaceholderInputProvider>
    );
  },
);

PlaceholderInputComponent.displayName = 'PlaceholderInput';

// Create compound component pattern
export const PlaceholderInput = Object.assign(PlaceholderInputComponent, {
  Header: PlaceholderInputHeader,
});
