import { isRecord } from '@/loyalties/utils/isRecord';

export type TSpinAward = {
  name: string;
  voucherCampaignId: string;
  probability: number;
};

export const parseSpinAwards = (value: unknown): TSpinAward[] =>
  Array.isArray(value)
    ? value.flatMap((award) =>
        isRecord(award)
          ? [
              {
                name: typeof award.name === 'string' ? award.name : '',
                voucherCampaignId:
                  typeof award.voucherCampaignId === 'string'
                    ? award.voucherCampaignId
                    : '',
                probability:
                  typeof award.probability === 'number' ? award.probability : 0,
              },
            ]
          : [],
      )
    : [];
