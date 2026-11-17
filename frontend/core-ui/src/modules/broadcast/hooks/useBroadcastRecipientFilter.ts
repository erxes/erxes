import { useMultiQueryState, useQueryState } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RECIPIENT_FILTER_KEYS,
  RECIPIENT_FILTER_STATUSES,
  TRecipientFilterQueries,
} from '../types';

/** The status list: picking the chosen status again clears it. */
export const useBroadcastRecipientStatusView = () => {
  const [status, setStatus] = useQueryState<string>(
    RECIPIENT_FILTER_KEYS.status,
  );

  const toggleStatus = useCallback(
    (value: string) => setStatus(value === status ? null : value),
    [setStatus, status],
  );

  return { status, toggleStatus };
};

/** The recipient filter bar: what is set, and how each set filter reads. */
export const useBroadcastRecipientFilter = () => {
  const { t } = useTranslation('broadcasts');
  const [queries] = useMultiQueryState<TRecipientFilterQueries>([
    RECIPIENT_FILTER_KEYS.status,
    RECIPIENT_FILTER_KEYS.updatedAt,
    RECIPIENT_FILTER_KEYS.searchValue,
  ]);
  const searchValue = queries?.[RECIPIENT_FILTER_KEYS.searchValue];
  const status = queries?.[RECIPIENT_FILTER_KEYS.status];
  const activeStatus = RECIPIENT_FILTER_STATUSES.find(
    ({ value }) => value === status,
  );

  return {
    hasFilters: Object.values(queries || {}).some((value) => value !== null),
    searchValue,
    status,
    statusLabel: activeStatus ? t(activeStatus.labelKey) : status,
    hasUpdatedAt: !!queries?.[RECIPIENT_FILTER_KEYS.updatedAt],
  };
};
