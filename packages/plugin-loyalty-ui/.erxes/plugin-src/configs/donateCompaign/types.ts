import { ICommonTypes } from "../commonTypes";
import { IVoucherCompaign } from "../voucherCompaign/types";

export type IDonateCompaignAward = {
  _id: string,
  minScore?: number,
  voucherCompaignId?: string
}

export type IDonateCompaign = ICommonTypes & {
  maxScore?: number,
  awards?: IDonateCompaignAward[],

  donatesCount?: number,
};

// query types
export type DonateCompaignQueryResponse = {
  donateCompaigns: IDonateCompaign[];
  loading: boolean;
  refetch: () => void;
};

export type DonateCompaignDetailQueryResponse = {
  donateCompaignDetail: IDonateCompaign;
  loading: boolean;
  refetch: () => void;
};

export type DonateCompaignsCountQueryResponse = {
  donateCompaignsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type DonateCompaignRemoveMutationResponse = {
  donateCompaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
}