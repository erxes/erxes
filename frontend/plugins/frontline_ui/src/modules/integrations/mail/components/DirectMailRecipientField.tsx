import { IconChevronDown, IconMail } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { Button, Combobox, Command, Popover } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { MAIL_VERIFIED_CONTACTS_QUERY } from '@/integrations/mail/graphql/queries/mailRecipients';
import { useDirectMailComposerFields } from '@/integrations/mail/hooks/useDirectMailComposerFields';
import type {
  ComposeValues,
  MailRecipientsResult,
} from '@/integrations/mail/types/directMailComposer';

const VerifiedEmailSelect = ({
  value,
  onValueChange,
  onRecipientSelect,
}: {
  value: string;
  onValueChange: (value: string) => void;
  onRecipientSelect: (customerId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchValue, setSearchValue] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setSearchValue(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const { data, loading, error, fetchMore, refetch } = useQuery<MailRecipientsResult>(
    MAIL_VERIFIED_CONTACTS_QUERY,
    {
      variables: { searchValue: searchValue || undefined },
      skip: !open,
    },
  );
  const { emails } = useDirectMailComposerFields();
  const options = useMemo(() => {
    const byEmail = new Map<
      string,
      { email: string; customerId?: string; name?: string }
    >();
    for (const email of [value, ...emails]) {
      if (email) byEmail.set(email.toLowerCase(), { email });
    }
    for (const contact of data?.customers.list ?? []) {
      if (!['valid', 'verified'].includes(contact.emailValidationStatus ?? '')) {
        continue;
      }
      const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
      for (const email of [contact.primaryEmail, ...(contact.emails ?? [])]) {
        if (email)
          byEmail.set(email.toLowerCase(), {
            email,
            customerId: contact._id,
            name,
          });
      }
    }
    return [...byEmail.values()].filter(({ email }) =>
      email.toLowerCase().includes(search.toLowerCase()),
    );
  }, [data, emails, search, value]);

  const loadMore = () => {
    const cursor = data?.customers.pageInfo.endCursor;
    if (loading || !cursor || !data?.customers.pageInfo.hasNextPage) return;
    fetchMore({
      variables: { cursor },
      updateQuery: (previous, { fetchMoreResult }) =>
        fetchMoreResult
          ? {
              customers: {
                ...fetchMoreResult.customers,
                list: [
                  ...previous.customers.list,
                  ...fetchMoreResult.customers.list,
                ],
              },
            }
          : previous,
    }).catch(() => undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-9 min-w-0 justify-between px-0 font-normal hover:bg-transparent"
          aria-label="Select recipient"
        >
          <span className="truncate">{value}</span>
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
      >
        <Command shouldFilter={false}>
          <Command.Input
            placeholder="Search verified contact emails"
            value={search}
            onValueChange={setSearch}
            focusOnMount
          />
          <Command.List className="max-h-64 overflow-y-auto">
            {loading && (
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
            {!loading && !error && options.length === 0 && (
              <p className="p-3 text-sm text-muted-foreground">
                No verified contact emails found.
              </p>
            )}
            {options.map(({ email, customerId, name }) => (
              <Command.Item
                key={email}
                value={email}
                onSelect={() => {
                  onValueChange(email);
                  if (customerId) onRecipientSelect(customerId);
                  setOpen(false);
                }}
              >
                <IconMail className="size-4 text-muted-foreground" />
                <span className="truncate">{email}</span>
                {name && (
                  <span className="ml-auto truncate text-xs text-muted-foreground">
                    {name}
                  </span>
                )}
                <Combobox.Check checked={email === value} />
              </Command.Item>
            ))}
            {data?.customers.pageInfo.hasNextPage && (
              <Command.Item value="load-more-contacts" onSelect={loadMore}>
                {loading ? 'Loading…' : 'Load more contacts'}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

export const ToRow = ({
  onRecipientSelect,
}: {
  onRecipientSelect: (customerId: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { showCc, showBcc, openCc, openBcc } = useDirectMailComposerFields();
  const {
    control,
    formState: { errors },
  } = useFormContext<ComposeValues>();

  return (
    <div className="grid flex-none grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center border-b px-4 py-1.5">
      <label className="text-xs text-muted-foreground" htmlFor="direct-mail-to">
        To
      </label>
      <Controller
        name="to"
        control={control}
        render={({ field }) => (
          <VerifiedEmailSelect
            value={field.value}
            onValueChange={field.onChange}
            onRecipientSelect={onRecipientSelect}
          />
        )}
      />
      <div className="flex items-center gap-1">
        {!showCc && (
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
        {!showBcc && (
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
      {errors.to && (
        <p className="col-start-2 col-span-2 text-xs text-destructive">
          {errors.to.message}
        </p>
      )}
    </div>
  );
};
