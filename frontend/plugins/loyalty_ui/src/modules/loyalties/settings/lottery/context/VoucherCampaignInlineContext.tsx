import { createContext, useContext } from 'react';
import { IVoucherCampaign } from '../types/voucherCampaignType';

export interface IVoucherCampaignInlineContext {
  voucherCampaigns: IVoucherCampaign[];
  loading: boolean;
  voucherCampaignId?: string[];
  placeholder: string;
  updateVoucherCampaigns?: (voucherCampaigns: IVoucherCampaign[]) => void;
}

export const VoucherCampaignInlineContext =
  createContext<IVoucherCampaignInlineContext | null>(null);

export const useVoucherCampaignInlineContext = () => {
  const context = useContext(VoucherCampaignInlineContext);
  if (!context) {
    throw new Error(
      'useVoucherCampaignInlineContext must be used within a VoucherCampaignInlineProvider',
    );
  }
  return context;
};
