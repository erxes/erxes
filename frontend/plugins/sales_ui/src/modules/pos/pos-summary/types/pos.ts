import type { SalesPosSummarySelectDetailQuery } from '~/gql/graphql';

export type IPos = Pick<
  NonNullable<SalesPosSummarySelectDetailQuery['posDetail']>,
  '_id' | 'name'
> & { _id: string };
export interface PosInlineProps {
  posIds?: string[];
  pos?: IPos[];
  placeholder?: string;
  updatePos?: (pos: IPos[]) => void;
}
