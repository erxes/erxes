import { Command } from 'erxes-ui';
import { forwardRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { DATE_OPTIONS } from '../../constants/placeholderInputConstants';
import { usePlaceholderInputContext } from '../../contexts/PlaceholderInputContext';
import { usePlaceholderInputSuggestionPopover } from '../../hooks/usePlaceholderInputSuggestionPopover';
import { usePopoverPosition } from '../../hooks/usePopoverPosition';
import { EmojiPicker } from '../EmojiPicker';
import { AttributesCommandList } from './commandList/AttributesCommandList';
import { CompaniesCommandList } from './commandList/CompaniesCommandList';
import { CustomerCommandList } from './commandList/CustomerCommandList';
import { OptionsCommandList } from './commandList/OptionsCommandList';
import { ProducsCommandList } from './commandList/ProducsCommandList';
import { TagsCommandList } from './commandList/TagsCommandList';
import { TeamMemberCommandList } from './commandList/TeamMemberCommandList';
import { PlaceholderInputSuggestionCustomCommandList } from './PlaceholderInputSuggestionCustomCommandList';
import { PlaceholderInputSuggestionCustomPopover } from './PlaceholderInputSuggestionCustomPopover';

interface SuggestionPopoverProps {
  searchQuery: string;
  onClose: () => void;
  cursorPosition: number;
  contentType?: string;
  popoverPosition?: 'left' | 'right' | 'top' | 'bottom';
}

export const PlaceholderInputSuggestionPopover = forwardRef<
  HTMLDivElement,
  SuggestionPopoverProps
>(
  (
    { searchQuery, onClose, contentType, popoverPosition = 'bottom' },
    popoverRef,
  ) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500);
    const { suggestionTypeMap, inputRef } = usePlaceholderInputContext();

    const {
      type: suggestionType,
      isOpenPopover,
      onSelect,
      isCustomRenderer,
      isCustomCommandRenderer,
      internalRef,
      suggestionOptions,
    } = usePlaceholderInputSuggestionPopover({
      popoverRef: popoverRef as
        | React.MutableRefObject<HTMLDivElement | null>
        | undefined,
      searchQuery,
      onClose,
    });

    const { selectFieldName = '_id' } = suggestionOptions || {};

    const positionStyle = usePopoverPosition({
      position: popoverPosition,
      inputRef,
      popoverRef: internalRef,
      isOpen: isOpenPopover,
    });

    if (!isOpenPopover) return null;

    // Unified select-suggestionType renderers to avoid duplication
    if (suggestionType === 'emoji') {
      return (
        <EmojiPicker
          className="rounded-lg bg-background border max-h-80 shadow-lg z-50 w-80"
          style={positionStyle}
          onEmojiSelect={({ emoji }) => onSelect(emoji)}
          onPointerDownCapture={(e) => e.preventDefault()}
        >
          <EmojiPicker.Search />
          <EmojiPicker.Content />
        </EmojiPicker>
      );
    }

    if (isCustomRenderer) {
      return (
        <PlaceholderInputSuggestionCustomPopover
          suggestionType={suggestionType}
          searchValue={searchQuery}
          onSelect={onSelect}
          selectFieldName={selectFieldName}
          internalRef={internalRef}
          positionStyle={positionStyle}
        />
      );
    }

    return (
      <Command
        ref={internalRef}
        className="rounded-lg border max-h-80 shadow-lg z-50 w-80"
        style={positionStyle}
        onPointerDownCapture={(e) => e.preventDefault()}
      >
        <Command.Input
          value={search}
          onValueChange={setSearch}
          variant="secondary"
          placeholder={`Search ${
            suggestionTypeMap.get(suggestionType || '')?.title
          }...`}
        />
        <Command.List>
          {suggestionType === 'attribute' && (
            <AttributesCommandList
              contentType={contentType}
              onSelect={(value) => onSelect(value)}
              {...suggestionOptions}
            />
          )}
          {suggestionType === 'option' && (
            <OptionsCommandList
              selectOptions={suggestionOptions?.options || []}
              onSelect={(value) => onSelect(value)}
            />
          )}
          {suggestionType === 'date' && (
            <Command.Group value="date">
              {DATE_OPTIONS.map((option) => (
                <Command.Item
                  key={option.id}
                  value={option.value}
                  onSelect={() => onSelect(option.value)}
                >
                  {option.label}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {suggestionType === 'call_user' && (
            <TeamMemberCommandList
              searchValue={debouncedSearch}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_customer' && (
            <CustomerCommandList
              searchValue={debouncedSearch}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_company' && (
            <CompaniesCommandList
              searchValue={debouncedSearch}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_product' && (
            <ProducsCommandList
              searchValue={debouncedSearch}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_tag' && (
            <TagsCommandList
              searchValue={debouncedSearch}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {isCustomCommandRenderer && (
            <PlaceholderInputSuggestionCustomCommandList
              suggestionType={suggestionType}
              searchValue={debouncedSearch}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
        </Command.List>
      </Command>
    );
  },
);

PlaceholderInputSuggestionPopover.displayName =
  'PlaceholderInputSuggestionPopover';
