import type { ISpin } from '@/loyalties/settings/spin/types/spinTypes';

export type ISpinCampaign = Pick<ISpin, '_id' | 'title' | 'description'>;

export interface SpinCampaignInlineProps {
  spinCampaignId?: string | string[];
  spinCampaigns?: ISpinCampaign[];
  placeholder?: string;
  updateSpinCampaigns?: (spinCampaigns: ISpinCampaign[]) => void;
}
