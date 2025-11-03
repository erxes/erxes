import { Command } from 'erxes-ui';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { DATE_OPTIONS } from '../../constants/placeholderInputConstants';
import { usePlaceholderInputContext } from '../../contexts/PlaceholderInputContext';
import { usePlaceholderInputSuggestionPopover } from '../../hooks/usePlaceholderInputSuggestionPopover';
import { AttributesCommandList } from './commandList/AttributesCommandList';
import { CompaniesCommandList } from './commandList/CompaniesCommandList';
import { CustomerCommandList } from './commandList/CustomerCommandList';
import { OptionsCommandList } from './commandList/OptionsCommandList';
import { ProducsCommandList } from './commandList/ProducsCommandList';
import { TagsCommandList } from './commandList/TagsCommandList';
import { TeamMemberCommandList } from './commandList/TeamMemberCommandList';
import { EmojiPicker } from '../EmojiPicker';
import { PlaceholderInputSuggestionCustomPopover } from './PlaceholderInputSuggestionCustomPopover';
import { PlaceholderInputSuggestionCustomCommandList } from './PlaceholderInputSuggestionCustomCommandList';

interface SuggestionPopoverProps {
  searchQuery: string;
  onClose: () => void;
  cursorPosition: number;
  contentType?: string;
  attrConfig: any;
  customAttributions?: any[];
  selectedField?: any;
  popoverRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export function PlaceholderInputSuggestionPopover({
  searchQuery,
  onClose,
  contentType,
  attrConfig,
  customAttributions,
  selectedField,
  popoverRef,
}: SuggestionPopoverProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { suggestionTypeToTitlesMap, enabledSuggestionsConfigMap } =
    usePlaceholderInputContext();

  const {
    type: suggestionType,
    isOpenPopover,
    onSelect,
    isCustomRenderer,
    isCustomCommandRenderer,
    internalRef,
    enabledSuggestionsConfig: { selectFieldName = '_id', options },
  } = usePlaceholderInputSuggestionPopover({
    popoverRef,
    searchQuery,
    onClose,
  });

  if (!isOpenPopover) return null;

  // Unified select-suggestionType renderers to avoid duplication
  if (suggestionType === 'emoji') {
    return (
      <EmojiPicker
        className="rounded-lg bg-background border max-h-80 shadow-lg mt-2 fixed z-50 w-80"
        onEmojiSelect={({ emoji }) => onSelect(emoji)}
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
        searchQuery={searchQuery}
        onSelect={onSelect}
        onClose={onClose}
        internalRef={internalRef}
      />
    );
  }

  return (
    <Command
      ref={internalRef}
      className="rounded-lg border max-h-80 shadow-lg mt-2 fixed z-50 w-80"
    >
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        placeholder={`Search ${suggestionTypeToTitlesMap[suggestionType]}...`}
      />
      <Command.List>
        {suggestionType === 'attribute' && (
          <AttributesCommandList
            contentType={contentType}
            attrConfig={attrConfig}
            customAttributions={customAttributions}
            onSelect={(value) => onSelect(value)}
          />
        )}
        {suggestionType === 'option' && (
          <OptionsCommandList
            selectOptions={options || selectedField?.selectOptions || []}
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
}
