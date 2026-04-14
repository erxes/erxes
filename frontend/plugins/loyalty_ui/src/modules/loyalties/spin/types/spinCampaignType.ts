export interface ISpinCampaign {
  _id: string;
  title?: string;
  description?: string;
  status?: string;
  kind?: string;
  startDate?: string;
  endDate?: string;
}

export interface SpinCampaignInlineProps {
  spinCampaignId?: string | string[];
  spinCampaigns?: ISpinCampaign[];
  placeholder?: string;
  updateSpinCampaigns?: (spinCampaigns: ISpinCampaign[]) => void;
}
