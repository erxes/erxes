import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { commonCampaignSchema } from '~/utils';

export const spinAwardSchema = new Schema(
  {
    name: { type: String, label: 'Name' },
    voucherCampaignId: { type: String, label: 'Voucher campaign' },
    probability: { type: Number, label: 'Probability', max: 100, min: 0 },
  },
  { _id: false },
);

export const spinCampaignSchema = schemaWrapper(
  new Schema({
    ...commonCampaignSchema,

    buyScore: { type: Number },

    awards: { type: [spinAwardSchema], label: 'Awards' },
  }),
);
