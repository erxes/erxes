import { isRecord } from '@/loyalties/utils/isRecord';

export type TLotteryAward = {
  name: string;
  voucherCampaignId: string;
  count: number;
};

export const parseLotteryAwards = (value: unknown): TLotteryAward[] =>
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
                count: typeof award.count === 'number' ? award.count : 0,
              },
            ]
          : [],
      )
    : [];
