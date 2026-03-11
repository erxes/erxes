import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const ruleItemSchema = new Schema({
  code: { type: String, required: true },
  productIds: { type: [String] },
  allowSkip: { type: Boolean, required: true },
  quantity: { type: Number, label: 'quantity' },
  priceType: {
    type: String,
    enum: ['thisProductPricePercent', 'mainPricePercent', 'price'],
  },
  priceAdjustType: { type: String },
  priceAdjustFactor: { type: String },
  priceValue: { type: Number },
  percent: { type: Number },
});

export const bundleRuleSchema = schemaWrapper(
  new Schema({
    code: { type: String, label: 'Code' },
    name: { type: String, label: 'Name' },
    description: {
      type: String,
      optional: true,
      label: 'Description',
    },
    rules: { type: [ruleItemSchema], label: 'rules' },
  }),
);
