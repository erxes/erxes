import { TTierBand } from '@/deals/loyaltyRules/tierBands';

// The tier a paid order sets by its amount.
export interface IPosEarnTier {
  accountTypeId: string;
  bands: TTierBand[];
  onlyUpgrade: boolean;
}

export type IPos = ReturnType<typeof import('../utils/posJson').toPosDetail>;
