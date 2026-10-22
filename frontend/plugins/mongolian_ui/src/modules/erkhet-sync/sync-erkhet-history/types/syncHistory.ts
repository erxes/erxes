import type { ErkhetSyncHistoriesQuery } from '~/gql/graphql';
import { jsonRecord } from '@/shared/utils/json';

type SyncHistoryRow = NonNullable<
  NonNullable<
    NonNullable<ErkhetSyncHistoriesQuery['syncHistories']>['list']
  >[number]
>;

export type SyncHistoryUser = {
  _id: string;
  email?: string;
  details?: {
    fullName?: string;
  };
};

export type ISyncHistory = Omit<SyncHistoryRow, 'createdUser'> & {
  createdUser?: SyncHistoryUser;
};

export const toSyncHistory = (history: SyncHistoryRow): ISyncHistory => ({
  ...history,
  createdUser: jsonRecord<SyncHistoryUser>(history.createdUser),
});
