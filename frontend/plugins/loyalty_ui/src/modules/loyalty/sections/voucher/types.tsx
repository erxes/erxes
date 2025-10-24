import { ICommonDoc, ICommonTypes, IUser } from '~/modules/loyalty/types';

export interface IVoucherDoc extends ICommonDoc {
  status: string;
}

export interface IVoucher extends IVoucherDoc {
  _id: string;
  owner: IUser;
  campaign: IVoucherCampaign;

  ownerIds?: string[];
}

export interface IOwnerVoucher {
  campaign: IVoucherCampaign;
  count: number;
  voucherIds: string[];
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

export type OwnerVouchersQueryResponse = {
  ownerVouchers: IOwnerVoucher[];
  loading: boolean;
  refetch: () => void;
};

export type DetailQueryResponse = {
  voucherDetail: IVoucher;
  loading: boolean;
};

//campaign

export interface IVoucherCampaign extends ICommonTypes {
  _id?: string;
  buyScore?: number;

  score?: number;
  scoreAction?: string;

  voucherType: string;

  productCategoryIds?: string[];
  productIds?: string[];
  discountPercent?: number;

  bonusProductId?: string;
  bonusCount?: number;

  coupon?: string;

  spinCampaignId?: string;
  spinCount?: number;

  lotteryCampaignId?: string;
  lotteryCount?: number;

  vouchersCount?: number;
  codesCount?: number;

  kind?: string;
  value?: number;

  restrictions?: any;
}

// query types
export type VoucherCampaignQueryResponse = {
  voucherCampaigns: IVoucherCampaign[];
  loading: boolean;
  refetch: () => void;
};

export type VoucherCampaignDetailQueryResponse = {
  voucherCampaignDetail: IVoucherCampaign[];
  loading: boolean;
  refetch: () => void;
};

export type VoucherCampaignsCountQueryResponse = {
  voucherCampaignsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type VoucherCampaignRemoveMutationResponse = {
  voucherCampaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};
