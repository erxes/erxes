import { ICommonTypes } from '../../types';

export type IDonateCampaignAward = {
  _id: string;
  minScore?: number;
  voucherCampaignId?: string;
};

export interface IDonateCampaign extends ICommonTypes {
  maxScore?: number;
  awards?: IDonateCampaignAward[];

  donatesCount?: number;
}

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
};
