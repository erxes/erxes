import { createContext, useContext } from 'react';
import { ISpinCampaign } from '../types/spinCampaignType';

export type ISelectSpinCampaignContext = {
  spinCampaignId: string[];
  spinCampaigns: ISpinCampaign[];
  setSpinCampaigns: (spinCampaigns: ISpinCampaign[]) => void;
  onSelect: (spinCampaign: ISpinCampaign) => void;
  loading: boolean;
  error: string | null;
};

export const SelectSpinCampaignContext =
  createContext<ISelectSpinCampaignContext | null>(null);

export const useSelectSpinCampaignContext = () => {
  const context = useContext(SelectSpinCampaignContext);
  if (!context) {
    throw new Error(
      'useSelectSpinCampaignContext must be used within a SelectSpinCampaignProvider',
    );
  }
  return context;
};
