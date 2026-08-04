import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { commonCampaignSchema } from '~/utils';

export const lotteryAwardSchema = new Schema(
  {
    name: { type: String, label: 'Name' },
    voucherCampaignId: { type: String, label: 'Voucher campaign' },
    count: { type: Number, label: 'Count', min: 0 },
    wonLotteryIds: {
      type: [String],
      label: 'Won lottery ids',
      optional: true,
    },
  },
  { _id: false },
);

export const lotteryCampaignSchema = schemaWrapper(
  new Schema({
    ...commonCampaignSchema,

    numberFormat: { type: String, label: 'Number format type' },
    buyScore: { type: Number },

    awards: { type: [lotteryAwardSchema], label: 'Awards' },
  }),
);
