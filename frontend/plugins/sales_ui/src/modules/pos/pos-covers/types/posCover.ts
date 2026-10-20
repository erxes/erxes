import type { PosCoversQuery } from '~/gql/graphql';
type Cover = NonNullable<NonNullable<PosCoversQuery['posCovers']>[number]>;
export type ICovers = Pick<
  Cover,
  | '_id'
  | 'posName'
  | 'status'
  | 'beginDate'
  | 'endDate'
  | 'description'
  | 'note'
  | 'createdAt'
> &
  Partial<Pick<Cover, 'user'>> & { _id: string };
