import type { SalesPosCoversSelectDetailQuery } from '~/gql/graphql';

export type IPos = Pick<
  NonNullable<SalesPosCoversSelectDetailQuery['posDetail']>,
  '_id' | 'name'
> & { _id: string };
export interface PosInlineProps {
  posIds?: string[];
  pos?: IPos[];
  placeholder?: string;
  updatePos?: (pos: IPos[]) => void;
}
