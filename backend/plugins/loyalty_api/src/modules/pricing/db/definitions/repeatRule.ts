import { Schema } from 'mongoose';
import { IRepeatValue, IRepeatRule } from '@/pricing/@types/repeatRule';

export const repeatValueSchema = new Schema<IRepeatValue>({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false }); // usually no _id for subdocuments


export const repeatRuleSchema = new Schema<IRepeatRule>({
  type: { type: String, required: true },
  dayStartValue: { type: Date, required: true },
  dayEndValue: { type: Date, required: true },
  weekValue: { type: [repeatValueSchema], default: [] },
  monthValue: { type: [repeatValueSchema], default: [] },
  yearStartValue: { type: Date, required: true },
  yearEndValue: { type: Date, required: true }
}, {
  timestamps: true // automatically adds createdAt and updatedAt
});
