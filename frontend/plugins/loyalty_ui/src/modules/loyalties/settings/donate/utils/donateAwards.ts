import { isRecord } from '@/loyalties/utils/isRecord';

export type TDonateAward = {
  voucherCampaignId: string;
  minScore: number;
};

export const parseDonateAwards = (value: unknown): TDonateAward[] =>
  Array.isArray(value)
    ? value.flatMap((award) =>
        isRecord(award)
          ? [
              {
                voucherCampaignId:
                  typeof award.voucherCampaignId === 'string'
                    ? award.voucherCampaignId
                    : '',
                minScore:
                  typeof award.minScore === 'number' ? award.minScore : 0,
              },
            ]
          : [],
      )
    : [];
