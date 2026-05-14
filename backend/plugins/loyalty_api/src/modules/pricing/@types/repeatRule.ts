import { Document } from 'mongoose';

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

export interface IRepeatRuleDocument extends IRepeatRule, Document {
  createdAt: Date;
  updatedAt: Date;
}
