import { createContext, useContext } from 'react';
import { IVoucherCampaign } from '../types/voucherCampaignType';

export type ISelectVoucherCampaignContext = {
  voucherCampaignId: string[];
  voucherCampaigns: IVoucherCampaign[];
  setVoucherCampaigns: (voucherCampaigns: IVoucherCampaign[]) => void;
  onSelect: (voucherCampaign: IVoucherCampaign) => void;
  loading: boolean;
  error: string | null;
};

export const SelectVoucherCampaignContext =
  createContext<ISelectVoucherCampaignContext | null>(null);

export const useSelectVoucherCampaignContext = () => {
  const context = useContext(SelectVoucherCampaignContext);
  if (!context) {
    throw new Error(
      'useSelectVoucherCampaignContext must be used within a SelectVoucherCampaignProvider',
    );
  }
  return context;
};
