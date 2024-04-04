import { ICommonDoc } from '../common/types';

export interface ISpinDoc extends ICommonDoc {
  status: string;
}

export interface ISpin extends ISpinDoc {
  _id: string;
  owner: any;
  voucherCampaignId?: string;

  // won
  voucherId?: string;
  awardId?: string;
}

// mutation types
export type AddMutationResponse = {
  spinsAdd: (params: { variables: ISpinDoc }) => Promise<any>;
};

export type EditMutationResponse = {
  spinsEdit: (params: { variables: ISpin }) => Promise<any>;
};

export type RemoveMutationVariables = {
  _ids: string[];
};

export type RemoveMutationResponse = {
  spinsRemove: (params: { variables: RemoveMutationVariables }) => Promise<any>;
};

// query types
export type MainQueryResponse = {
  spinsMain: { list: ISpin[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type SpinsQueryResponse = {
  spins: ISpin[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  spinDetail: ISpin;
  loading: boolean;
};
