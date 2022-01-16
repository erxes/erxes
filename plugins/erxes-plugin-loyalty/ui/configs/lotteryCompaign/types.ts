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
  awards?: ILotteryCompaignAward[]
};

// query types
export type LotteryCompaignQueryResponse = {
  lotteryCompaigns: ILotteryCompaign[];
  loading: boolean;
  refetch: () => void;
};

export type LotteryCompaignRemoveMutationResponse = {
  lotteryCompaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
}