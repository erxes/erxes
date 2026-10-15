import type { ScoreLogsQuery } from '~/gql/graphql';

export interface IScoreOwner {
  _id?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  email?: string;
  phone?: string;
  // user specific
  details?: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  };
  // company specific
  primaryName?: string;
}

export type IScoreLog = NonNullable<
  NonNullable<NonNullable<ScoreLogsQuery['scoreLogs']>['list']>[number]
>;

export type IScoreLogItem = IScoreLog;
