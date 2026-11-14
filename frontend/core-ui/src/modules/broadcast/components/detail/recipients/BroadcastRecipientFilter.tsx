import {
  IconCalendarTime,
  IconCheck,
  IconProgressCheck,
  IconSearch,
} from '@tabler/icons-react';
import { Combobox, Command, Filter } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY } from '../../../constants';
import {
  useBroadcastRecipientFilter,
  useBroadcastRecipientStatusView,
} from '../../../hooks/useBroadcastRecipientFilter';
import {
  RECIPIENT_FILTER_KEYS,
  RECIPIENT_FILTER_STATUSES,
} from '../../../types';

const FILTER_ID = 'broadcast-recipients-filter';

const StatusView = () => {
  const { t } = useTranslation('broadcasts');
  const { status, toggleStatus } = useBroadcastRecipientStatusView();

  return (
    <Filter.View filterKey={RECIPIENT_FILTER_KEYS.status}>
      <Command shouldFilter={false}>
        <Command.List className="p-1">
          <Combobox.Empty />
          {RECIPIENT_FILTER_STATUSES.map(({ value, labelKey }) => (
            <Command.Item
              key={value}
              value={value}
              className="cursor-pointer"
              onSelect={() => toggleStatus(value)}
            >
              {t(labelKey)}
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
  const { t } = useTranslation('broadcasts');
  const { hasFilters, searchValue, status, statusLabel, hasUpdatedAt } =
    useBroadcastRecipientFilter();

  return (
    <Filter id={FILTER_ID} sessionKey={BROADCAST_RECIPIENTS_CURSOR_SESSION_KEY}>
      <Filter.Bar>
        <Filter.Popover>
          <Filter.Trigger isFiltered={hasFilters} />
          <Combobox.Content>
            <Filter.View>
              <Command>
                <Filter.CommandInput
                  placeholder={t('filter.filter')}
                  variant="secondary"
                />
                <Command.List className="p-1">
                  <Filter.Item
                    value={RECIPIENT_FILTER_KEYS.searchValue}
                    inDialog
                  >
                    <IconSearch />
                    {t('filter.search')}
                  </Filter.Item>
                  <Filter.Item value={RECIPIENT_FILTER_KEYS.status}>
                    <IconProgressCheck />
                    {t('filter.status')}
                  </Filter.Item>
                  <Filter.Item value={RECIPIENT_FILTER_KEYS.updatedAt}>
                    <IconCalendarTime />
                    {t('filter.updated')}
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

        {!!searchValue && (
          <Filter.BarItem queryKey={RECIPIENT_FILTER_KEYS.searchValue}>
            <Filter.BarName>
              <IconSearch />
              {t('filter.search')}
            </Filter.BarName>
            <Filter.BarButton
              filterKey={RECIPIENT_FILTER_KEYS.searchValue}
              inDialog
            >
              {searchValue}
            </Filter.BarButton>
          </Filter.BarItem>
        )}

        {!!status && (
          <Filter.BarItem queryKey={RECIPIENT_FILTER_KEYS.status}>
            <Filter.BarName>
              <IconProgressCheck />
              {t('filter.status')}
            </Filter.BarName>
            <Filter.BarButton filterKey={RECIPIENT_FILTER_KEYS.status}>
              {statusLabel}
            </Filter.BarButton>
          </Filter.BarItem>
        )}

        {/* Rendered only once set: the bar's date button shows "Today" even
            with no query behind it, which reads as a filter that is not on. */}
        {hasUpdatedAt && (
          <Filter.BarItem queryKey={RECIPIENT_FILTER_KEYS.updatedAt}>
            <Filter.BarName>
              <IconCalendarTime />
              {t('filter.updated')}
            </Filter.BarName>
            <Filter.Date filterKey={RECIPIENT_FILTER_KEYS.updatedAt} />
          </Filter.BarItem>
        )}
      </Filter.Bar>

      <Filter.Dialog>
        <Filter.View filterKey={RECIPIENT_FILTER_KEYS.searchValue} inDialog>
          <Filter.DialogStringView
            filterKey={RECIPIENT_FILTER_KEYS.searchValue}
            label={t('filter.customer')}
          />
        </Filter.View>
        <Filter.View filterKey={RECIPIENT_FILTER_KEYS.updatedAt} inDialog>
          <Filter.DialogDateView filterKey={RECIPIENT_FILTER_KEYS.updatedAt} />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
};
