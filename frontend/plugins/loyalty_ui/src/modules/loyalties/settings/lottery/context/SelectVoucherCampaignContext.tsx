import React from 'react';
import { IVoucherCampaign } from '@/loyalties/settings/voucher/types/voucherCampaignType';

export interface SelectVoucherCampaignContextType {
  voucherCampaigns: IVoucherCampaign[];
  voucherCampaignId: string[];
  onSelect: (voucherCampaign: IVoucherCampaign) => void;
  setVoucherCampaigns: (voucherCampaigns: IVoucherCampaign[]) => void;
  loading: boolean;
  error: Error | undefined;
}

export const SelectVoucherCampaignContext =
  React.createContext<SelectVoucherCampaignContextType | null>(null);

export const useSelectVoucherCampaignContext = () => {
  const context = React.useContext(SelectVoucherCampaignContext);
  if (!context) {
    throw new Error(
      'useSelectVoucherCampaignContext must be used within SelectVoucherCampaignProvider',
    );
  }
  return context;
};
