export interface ILotteryCampaign {
  _id: string;
  title?: string;
  description?: string;
  status?: string;
  kind?: string;
  startDate?: string;
  endDate?: string;
}

export interface LotteryCampaignInlineProps {
  lotteryCampaignId?: string | string[];
  lotteryCampaigns?: ILotteryCampaign[];
  placeholder?: string;
  updateLotteryCampaigns?: (lotteryCampaigns: ILotteryCampaign[]) => void;
}
