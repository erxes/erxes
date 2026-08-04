import { createContext, useContext } from 'react';
import { ISpinCampaign } from '../types/spinCampaignType';

export interface ISpinCampaignInlineContext {
  spinCampaigns: ISpinCampaign[];
  loading: boolean;
  spinCampaignId?: string[];
  placeholder: string;
  updateSpinCampaigns?: (spinCampaigns: ISpinCampaign[]) => void;
}

export const SpinCampaignInlineContext =
  createContext<ISpinCampaignInlineContext | null>(null);

export const useSpinCampaignInlineContext = () => {
  const context = useContext(SpinCampaignInlineContext);
  if (!context) {
    throw new Error(
      'useSpinCampaignInlineContext must be used within a SpinCampaignInlineProvider',
    );
  }
  return context;
};
