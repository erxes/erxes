import type { SalesPosOrdersSelectDetailQuery } from '~/gql/graphql';

export type IPos = Pick<
  NonNullable<SalesPosOrdersSelectDetailQuery['posDetail']>,
  '_id' | 'name'
> & { _id: string };
export interface PosInlineProps {
  posIds?: string[];
  pos?: IPos[];
  placeholder?: string;
  updatePos?: (pos: IPos[]) => void;
}
