import { forwardRef, useMemo } from 'react';
import { usePlaceHolderInput } from '../hooks/usePlaceHolderInput';
import { EnabledSuggestions } from '../constants';
import { usePlaceHolderInputTriggerDetection } from '../hooks/usePlaceholderInputDetection';
import { PlaceholderInputField } from './PlaceholderInputField';
import { PlaceholderInputHeader } from './PlaceholderInputHeader';
import { PlaceholderInputSuggestionPopover } from './PlaceholderInputSuggestionPopover';
import type { SuggestionConfig } from '../constants';
import type { SuggestionType } from '../constants';

type Props = {
  propertyType: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  selectedField?: any;
  fieldType?: string;
  onlySet?: boolean;
  additionalAttributes?: any[];
  // Dynamic enablement API (preferred)
  enabled?: EnabledSuggestions;
  suggestionGroups?: string[];
  enableAll?: boolean;
  disableAll?: boolean;
  onlyExpression?: boolean;
  onlyFixed?: boolean;
  onChangeInputMode?: (mode: 'expression' | 'fixed') => void;
  // New controls
  hideModeToggle?: boolean;
  hideInfoPopover?: boolean;
  // Selection-only mode: restrict input to suggestions
  selectionMode?: 'single' | 'multi';
  selectionType?: SuggestionType; // which suggestion list to show when selection-only
  // Dynamic: add/override triggers and renderers
  extraSuggestionConfigs?: SuggestionConfig[];
  // Provide custom renderer components per type when renderer === 'custom'
  customRenderers?: Partial<Record<SuggestionType, React.ComponentType<any>>>;
};

export const PlaceHolderInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  Props
>(
  (
    {
      propertyType,
      value,
      onChange,
      onlySet,
      isDisabled,
      fieldType,
      selectedField,
      additionalAttributes,
      onlyExpression,
      onlyFixed,
      hideModeToggle,
      hideInfoPopover,
      selectionType,
      selectionMode,
      ...props
    },
    ref,
  ) => {
    const {
      inputRef,
      setInputRef,
      inputMode,
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
      triggerToType,
      typeToTitle,
      typeToFormat,
      typeToRenderer,
      customRenderers,
      suggestionConfigs,
    } = usePlaceHolderInput({
      ...props,
      ref,
      extraSuggestionConfigs: props.extraSuggestionConfigs,
      customRenderers: props.customRenderers,
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
      setValue: onChange,
      inputRef,
      enabledTypes,
      overrideTriggerToType: triggerToType,
    });

    const computedType: SuggestionType = useMemo(() => {
      if (isSelectionOnlyMode && selectionType) return selectionType;
      return (suggestionType || 'attribute') as SuggestionType;
    }, [isSelectionOnlyMode, selectionType, suggestionType]);

    const showSuggestionPopover = !!(
      (showSuggestions && suggestionType && enabledTypes[suggestionType]) ||
      (isSelectionOnlyMode && isSelectionPopoverOpen)
    );

    // selection-only handlers moved into hook

    const handleSelect = (suggestion: string) => {
      // Insert suggestion via existing logic
      insertSuggestion(suggestion);
      if (selectionMode === 'multi') {
        // Append delimiter if not already present at end
        const next = inputRef.current?.value || '';
        const trimmed = next.trim();
        const needsComma = trimmed.length > 0 && !trimmed.endsWith(',');
        const withComma = needsComma ? `${trimmed}, ` : `${trimmed}`;
        if (withComma !== next) onChange(withComma);
        // keep popover open
        setIsSelectionPopoverOpen(true);
      } else {
        // single: close popover
        setIsSelectionPopoverOpen(false);
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <PlaceholderInputHeader
          inputMode={inputMode}
          onInputModeChange={handleInputModeChange}
          enabledTypes={enabledTypes}
          suggestionConfigs={suggestionConfigs}
          onlyExpression={onlyExpression}
          onlyFixed={onlyFixed}
          hideModeToggle={hideModeToggle}
          hideInfoPopover={hideInfoPopover}
        />

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
            enabledTypes={enabledTypes}
            inputMode={inputMode}
            suggestionConfigs={suggestionConfigs}
          />

          <PlaceholderInputSuggestionPopover
            open={showSuggestionPopover}
            contentType={propertyType}
            attrConfig={selectedField?.config}
            customAttributions={additionalAttributes}
            type={computedType}
            searchQuery={searchQuery}
            onSelect={handleSelect}
            onClose={closeSuggestions}
            anchorElement={inputRef.current}
            cursorPosition={cursorPosition}
            popoverRef={suggestionPopoverRef}
            renderer={typeToRenderer[computedType]}
            customRenderer={customRenderers?.[computedType]}
            typeToTitle={typeToTitle}
            typeToFormat={typeToFormat}
          />
        </div>
      </div>
    );
  },
);
