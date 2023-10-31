import { Schema } from 'mongoose';
import { field } from './utils';

export interface IRepeatValue {
  label: string;
  value: string;
}

export interface IRepeatRule {
  type: string;
  dayStartValue: Date;
  dayEndValue: Date;
  weekValue: IRepeatValue[];
  monthValue: IRepeatValue[];
  yearStartValue: Date;
  yearEndValue: Date;
}

export const repeatValueSchema = new Schema({
  label: field({ type: String }),
  value: field({ type: String })
});

export const repeatRuleSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String }),
  dayStartValue: field({ type: Date }),
  dayEndValue: field({ type: Date }),
  weekValue: field({ type: [repeatValueSchema] }),
  monthValue: field({ type: [repeatValueSchema] }),
  yearStartValue: field({ type: Date }),
  yearEndValue: field({ type: Date })
});
