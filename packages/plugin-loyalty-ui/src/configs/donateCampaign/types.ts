import { ICommonTypes } from "../commonTypes";

export type IDonateCampaignAward = {
  _id: string,
  minScore?: number,
  voucherCampaignId?: string
}

export type IDonateCampaign = ICommonTypes & {
  maxScore?: number,
  awards?: IDonateCampaignAward[],

  donatesCount?: number,
};

// query types
export type DonateCampaignQueryResponse = {
  donateCampaigns: IDonateCampaign[];
  loading: boolean;
  refetch: () => void;
};

export type DonateCampaignDetailQueryResponse = {
  donateCampaignDetail: IDonateCampaign;
  loading: boolean;
  refetch: () => void;
};

export type DonateCampaignsCountQueryResponse = {
  donateCampaignsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type DonateCampaignRemoveMutationResponse = {
  donateCampaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
}