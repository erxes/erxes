import { IUser } from '@erxes/ui/src/auth/types';
import { IVoucherCampaign } from '../../configs/voucherCampaign/types';
import { ICommonDoc } from '../common/types';

export interface IVoucherDoc extends ICommonDoc {
  status: string;
}

export interface IVoucher extends IVoucherDoc {
  _id: string;
  owner: IUser;
  campaign: IVoucherCampaign;
}

// mutation types
export type AddMutationResponse = {
  vouchersAdd: (params: { variables: IVoucherDoc }) => Promise<any>;
};

export type EditMutationResponse = {
  vouchersEdit: (params: { variables: IVoucher }) => Promise<any>;
};

export type RemoveMutationVariables = {
  _ids: string[];
};

export type RemoveMutationResponse = {
  vouchersRemove: (params: {
    variables: RemoveMutationVariables;
  }) => Promise<any>;
};

// query types
export type MainQueryResponse = {
  vouchersMain: { list: IVoucher[]; totalCount: number };
  loading: boolean;
  refetch: () => void;
};

export type VouchersQueryResponse = {
  vouchers: IVoucher[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  voucherDetail: IVoucher;
  loading: boolean;
};
