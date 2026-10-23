import { gql, useApolloClient } from '@apollo/client';
import { IconX } from '@tabler/icons-react';
import { Combobox, Command, Popover, Skeleton } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { IDataExtensionLinkedRecord, IDataExtensionRecordType } from '../types';
import {
  buildNamesQuery,
  buildSearchQuery,
  describeLinkedRecord,
  typedRequestOptions,
} from '../utils/typedOperations';

type RawRecord = Record<string, unknown> & { _id: string };

const SEARCH_LIMIT = 20;

const toLinked = (records: RawRecord[] | undefined) =>
  (records || []).map((record) => ({
    _id: record._id,
    name: describeLinkedRecord(record),
  }));

const toIds = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);

/**
 * Searches any record type through the tenant's generated `<type>Search`
 * query, so every module registered for Data Extensions gets a name picker
 * without a module-specific selector. The owner applies the record type's
 * scope, so only records a link would accept are offered.
 */
export const DataExtensionRecordSearchPicker = ({
  recordType,
  value,
  mode,
  onChange,
  id,
  known = [],
}: {
  recordType: IDataExtensionRecordType;
  value: string | string[] | undefined;
  mode: 'single' | 'multiple';
  onChange: (value: string | string[] | null) => void;
  id?: string;
  /** Records already resolved by the caller, used for names. */
  known?: IDataExtensionLinkedRecord[];
}) => {
  const { t } = useTranslation('dataExtensions');
  const client = useApolloClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 250);
  const [results, setResults] = useState<IDataExtensionLinkedRecord[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = t(`record-types.${recordType.recordType}`, recordType.label);
  const selectedIds = toIds(value);
  const selectedKey = selectedIds.join(',');

  const remember = (records: IDataExtensionLinkedRecord[]) => {
    if (records.length) {
      setNames((current) => ({
        ...current,
        ...Object.fromEntries(
          records.map((record) => [record._id, record.name]),
        ),
      }));
    }
  };

  useEffect(() => {
    remember(known);
  }, [known]);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    client
      .query<{ records: RawRecord[] }>({
        query: gql(buildSearchQuery(recordType)),
        variables: {
          searchValue: debouncedSearch.trim() || null,
          limit: SEARCH_LIMIT,
        },
        ...typedRequestOptions,
      })
      .then(({ data }) => {
        if (cancelled) {
          return;
        }

        const records = toLinked(data.records);

        setResults(records);
        remember(records);
      })
      .catch((searchError: Error) => {
        if (!cancelled) {
          setResults([]);
          setError(searchError.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [client, open, debouncedSearch, recordType]);

  // Ids set elsewhere (a pasted value, a saved link) still get a name.
  useEffect(() => {
    const missing = selectedIds.filter((selected) => !names[selected]);

    if (!missing.length) {
      return;
    }

    let cancelled = false;

    client
      .query<{ records: RawRecord[] }>({
        query: gql(buildNamesQuery(recordType)),
        variables: { _ids: missing },
        ...typedRequestOptions,
      })
      .then(({ data }) => {
        if (!cancelled) {
          remember(toLinked(data.records));
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
    // `names` is left out on purpose: resolving updates it.
  }, [client, recordType, selectedKey]);

  const unselected = useMemo(
    () => results.filter((record) => !selectedIds.includes(record._id)),
    [results, selectedIds],
  );

  const toggle = (recordId: string) => {
    if (mode === 'single') {
      onChange(selectedIds.includes(recordId) ? null : recordId);
      setOpen(false);
      return;
    }

    const next = selectedIds.includes(recordId)
      ? selectedIds.filter((selected) => selected !== recordId)
      : [...selectedIds, recordId];

    onChange(next.length ? next : null);
  };

  const display = selectedIds
    .map((selected) => names[selected] || selected)
    .join(', ');

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          setSearch('');
        }
      }}
    >
      <Combobox.Trigger id={id} className="w-full shadow-xs">
        <Combobox.Value
          value={display}
          placeholder={t('values.pick-records', { label })}
        />
      </Combobox.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            variant="secondary"
            wrapperClassName="flex-auto"
            placeholder={t('values.search-placeholder', { label })}
            focusOnMount
          />
          <Command.List className="max-h-[300px] overflow-y-auto">
            {selectedIds.length > 0 && (
              <Command.Group heading={t('values.selected')}>
                {selectedIds.map((selected) => (
                  <Command.Item
                    key={selected}
                    value={`selected-${selected}`}
                    onSelect={() => toggle(selected)}
                  >
                    <span className="truncate">
                      {names[selected] || selected}
                    </span>
                    <Combobox.Check checked />
                  </Command.Item>
                ))}
                {mode === 'single' && (
                  <Command.Item
                    value="clear"
                    onSelect={() => {
                      onChange(null);
                      setOpen(false);
                    }}
                    className="text-muted-foreground"
                  >
                    <IconX />
                    {t('values.clear')}
                  </Command.Item>
                )}
              </Command.Group>
            )}
            {loading ? (
              <div className="flex flex-col gap-2 p-3" aria-hidden>
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : error ? (
              <p className="p-6 text-center text-sm text-destructive">
                {error}
              </p>
            ) : unselected.length ? (
              <Command.Group heading={label}>
                {unselected.map((record) => (
                  <Command.Item
                    key={record._id}
                    value={record._id}
                    onSelect={() => toggle(record._id)}
                  >
                    <span className="truncate">{record.name}</span>
                    <Combobox.Check checked={false} />
                  </Command.Item>
                ))}
              </Command.Group>
            ) : (
              <p className="p-6 text-center text-sm text-muted-foreground">
                {t('values.no-results')}
              </p>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
