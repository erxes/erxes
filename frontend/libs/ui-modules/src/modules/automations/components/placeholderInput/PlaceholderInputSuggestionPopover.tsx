import { IconX } from '@tabler/icons-react';
import { Button, Command } from 'erxes-ui';
import { forwardRef, useEffect, useMemo, useState } from 'react';
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

const SuggestionPopoverHeader = ({
  title,
  trigger,
  onClose,
}: {
  title: string;
  trigger?: string;
  onClose: () => void;
}) => {
  return (
    <div className="border-b bg-muted/30 px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-foreground">{title}</div>
            {trigger ? (
              <span className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {trigger}
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Search and press enter to insert.
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="-mr-1 -mt-1 size-7 shrink-0"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClose}
          aria-label="Close suggestions"
        >
          <IconX className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export const PlaceholderInputSuggestionPopover = forwardRef<
  HTMLDivElement,
  SuggestionPopoverProps
>(
  (
    { searchQuery, onClose, contentType, popoverPosition = 'bottom' },
    popoverRef,
  ) => {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 250);
    const { suggestionTypeMap, inputRef } = usePlaceholderInputContext();

    const {
      type: suggestionType,
      isOpenPopover,
      onSelect,
      isCustomRenderer,
      isCustomCommandRenderer,
      internalRef,
      suggestionOptions,
      suggestionConfig,
    } = usePlaceholderInputSuggestionPopover({
      popoverRef: popoverRef as
        | React.MutableRefObject<HTMLDivElement | null>
        | undefined,
      searchQuery,
      onClose,
    });

    const { selectFieldName = '_id' } = suggestionOptions || {};
    const title = suggestionConfig?.title || 'Suggestions';
    const trigger = suggestionConfig?.trigger;

    const positionStyle = usePopoverPosition({
      position: popoverPosition,
      inputRef,
      popoverRef: internalRef,
      isOpen: isOpenPopover,
    });

    useEffect(() => {
      if (!isOpenPopover) {
        setSearch('');
        return;
      }

      setSearch(searchQuery || '');
    }, [isOpenPopover, searchQuery, suggestionType]);

    const remoteSearchValue = useMemo(
      () => (debouncedSearch || searchQuery || '').trim(),
      [debouncedSearch, searchQuery],
    );

    if (!isOpenPopover) return null;

    if (suggestionType === 'emoji') {
      return (
        <div
          ref={internalRef}
          className="z-50 w-80 overflow-hidden rounded-lg border bg-background shadow-lg"
          style={positionStyle}
        >
          <SuggestionPopoverHeader
            title={title}
            trigger={trigger}
            onClose={onClose}
          />
          <EmojiPicker
            className="max-h-80 w-full rounded-none border-0 shadow-none"
            onEmojiSelect={({ emoji }) => onSelect(emoji)}
          >
            <EmojiPicker.Search />
            <EmojiPicker.Content />
            <EmojiPicker.Footer />
          </EmojiPicker>
        </div>
      );
    }

    if (isCustomRenderer) {
      return (
        <PlaceholderInputSuggestionCustomPopover
          suggestionType={suggestionType}
          title={title}
          trigger={trigger}
          searchValue={searchQuery}
          onSelect={onSelect}
          onClose={onClose}
          selectFieldName={selectFieldName}
          internalRef={internalRef}
          positionStyle={positionStyle}
        />
      );
    }

    return (
      <Command
        ref={internalRef}
        className="z-50 w-80 overflow-hidden rounded-lg border bg-background shadow-lg"
        style={positionStyle}
      >
        <SuggestionPopoverHeader
          title={title}
          trigger={trigger}
          onClose={onClose}
        />
        <Command.Input
          value={search}
          onValueChange={setSearch}
          variant="secondary"
          placeholder={`Search ${title.toLowerCase()}...`}
        />
        <Command.List className="max-h-80 overflow-auto">
          <Command.Empty>No results found.</Command.Empty>
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
                  <div className="flex min-w-0 items-center justify-between gap-3">
                    <span>{option.label}</span>
                    <span className="truncate font-mono text-[11px] text-muted-foreground">
                      {option.value}
                    </span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {suggestionType === 'call_user' && (
            <TeamMemberCommandList
              searchValue={remoteSearchValue}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_customer' && (
            <CustomerCommandList
              searchValue={remoteSearchValue}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_company' && (
            <CompaniesCommandList
              searchValue={remoteSearchValue}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_product' && (
            <ProducsCommandList
              searchValue={remoteSearchValue}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_tag' && (
            <TagsCommandList
              searchValue={remoteSearchValue}
              onSelect={(value) => onSelect(value)}
              selectField={selectFieldName}
            />
          )}
          {isCustomCommandRenderer && (
            <PlaceholderInputSuggestionCustomCommandList
              suggestionType={suggestionType}
              searchValue={remoteSearchValue}
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
