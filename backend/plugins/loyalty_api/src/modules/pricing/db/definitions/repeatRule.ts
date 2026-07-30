import { Schema } from 'mongoose';
import { IRepeatValue, IRepeatRule } from '@/pricing/@types/repeatRule';

export const repeatValueSchema = new Schema<IRepeatValue>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

export const repeatRuleSchema = new Schema<IRepeatRule>(
  {
    type: { type: String, required: true },
    dayStartValue: { type: Date },
    dayEndValue: { type: Date },
    weekValue: { type: [repeatValueSchema], default: [] },
    monthValue: { type: [repeatValueSchema], default: [] },
    yearStartValue: { type: Date },
    yearEndValue: { type: Date },
  },
  {
    timestamps: true,
  },
);
