import { ICommonTypes } from '../../types';

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
}

// query types
export type VoucherCampaignQueryResponse = {
  voucherCampaigns: IVoucherCampaign[];
  loading: boolean;
  refetch: () => void;
};

export type VoucherCampaignDetailQueryResponse = {
  voucherCampaignDetail: IVoucherCampaign;
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
