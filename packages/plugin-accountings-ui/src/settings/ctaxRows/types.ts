import { QueryResponse } from '@erxes/ui/src/types';

export interface ICtaxRow {
  _id: string;
  name: string;
  number: string;
  kind: string;
  formula: string;
  formulaText: string;
  status: string;
  percent: number;
}

export type CtaxRowDetailQueryResponse = {
  ctaxRowDetail: ICtaxRow;
} & QueryResponse;

export type CtaxRowsQueryResponse = {
  ctaxRows: ICtaxRow[];
} & QueryResponse;

export type CtaxRowsCountQueryResponse = {
  ctaxRowsCount: number;
} & QueryResponse;

export type AddCtaxRowMutationResponse = {
  addCtaxRowMutation: (params: { variables: ICtaxRow }) => Promise<ICtaxRow>;
};

export type EditCtaxRowMutationResponse = {
  editCtaxRowMutation: (params: {
    variables: { _id: string } & ICtaxRow;
  }) => Promise<ICtaxRow>;
};

export type RemoveCtaxRowMutationResponse = {
  ctaxRowsRemove: (params: {
    variables: { _id: string };
  }) => Promise<string>;
};
