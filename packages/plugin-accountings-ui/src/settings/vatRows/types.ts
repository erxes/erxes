import { QueryResponse } from '@erxes/ui/src/types';

export interface IVatRow {
  _id: string;
  name: string;
  number: string;
  kind: string;
  formula: string;
  formulaText: string;
  tabCount: number;
  isBold: boolean;
  status: string;
  percent: number;
}

export type VatRowDetailQueryResponse = {
  vatRowDetail: IVatRow;
} & QueryResponse;

export type VatRowsQueryResponse = {
  vatRows: IVatRow[];
} & QueryResponse;

export type VatRowsCountQueryResponse = {
  vatRowsCount: number;
} & QueryResponse;

export type AddVatRowMutationResponse = {
  addVatRowMutation: (params: { variables: IVatRow }) => Promise<IVatRow>;
};

export type EditVatRowMutationResponse = {
  editVatRowMutation: (params: {
    variables: { _id: string } & IVatRow;
  }) => Promise<IVatRow>;
};

export type RemoveVatRowMutationResponse = {
  removeVatRowMutation: (params: {
    variables: { _id: string };
  }) => Promise<string>;
};
