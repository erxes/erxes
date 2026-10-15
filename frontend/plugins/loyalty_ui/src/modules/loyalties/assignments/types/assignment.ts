import type { AssignmentsMainQuery } from '~/gql/graphql';
export type IAssignmentItem = NonNullable<
  NonNullable<NonNullable<AssignmentsMainQuery['assignments']>['list']>[number]
>;
