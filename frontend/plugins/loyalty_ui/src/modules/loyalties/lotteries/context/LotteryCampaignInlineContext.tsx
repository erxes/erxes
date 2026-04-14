import { createContext, useContext } from 'react';
import { ILotteryCampaign } from '../types/lotteryCampaignType';

export interface ILotteryCampaignInlineContext {
  lotteryCampaigns: ILotteryCampaign[];
  loading: boolean;
  lotteryCampaignId?: string[];
  placeholder: string;
  updateLotteryCampaigns?: (lotteryCampaigns: ILotteryCampaign[]) => void;
}

export const LotteryCampaignInlineContext =
  createContext<ILotteryCampaignInlineContext | null>(null);

export const useLotteryCampaignInlineContext = () => {
  const context = useContext(LotteryCampaignInlineContext);
  if (!context) {
    throw new Error(
      'useLotteryCampaignInlineContext must be used within a LotteryCampaignInlineProvider',
    );
  }
  return context;
};
