import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { commonCampaignSchema } from '~/utils';

export const donateAwardSchema = new Schema(
  {
    minScore: { type: Number, label: 'Min score' },
    voucherCampaignId: { type: String, label: 'Voucher campaign' },
  },
  { _id: false },
);

export const donateCampaignSchema = schemaWrapper(
  new Schema({
    ...commonCampaignSchema,

    awards: { type: [donateAwardSchema], label: 'Awards' },
    maxScore: { type: Number },
  }),
);
