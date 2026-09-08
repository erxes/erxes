import { Document } from 'mongoose';

export type SeniorityRuleValueType = 'fixed' | 'percentOfBaseSalary';

export interface ISeniorityRuleBracket {
  minMonths: number;
  maxMonths?: number;
  value: number;
}

export interface ISeniorityRule {
  code: string;
  name: string;
  description?: string;
  valueType: SeniorityRuleValueType;
  brackets: ISeniorityRuleBracket[];
  status: string;
  effectiveDate?: Date;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISeniorityRuleDocument extends ISeniorityRule, Document {
  _id: string;
}
