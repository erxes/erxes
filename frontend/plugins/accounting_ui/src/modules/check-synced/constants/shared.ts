import { AccountingCheckSyncedStatus } from '../deals/types';

export type CheckOptions = {
  silent?: boolean;
  keepToSyncIds?: boolean;
  statusById?: Record<string, AccountingCheckSyncedStatus>;
};

/** get sync status from item. */
export const getSyncStatus = (item?: {
  syncStatus?: AccountingCheckSyncedStatus;
}): AccountingCheckSyncedStatus => item?.syncStatus || 'skipped';

/** split array into chunks. */
export const chunkIds = (ids: string[], size: number) => {
  const chunks: string[][] = [];

  for (let index = 0; index < ids.length; index += size) {
    chunks.push(ids.slice(index, index + size));
  }

  return chunks;
};
