import { IVoucher } from './voucherTypes';

export type IVoucherCampaign = Pick<IVoucher, '_id' | 'title'>;

export interface VoucherCampaignInlineProps {
  voucherCampaignId?: string | string[];
  voucherCampaigns?: IVoucherCampaign[];
  placeholder?: string;
  updateVoucherCampaigns?: (voucherCampaigns: IVoucherCampaign[]) => void;
}
