import type { MsdynamicSyncHistoriesQuery } from '~/gql/graphql';
import { jsonRecord } from '@/shared/utils/json';

export type MSDynamicSyncHistoryUser = {
  _id: string;
  email?: string;
  details?: {
    fullName?: string;
  };
};

type SyncMsdHistoryRow = NonNullable<
  NonNullable<
    NonNullable<MsdynamicSyncHistoriesQuery['syncMsdHistories']>['list']
  >[number]
>;

export type IMSDynamicSyncHistory = Omit<SyncMsdHistoryRow, 'createdUser'> & {
  createdUser?: MSDynamicSyncHistoryUser;
};

export const toMSDynamicSyncHistory = (
  history: SyncMsdHistoryRow,
): IMSDynamicSyncHistory => ({
  ...history,
  createdUser: jsonRecord<MSDynamicSyncHistoryUser>(history.createdUser),
});
