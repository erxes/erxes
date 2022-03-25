import { ICommonTypes } from "../commonTypes";

export type ILotteryCampaignAward = {
  _id: string,
  name?: string,
  count?: number,
  voucherCampaignId?: string
}

export type ILotteryCampaign = ICommonTypes & {
  numberFormat?: string,
  buyScore?: number,
  awards?: ILotteryCampaignAward[],

  lotteriesCount?: number,
};

// query types
export type LotteryCampaignQueryResponse = {
  lotteryCampaigns: ILotteryCampaign[];
  loading: boolean;
  refetch: () => void;
};

export type LotteryCampaignDetailQueryResponse = {
  lotteryCampaignDetail: ILotteryCampaign;
  loading: boolean;
  refetch: () => void;
};

export type LotteryCampaignsCountQueryResponse = {
  lotteryCampaignsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type LotteryCampaignRemoveMutationResponse = {
  lotteryCampaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
}