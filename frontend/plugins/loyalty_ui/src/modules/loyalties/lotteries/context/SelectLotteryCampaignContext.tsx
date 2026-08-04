import { createContext, useContext } from 'react';
import { ILotteryCampaign } from '../types/lotteryCampaignType';

export type ISelectLotteryCampaignContext = {
  lotteryCampaignId: string[];
  lotteryCampaigns: ILotteryCampaign[];
  setLotteryCampaigns: (lotteryCampaigns: ILotteryCampaign[]) => void;
  onSelect: (lotteryCampaign: ILotteryCampaign) => void;
  loading: boolean;
  error: string | null;
};

export const SelectLotteryCampaignContext =
  createContext<ISelectLotteryCampaignContext | null>(null);

export const useSelectLotteryCampaignContext = () => {
  const context = useContext(SelectLotteryCampaignContext);
  if (!context) {
    throw new Error(
      'useSelectLotteryCampaignContext must be used within a SelectLotteryCampaignProvider',
    );
  }
  return context;
};
