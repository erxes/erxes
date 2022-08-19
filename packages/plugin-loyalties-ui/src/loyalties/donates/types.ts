import { IUser } from '@erxes/ui/src/auth/types';
import { ICommonDoc } from '../common/types';

export interface IDonateDoc extends ICommonDoc {
  donateScore: number;
}

export interface IDonate extends IDonateDoc {
  _id: string;
  owner: IUser;
}

// mutation types
export type AddMutationResponse = {
  donatesAdd: (params: { variables: IDonateDoc }) => Promise<any>;
};

export type EditMutationResponse = {
  donatesEdit: (params: { variables: IDonate }) => Promise<any>;
};

export type RemoveMutationVariables = {
  _ids: string[];
};

export type RemoveMutationResponse = {
  donatesRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

// query types
export type MainQueryResponse = {
  donatesMain: { list: IDonate[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type DonatesQueryResponse = {
  donates: IDonate[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  lotteryDetail: IDonate;
  loading: boolean;
};
