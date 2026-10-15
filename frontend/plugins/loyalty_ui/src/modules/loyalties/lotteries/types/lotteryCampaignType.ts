import type { ILottery } from '@/loyalties/settings/lottery/types/lotteryTypes';

export type ILotteryCampaign = Pick<ILottery, '_id' | 'title' | 'description'>;

export interface LotteryCampaignInlineProps {
  lotteryCampaignId?: string | string[];
  lotteryCampaigns?: ILotteryCampaign[];
  placeholder?: string;
  updateLotteryCampaigns?: (lotteryCampaigns: ILotteryCampaign[]) => void;
}
