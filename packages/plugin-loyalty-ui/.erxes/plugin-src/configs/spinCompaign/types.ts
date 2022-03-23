import { ICommonTypes } from "../commonTypes";

export type ISpinCompaignAward = {
  _id: string,
  name?: string,
  probability?: number,
  voucherCompaignId?: string
}

export type ISpinCompaign = ICommonTypes & {
  buyScore?: number,
  awards?: ISpinCompaignAward[]

  spinsCount?: number
};

// query types
export type SpinCompaignQueryResponse = {
  spinCompaigns: ISpinCompaign[];
  loading: boolean;
  refetch: () => void;
};

export type SpinCompaignDetailQueryResponse = {
  spinCompaignDetail: ISpinCompaign;
  loading: boolean;
  refetch: () => void;
};

export type SpinCompaignsCountQueryResponse = {
  spinCompaignsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type SpinCompaignRemoveMutationResponse = {
  spinCompaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
}