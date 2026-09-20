import {
  IconCalendarTime,
  IconCheck,
  IconProgressCheck,
  IconSearch,
} from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Filter,
  useMultiQueryState,
  useQueryState,
} from 'erxes-ui';
import { BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY } from '../../../constants';
import {
  RECIPIENT_FILTER_KEYS,
  RECIPIENT_FILTER_STATUSES,
  TRecipientFilterQueries,
} from '../../../types';

const FILTER_ID = 'broadcast-recipients-filter';

const StatusView = () => {
  const [status, setStatus] = useQueryState<string>(
    RECIPIENT_FILTER_KEYS.status,
  );

  return (
    <Filter.View filterKey={RECIPIENT_FILTER_KEYS.status}>
      <Command shouldFilter={false}>
        <Command.List className="p-1">
          <Combobox.Empty />
          {RECIPIENT_FILTER_STATUSES.map(({ value, label }) => (
            <Command.Item
              key={value}
              value={value}
              className="cursor-pointer"
              onSelect={() => setStatus(value === status ? null : value)}
            >
              {label}
              {status === value && <IconCheck className="ml-auto" />}
            </Command.Item>
          ))}
        </Command.List>
      </Command>
    </Filter.View>
  );
};

/**
 * Status filters on what the manifest itself recorded.
 *
 * `done`, `processing` and a flow that failed all sit under one manifest
 * status — the difference lives in the execution — so they cannot be told
 * apart here without the flow's own status being mirrored onto the row.
 * Offering the words it cannot honour would put the filter and the badge at
 * odds, so it offers only the ones it can.
 *
 * Every key is prefixed, because these live in the URL beside the campaign
 * list's own filters: a bare `searchValue` here is the same `searchValue` the
 * list behind this sheet reads, and typing in one filtered both.
 */
export const BroadcastRecipientFilter = () => {
  const [queries] = useMultiQueryState<TRecipientFilterQueries>([
    RECIPIENT_FILTER_KEYS.status,
    RECIPIENT_FILTER_KEYS.updatedAt,
    RECIPIENT_FILTER_KEYS.searchValue,
  ]);

  const hasFilters = Object.values(queries || {}).some(
    (value) => value !== null,
  );

  const activeStatus = RECIPIENT_FILTER_STATUSES.find(
    ({ value }) => value === queries?.[RECIPIENT_FILTER_KEYS.status],
  );

  return (
    <Filter id={FILTER_ID} sessionKey={BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <Filter.Popover>
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput placeholder="Filter" variant="secondary" />
                <Command.List className="p-1">
                  <Filter.Item
                    value={RECIPIENT_FILTER_KEYS.searchValue}
                    inDialog
                  >
                    <IconSearch />
                    Search
                  </Filter.Item>
                  <Filter.Item value={RECIPIENT_FILTER_KEYS.status}>
                    <IconProgressCheck />
                    Status
                  </Filter.Item>
                  <Filter.Item value={RECIPIENT_FILTER_KEYS.updatedAt}>
                    <IconCalendarTime />
                    Updated
                  </Filter.Item>
                </Command.List>
              </Command>
            </Filter.View>

            <StatusView />

            <Filter.View filterKey={RECIPIENT_FILTER_KEYS.updatedAt}>
              <Filter.DateView filterKey={RECIPIENT_FILTER_KEYS.updatedAt} />
            </Filter.View>
          </Combobox.Content>
        </Filter.Popover>

        {!!queries?.[RECIPIENT_FILTER_KEYS.searchValue] && (
          <Filter.BarItem queryKey={RECIPIENT_FILTER_KEYS.searchValue}>
            <Filter.BarName>
              <IconSearch />
              Search
            </Filter.BarName>
            <Filter.BarButton
              filterKey={RECIPIENT_FILTER_KEYS.searchValue}
              inDialog
            >
              {queries[RECIPIENT_FILTER_KEYS.searchValue]}
            </Filter.BarButton>
          </Filter.BarItem>
        )}

        {!!queries?.[RECIPIENT_FILTER_KEYS.status] && (
          <Filter.BarItem queryKey={RECIPIENT_FILTER_KEYS.status}>
            <Filter.BarName>
              <IconProgressCheck />
              Status
            </Filter.BarName>
            <Filter.BarButton filterKey={RECIPIENT_FILTER_KEYS.status}>
              {activeStatus?.label || queries[RECIPIENT_FILTER_KEYS.status]}
            </Filter.BarButton>
          </Filter.BarItem>
        )}

        {/* Rendered only once set: the bar's date button shows "Today" even
            with no query behind it, which reads as a filter that is not on. */}
        {!!queries?.[RECIPIENT_FILTER_KEYS.updatedAt] && (
          <Filter.BarItem queryKey={RECIPIENT_FILTER_KEYS.updatedAt}>
            <Filter.BarName>
              <IconCalendarTime />
              Updated
            </Filter.BarName>
            <Filter.Date filterKey={RECIPIENT_FILTER_KEYS.updatedAt} />
          </Filter.BarItem>
        )}
      </Filter.Bar>

      <Filter.Dialog>
        <Filter.View filterKey={RECIPIENT_FILTER_KEYS.searchValue} inDialog>
          <Filter.DialogStringView
            filterKey={RECIPIENT_FILTER_KEYS.searchValue}
            label="customer"
          />
        </Filter.View>
        <Filter.View filterKey={RECIPIENT_FILTER_KEYS.updatedAt} inDialog>
          <Filter.DialogDateView filterKey={RECIPIENT_FILTER_KEYS.updatedAt} />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};
