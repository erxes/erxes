import { IconX } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { Badge, Button, Command, Input, Popover } from 'erxes-ui';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { MAIL_VERIFIED_CONTACTS_QUERY } from '@/integrations/mail/graphql/queries/mailRecipients';
import { useDirectMailComposerFields } from '@/integrations/mail/hooks/useDirectMailComposerFields';
import type {
  ComposeValues,
  MailRecipientsResult,
} from '@/integrations/mail/types/directMailComposer';
import { splitAddresses } from '@/integrations/mail/utils/directMailComposer';

type RecipientFieldName = 'to' | 'cc' | 'bcc';

const VerifiedEmailField = ({
  fieldName,
  value,
  onValueChange,
  onRecipientSelect,
}: {
  fieldName: RecipientFieldName;
  value: string;
  onValueChange: (value: string) => void;
  onRecipientSelect?: (customerId?: string) => void;
}) => {
  const [focused, setFocused] = useState(false);
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(false);
  const [draft, setDraft] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [activeEmail, setActiveEmail] = useState('');
  const listId = useId();
  const [loadMoreError, setLoadMoreError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const lastEmitted = useRef<string>();

  useEffect(() => {
    if (value === lastEmitted.current) return;
    const addresses = splitAddresses(value);
    setSelected(
      addresses.filter(
        (address) => z.string().email().safeParse(address).success,
      ),
    );
    setDraft(
      addresses
        .filter((address) => !z.string().email().safeParse(address).success)
        .join(', '),
    );
  }, [value]);

  useEffect(() => {
    if (!focused || !suggestionsEnabled || !draft.trim()) return;
    const timer = window.setTimeout(() => setSearchValue(draft.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [draft, focused, suggestionsEnabled]);

  const searchReady =
    focused &&
    suggestionsEnabled &&
    Boolean(draft.trim()) &&
    Boolean(searchValue);

  const closeSuggestions = () => {
    setSuggestionsEnabled(false);
    setSearchValue('');
    setActiveEmail('');
  };

  const emit = (addresses: string[], text: string) => {
    const next = [...addresses, text.trim()].filter(Boolean).join(', ');
    lastEmitted.current = next;
    onValueChange(next);
  };

  const { data, previousData, loading, error, fetchMore, refetch } =
    useQuery<MailRecipientsResult>(MAIL_VERIFIED_CONTACTS_QUERY, {
      variables: { searchValue },
      skip: !searchReady,
    });

  const contacts = data ?? previousData;

  const options = useMemo(() => {
    const byEmail = new Map<
      string,
      { email: string; customerId: string; name: string }
    >();
    for (const contact of contacts?.customers.list ?? []) {
      if (!['valid', 'verified'].includes(contact.emailValidationStatus ?? ''))
        continue;
      const name = [contact.firstName, contact.lastName]
        .filter(Boolean)
        .join(' ');
      const email = contact.primaryEmail;
      if (email && !byEmail.has(email.toLowerCase())) {
        byEmail.set(email.toLowerCase(), {
          email,
          customerId: contact._id,
          name,
        });
      }
    }
    return [...byEmail.values()].filter(
      ({ email }) =>
        !selected.some((item) => item.toLowerCase() === email.toLowerCase()),
    );
  }, [contacts, selected]);

  const showSuggestions =
    searchReady && (loading || Boolean(error) || options.length > 0);

  useEffect(() => setLoadMoreError(false), [searchValue]);

  const loadMore = useCallback(() => {
    const cursor = data?.customers.pageInfo.endCursor;
    if (
      !showSuggestions ||
      draft.trim() !== searchValue ||
      loading ||
      isFetchingRef.current ||
      !cursor ||
      !data?.customers.pageInfo.hasNextPage
    )
      return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    fetchMore({
      variables: { cursor, searchValue },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult) return previous;
        const loadedIds = new Set(
          previous.customers.list.map(({ _id }) => _id),
        );
        return {
          customers: {
            ...fetchMoreResult.customers,
            list: [
              ...previous.customers.list,
              ...fetchMoreResult.customers.list.filter(
                ({ _id }) => !loadedIds.has(_id),
              ),
            ],
          },
        };
      },
    })
      .then(({ data: next }) => {
        if (
          next.customers.pageInfo.hasNextPage &&
          next.customers.pageInfo.endCursor === cursor
        )
          setLoadMoreError(true);
      })
      .catch(() => setLoadMoreError(true))
      .finally(() => {
        isFetchingRef.current = false;
        setLoadingMore(false);
      });
  }, [data, draft, fetchMore, showSuggestions, searchValue, loading]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const list = listRef.current;
    if (
      !showSuggestions ||
      !sentinel ||
      !list ||
      loadMoreError ||
      !data?.customers.pageInfo.hasNextPage
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root: list, rootMargin: '0px 0px 80px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    data?.customers.list.length,
    data?.customers.pageInfo.hasNextPage,
    showSuggestions,
    loadMore,
    loadMoreError,
  ]);

  const selectEmail = (email: string, customerId?: string) => {
    closeSuggestions();
    const next = selected.some(
      (item) => item.toLowerCase() === email.toLowerCase(),
    )
      ? selected
      : [...selected, email];
    setSelected(next);
    setDraft('');
    emit(next, '');
    if (fieldName === 'to')
      onRecipientSelect?.(next.length === 1 ? customerId : undefined);
    inputRef.current?.focus();
  };

  const commitDraft = (focusInput = true) => {
    const addresses = splitAddresses(draft);
    if (
      !addresses.length ||
      addresses.some((email) => !z.string().email().safeParse(email).success)
    )
      return;
    const next = [...selected];
    for (const email of addresses) {
      if (!next.some((item) => item.toLowerCase() === email.toLowerCase()))
        next.push(email);
    }
    closeSuggestions();
    setSelected(next);
    setDraft('');
    emit(next, '');
    if (fieldName === 'to') onRecipientSelect?.();
    if (focusInput) inputRef.current?.focus();
  };

  const activeOptionIndex = options.findIndex(
    (option) => option.email === activeEmail,
  );

  const removeEmail = (email: string) => {
    const next = selected.filter((item) => item !== email);
    setSelected(next);
    emit(next, draft);
    if (fieldName === 'to') onRecipientSelect?.();
    inputRef.current?.focus();
  };

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
            <label
              htmlFor={`direct-mail-${fieldName}`}
              className="min-w-0 cursor-text truncate text-sm"
              title={selected.join(', ')}
            >
              {selected.join(', ')}
            </label>
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
            onChange={(event) => {
              const text = event.target.value;
              setFocused(true);
              setSuggestionsEnabled(Boolean(text.trim()));
              if (!text.trim()) setSearchValue('');
              if (text.endsWith(',') || text.endsWith(';')) {
                const email = text.slice(0, -1).trim();
                if (z.string().email().safeParse(email).success) {
                  selectEmail(email);
                  return;
                }
              }
              setDraft(text);
              emit(selected, text);
              if (fieldName === 'to') onRecipientSelect?.();
            }}
            onKeyDown={(event) => {
              if (
                showSuggestions &&
                !loading &&
                options.length &&
                draft.trim() === searchValue &&
                (event.key === 'ArrowDown' || event.key === 'ArrowUp')
              ) {
                event.preventDefault();
                const current = options.findIndex(
                  (option) => option.email === activeEmail,
                );
                const next =
                  event.key === 'ArrowDown'
                    ? (current + 1) % options.length
                    : current <= 0
                    ? options.length - 1
                    : current - 1;
                setActiveEmail(options[next].email);
              } else if (
                event.key === 'Enter' &&
                showSuggestions &&
                !loading &&
                draft.trim() === searchValue &&
                options.length
              ) {
                event.preventDefault();
                const option =
                  options.find((item) => item.email === activeEmail) ??
                  options[0];
                selectEmail(option.email, option.customerId);
              } else if (event.key === 'Enter' || event.key === 'Tab') {
                if (event.key === 'Enter') event.preventDefault();
                commitDraft(event.key !== 'Tab');
              } else if (
                event.key === 'Backspace' &&
                !draft &&
                selected.length
              ) {
                removeEmail(selected[selected.length - 1]);
              } else if (event.key === 'Escape') closeSuggestions();
            }}
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
              <p className="p-3 text-sm text-muted-foreground">
                Loading contacts…
              </p>
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
                onClick={() => {
                  setLoadMoreError(false);
                  loadMore();
                }}
              >
                Could not load more contacts. Retry
              </Button>
            )}
            {data?.customers.pageInfo.hasNextPage && !loadMoreError && (
              <div
                ref={sentinelRef}
                className="p-2 text-center text-xs text-muted-foreground"
              >
                {loadingMore ? 'Loading…' : ''}
              </div>
            )}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

export const RecipientRow = ({
  fieldName,
  onRecipientSelect,
}: {
  fieldName: RecipientFieldName;
  onRecipientSelect?: (customerId?: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { showCc, showBcc, openCc, openBcc } = useDirectMailComposerFields();
  const {
    control,
    formState: { errors },
  } = useFormContext<ComposeValues>();
  return (
    <div className="grid flex-none grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center border-b px-4 py-1.5">
      <label
        className="text-xs text-muted-foreground"
        htmlFor={`direct-mail-${fieldName}`}
      >
        {fieldName === 'to' ? 'To' : t(fieldName)}
      </label>
      <Controller
        name={fieldName}
        control={control}
        render={({ field }) => (
          <VerifiedEmailField
            fieldName={fieldName}
            value={field.value}
            onValueChange={field.onChange}
            onRecipientSelect={onRecipientSelect}
          />
        )}
      />
      {(fieldName === 'to' || fieldName === 'cc') && (
        <div className="flex items-center gap-1">
          {fieldName === 'to' && !showCc && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={openCc}
            >
              {t('cc')}
            </Button>
          )}
          {!showBcc && (fieldName === 'cc' || !showCc) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={openBcc}
            >
              {t('bcc')}
            </Button>
          )}
        </div>
      )}
      {errors[fieldName] && (
        <p
          className="col-start-2 col-span-2 text-xs text-destructive"
          role="alert"
        >
          {errors[fieldName]?.message}
        </p>
      )}
    </div>
  );
};
