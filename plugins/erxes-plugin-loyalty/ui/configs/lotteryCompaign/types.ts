import { ICommonTypes } from "../commonTypes";

export type ILotteryCompaignAward = {
  _id: string,
  count?: number,
  voucherCompaignId?: string
}

export type ILotteryCompaign = ICommonTypes & {
  lotteryDate?: Date,
  numberFormat?: string,
  buyScore?: number,
  awards?: ILotteryCompaignAward[],

  lotteriesCount?: number,
};

// query types
export type LotteryCompaignQueryResponse = {
  lotteryCompaigns: ILotteryCompaign[];
  loading: boolean;
  refetch: () => void;
};

export type LotteryCompaignDetailQueryResponse = {
  lotteryCompaignDetail: ILotteryCompaign;
  loading: boolean;
  refetch: () => void;
};

export type LotteryCompaignsCountQueryResponse = {
  lotteryCompaignsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type LotteryCompaignRemoveMutationResponse = {
  lotteryCompaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
}