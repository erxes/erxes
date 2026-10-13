import { GetOperationActivitiesQuery } from '~/gql/graphql';

export type IActivity = NonNullable<
  NonNullable<
    NonNullable<GetOperationActivitiesQuery['getOperationActivities']>['list']
  >[number]
>;
