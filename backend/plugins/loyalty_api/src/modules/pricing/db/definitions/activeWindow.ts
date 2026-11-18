import { Schema } from 'mongoose';
import {
  IActiveWindow,
  SCHEDULE_WINDOW_TYPES,
} from '@/pricing/@types/schedule';

export const activeWindowSchema = new Schema<IActiveWindow>(
  {
    type: { type: String, enum: SCHEDULE_WINDOW_TYPES, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    weekDays: { type: [Number], default: undefined },
    monthDays: { type: [Number], default: undefined },
    fromMonthDay: { type: String },
    toMonthDay: { type: String },
  },
  { _id: false },
);
