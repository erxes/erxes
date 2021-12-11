import { ICommonTypes } from "../commonTypes";

export type ISpinCompaignAward = {
  _id: string,
  probability?: number,
  voucherCompaignId?: string
}

export type ISpinCompaign = ICommonTypes & {
  byScore?: number,
  awards?: ISpinCompaignAward[]
};

// query types
export type SpinCompaignQueryResponse = {
  spinCompaigns: ISpinCompaign[];
  loading: boolean;
  refetch: () => void;
};

export type SpinCompaignRemoveMutationResponse = {
  spinCompaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
}