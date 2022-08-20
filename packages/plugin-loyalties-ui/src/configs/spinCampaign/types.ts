import { ICommonTypes } from '../../types';

export type ISpinCampaignAward = {
  _id: string;
  name?: string;
  probability?: number;
  voucherCampaignId?: string;
};

export interface ISpinCampaign extends ICommonTypes {
  buyScore?: number;
  awards?: ISpinCampaignAward[];

  spinsCount?: number;
}

// query types
export type SpinCampaignQueryResponse = {
  spinCampaigns: ISpinCampaign[];
  loading: boolean;
  refetch: () => void;
};

export type SpinCampaignDetailQueryResponse = {
  spinCampaignDetail: ISpinCampaign;
  loading: boolean;
  refetch: () => void;
};

export type SpinCampaignsCountQueryResponse = {
  spinCampaignsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type SpinCampaignRemoveMutationResponse = {
  spinCampaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};
