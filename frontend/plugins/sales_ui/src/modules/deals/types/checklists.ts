import type { SalesChecklistsQuery } from '~/gql/graphql';

export type IChecklist = NonNullable<
  NonNullable<SalesChecklistsQuery['salesChecklists']>[number]
>;
export type IChecklistItem = NonNullable<
  NonNullable<IChecklist['items']>[number]
>;
