import { BROADCAST_COLUMNS } from '@/broadcast/components/list/BroadcastColumns';
import { useMemo } from 'react';
import { useBroadcastEmailScope } from './useBroadcastEmailScope';

/** Columns that only mean something for an email campaign. */
const EMAIL_ONLY_COLUMNS = ['brandId', 'from'];

export const useBroadcastColumns = () => {
  const isEmailScope = useBroadcastEmailScope();

  return useMemo(
    () =>
      BROADCAST_COLUMNS.filter(
        (column) =>
          isEmailScope || !EMAIL_ONLY_COLUMNS.includes(column.id as string),
      ),
    [isEmailScope],
  );
};
