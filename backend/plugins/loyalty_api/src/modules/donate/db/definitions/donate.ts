import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { commonSchema } from '~/utils';

export const donateSchema = schemaWrapper(
  new Schema(
    {
      ...commonSchema,

      donateScore: { type: Number },
      awardId: { type: String, label: 'Won Award', optional: true },
      voucherId: { type: String, label: 'Won Voucher', optional: true },
      status: { type: String, optional: true },
      voucherCampaignId: { type: String, optional: true },
      number: { type: String, optional: true },
    },
    {
      timestamps: true,
    },
  ),
);
