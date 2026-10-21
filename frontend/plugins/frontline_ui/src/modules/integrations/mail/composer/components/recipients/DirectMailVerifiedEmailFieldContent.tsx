import { useDirectMailRecipientField } from '@/integrations/mail/composer/hooks/recipients/useDirectMailRecipientField';
import { IconX } from '@tabler/icons-react';
import {
  Badge,
  Button,
  Command,
  Form,
  Input,
  Label,
  Popover,
  Spinner,
} from 'erxes-ui';

export const VerifiedEmailFieldContent = () => {
  const { error: fieldError } = Form.useField();
  const {
    fieldName,
    focused,
    setFocused,
    draft,
    selected,
    activeEmail,
    setActiveEmail,
    listId,
    inputRef,
    options,
    showSuggestions,
    loading,
    error,
    refetch,
    loadMoreError,
    loadingMore,
    hasNextPage,
    listRef,
    sentinelRef,
    retryLoadMore,
    closeSuggestions,
    selectEmail,
    commitDraft,
    activeOptionIndex,
    removeEmail,
    handleChange,
    handleKeyDown,
  } = useDirectMailRecipientField();
  return (
    <Popover
      open={showSuggestions}
      onOpenChange={(open) => {
        if (!open) closeSuggestions();
      }}
    >
      <Popover.Anchor asChild>
        <div
          className="flex min-h-9 min-w-0 flex-wrap items-center gap-1 py-1"
          onFocusCapture={() => setFocused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              commitDraft(false);
              setFocused(false);
              closeSuggestions();
            }
          }}
        >
          {!focused && selected.length > 0 && (
            <Label
              variant="peer"
              htmlFor={`direct-mail-${fieldName}`}
              className="min-w-0 cursor-text truncate text-sm"
              title={selected.join(', ')}
            >
              {selected.join(', ')}
            </Label>
          )}
          {focused &&
            selected.map((email) => (
              <Badge
                key={email}
                variant="secondary"
                className="max-w-full pr-1"
              >
                <span className="truncate" title={email}>
                  {email}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-5 shrink-0"
                  aria-label={`Remove ${email}`}
                  onClick={() => removeEmail(email)}
                >
                  <IconX className="size-3" />
                </Button>
              </Badge>
            ))}
          <Input
            ref={inputRef}
            id={`direct-mail-${fieldName}`}
            aria-label={`${fieldName.toUpperCase()} recipient email`}
            aria-invalid={Boolean(fieldError)}
            aria-describedby={
              fieldError ? `direct-mail-${fieldName}-error` : undefined
            }
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? listId : undefined}
            aria-activedescendant={
              showSuggestions && activeOptionIndex >= 0
                ? `${listId}-${activeOptionIndex}`
                : undefined
            }
            placeholder={selected.length ? '' : 'Recipients'}
            value={draft}
            className="h-7 min-w-24 flex-1 border-0 bg-transparent px-0 shadow-none hover:bg-transparent focus:bg-transparent focus-visible:shadow-none"
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
      </Popover.Anchor>
      <Popover.Content
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onMouseDown={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          if (event.target === inputRef.current) event.preventDefault();
          else closeSuggestions();
        }}
        className="z-60 w-[min(26rem,calc(100vw-2rem))] p-0"
      >
        <Command
          shouldFilter={false}
          value={activeEmail}
          onValueChange={setActiveEmail}
        >
          <Command.List
            id={listId}
            ref={listRef}
            className="max-h-64 overflow-y-auto"
          >
            {loading && options.length === 0 && (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Spinner size="sm" containerClassName="h-4 w-4 flex-none" />
                <output>Loading contacts…</output>
              </div>
            )}
            {error && (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => refetch().catch(() => undefined)}
              >
                Could not load contacts. Retry
              </Button>
            )}
            {options.map(({ email, customerId, name }, index) => (
              <Command.Item
                id={`${listId}-${index}`}
                key={email}
                value={email}
                onPointerDown={(event) => event.preventDefault()}
                onSelect={() => selectEmail(email, customerId)}
                className="gap-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">
                    {name || email}
                  </span>
                  {name && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  )}
                </span>
              </Command.Item>
            ))}
            {loadMoreError && (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={retryLoadMore}
              >
                Could not load more contacts. Retry
              </Button>
            )}
            {hasNextPage && !loadMoreError && (
              <div
                ref={sentinelRef}
                className="flex items-center justify-center gap-2 p-2 text-xs text-muted-foreground"
              >
                {loadingMore && (
                  <Spinner size="sm" containerClassName="h-4 w-4 flex-none" />
                )}
                {loadingMore ? 'Loading…' : ''}
              </div>
            )}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
