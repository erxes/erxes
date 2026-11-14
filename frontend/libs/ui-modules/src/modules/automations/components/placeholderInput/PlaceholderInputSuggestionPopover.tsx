import { IconX } from '@tabler/icons-react';
import { Button, Command } from 'erxes-ui';
import { forwardRef } from 'react';
import { DATE_OPTIONS } from '../../constants/placeholderInputConstants';
import { usePlaceholderInputSuggestionPopoverView } from '../../hooks/usePlaceholderInputSuggestionPopoverView';
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
    const {
      type: suggestionType,
      isOpenPopover,
      onSelect,
      isCustomRenderer,
      isCustomCommandRenderer,
      internalRef,
      suggestionOptions,
      title,
      trigger,
      selectFieldName,
      positionStyle,
      search,
      setSearch,
      searchPlaceholder,
      remoteSearchValue,
      isServerFiltered,
    } = usePlaceholderInputSuggestionPopoverView({
      popoverRef,
      searchQuery,
      onClose,
      popoverPosition,
    });

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
        shouldFilter={!isServerFiltered}
        className="z-50 w-80 max-h-80 overflow-hidden rounded-lg border bg-background shadow-lg"
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
          placeholder={searchPlaceholder}
        />
        <Command.List className="max-h-80 overflow-auto">
          {!isServerFiltered && (
            <Command.Empty>No results found.</Command.Empty>
          )}
          {suggestionType === 'attribute' && (
            <AttributesCommandList
              contentType={contentType}
              onSelect={onSelect}
              {...suggestionOptions}
            />
          )}
          {suggestionType === 'option' && (
            <OptionsCommandList
              selectOptions={suggestionOptions?.options || []}
              onSelect={onSelect}
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
              onSelect={onSelect}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_customer' && (
            <CustomerCommandList
              searchValue={remoteSearchValue}
              onSelect={onSelect}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_company' && (
            <CompaniesCommandList
              searchValue={remoteSearchValue}
              onSelect={onSelect}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_product' && (
            <ProducsCommandList
              searchValue={remoteSearchValue}
              onSelect={onSelect}
              selectField={selectFieldName}
            />
          )}
          {suggestionType === 'call_tag' && (
            <TagsCommandList
              searchValue={remoteSearchValue}
              onSelect={onSelect}
              selectField={selectFieldName}
            />
          )}
          {isCustomCommandRenderer && (
            <PlaceholderInputSuggestionCustomCommandList
              suggestionType={suggestionType}
              searchValue={remoteSearchValue}
              onSelect={onSelect}
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
