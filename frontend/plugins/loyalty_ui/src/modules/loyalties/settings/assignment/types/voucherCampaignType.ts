export interface IVoucherCampaign {
  _id: string;
  name?: string;
  description?: string;
  status?: string;
  kind?: string;
  startDate?: string;
  endDate?: string;
}

export interface VoucherCampaignInlineProps {
  voucherCampaignId?: string | string[];
  voucherCampaigns?: IVoucherCampaign[];
  placeholder?: string;
  updateVoucherCampaigns?: (voucherCampaigns: IVoucherCampaign[]) => void;
}
