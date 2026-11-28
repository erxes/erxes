import { isApiError, messageOf, orpc } from '@erxes/core-contract/client';
import { IconPlugConnected } from '@tabler/icons-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { buttonVariants, Combobox, Command, EntityPicker, IconTip, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { paths } from '~/lib/paths';

type Option = { value: string; label: string };

type Wanted = {
  integration: string;
  recordType: string;
  /**
   * The app lists records of this type. One it doesn't (a Messenger person, a Telegram chat) is
   * the run's value, or typed (a channel's @username).
   */
  listable: boolean;
  connection?: string;
  /** The values of the inputs it depends on, nearest first. */
  parents: string[];
  /** The run's values of this type, offered first. */
  runOptions?: Option[];
  /** The label of the input it depends on, while that one is empty. */
  waitingFor?: string;
};

/**
 * The app's records core lists with the connection, matching `search`, after the run's values;
 * none while a parent is missing or comes from the run, when only the run's values fit.
 */
const useAppRecords = (
  { integration, recordType, listable, connection, parents, runOptions = [], waitingFor }: Wanted,
  search: string,
  value: string[],
) => {
  const [term] = useDebounce(search.trim(), 250);

  const listed =
    listable && waitingFor === undefined && !parents.some((parent) => parent.startsWith('{{'));

  const records = useQuery({
    ...orpc.integrations.records.queryOptions({
      input: {
        key: integration,
        recordType,
        ...(connection && { connection }),
        ...(parents.length > 0 && { parents }),
        ...(term && { search: term }),
      },
      staleTime: 60_000,
      retry: false,
    }),
    enabled: listed,
    placeholderData: keepPreviousData,
  });

  const found = listed ? (records.data?.data ?? []) : [];
  const known = [...runOptions, ...found];
  const missing = value.filter((id) => !known.some((option) => option.value === id));
  const lower = search.trim().toLowerCase();

  return {
    items: [
      ...missing.map((id) => ({ value: id, label: id })),
      ...runOptions.filter((option) => option.label.toLowerCase().includes(lower)),
      ...found,
    ],
    labels: value.map((id) => known.find((option) => option.value === id)?.label ?? id),
    loading: listed && records.isFetching,
    notConnected: isApiError(records.error, 'NOT_CONNECTED') ? messageOf(records.error) : null,
    failed:
      records.error && !isApiError(records.error, 'NOT_CONNECTED')
        ? new Error(messageOf(records.error))
        : null,
  };
};

/**
 * One of an app's records (a Facebook page, a repository), listed by core with the step's or
 * trigger's connection, after the run's values of that type. While an input it depends on is
 * empty it waits. What the member types that matches nothing can be used as it is (a channel's
 * @username).
 */
export const AppRecordPicker = ({
  value,
  onValueChange,
  multiple,
  noneLabel,
  disabled,
  ...wanted
}: Wanted & {
  value: string[];
  onValueChange: (values: string[]) => void;
  multiple?: boolean;
  /** An optional input: a first row that picks nothing. */
  noneLabel?: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { items, labels, loading, notConnected, failed } = useAppRecords(wanted, search, value);

  const pick = (next: string[]) => {
    onValueChange(next);

    if (!multiple) setOpen(false);
  };

  const typedRow = (typed: string, clear: () => void) =>
    !wanted.listable &&
    typed &&
    !items.some((option) => option.label.toLowerCase() === typed.toLowerCase()) ? (
      <TypedRow
        typed={typed}
        onUse={() => {
          clear();
          pick(multiple ? [...value, typed] : [typed]);
        }}
      />
    ) : null;

  const placeholder = () => {
    if (notConnected) return t('connect-first', 'Connect first');

    return wanted.waitingFor === undefined
      ? t('choose', 'Choose…')
      : t('choose-parent-first', 'Choose {{field}} first', { field: wanted.waitingFor });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setSearch('');
        }}
      >
        <Combobox.Trigger
          disabled={Boolean(disabled) || Boolean(notConnected) || wanted.waitingFor !== undefined}
          className="min-w-0 flex-1"
        >
          <Combobox.Value value={labels.join(', ')} placeholder={placeholder()} />
        </Combobox.Trigger>
        <Combobox.Content>
          <EntityPicker
            multiple={multiple}
            items={items}
            itemKey={(option) => ({ id: option.value, label: option.label })}
            value={value}
            onValueChange={pick}
            onSearchChange={setSearch}
            searchPlaceholder={
              wanted.listable
                ? t('search-records', 'Search…')
                : t('search-or-type', 'Search, or type a value…')
            }
            loading={loading}
            error={failed}
            noneLabel={noneLabel}
            renderCreate={typedRow}
            header={wanted.listable || wanted.runOptions?.length ? null : <NoneFromRun />}
          />
        </Combobox.Content>
      </Popover>
      {notConnected && <NotConnected integration={wanted.integration} message={notConnected} />}
    </div>
  );
};

/** A value the app has no list of, used as typed. */
const TypedRow = ({ typed, onUse }: { typed: string; onUse: () => void }) => {
  const { t } = useTranslation('automations');

  return (
    <Command.Item value={`__typed__${typed}`} onSelect={onUse}>
      {t('use-typed', 'Use “{{value}}”', { value: typed })}
    </Command.Item>
  );
};

/** Why a record the app has no list of has no choices: nothing in the run gives one. */
const NoneFromRun = () => {
  const { t } = useTranslation('automations');

  return (
    <p className="px-3 pt-2 text-xs text-muted-foreground">
      {t(
        'record-from-run',
        'It comes from the trigger or an earlier step, and none of them gives one here.',
      )}
    </p>
  );
};

/** Why nothing lists (the app isn't connected, its connection is off), with the way to fix it. */
const NotConnected = ({ integration, message }: { integration: string; message: string }) => {
  const { t } = useTranslation('automations');

  return (
    <IconTip label={message}>
      <Link
        to={paths.settings.integration(integration)}
        aria-label={t('open-integration', 'Open the integration')}
        className={buttonVariants({ variant: 'outline', size: 'icon' })}
      >
        <IconPlugConnected />
      </Link>
    </IconTip>
  );
};

/** The values of the inputs `key` depends on, nearest first, by their `dependsOn` chain. */
export const parentsOf = (
  key: string | undefined,
  fields: { key: string; dependsOn?: string }[],
  valueOf: (key: string) => string,
) => {
  const parents: string[] = [];

  for (let at = key; at !== undefined && parents.length < 5;) {
    parents.push(valueOf(at));
    at = fields.find((field) => field.key === at)?.dependsOn;
  }

  return parents;
};
