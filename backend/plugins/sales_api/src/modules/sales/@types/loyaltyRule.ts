import { Document } from 'mongoose';
import { TLoyaltyRule, TLoyaltyTierRule } from '../utils/loyaltyRules';

export type ILoyaltyRule = Omit<TLoyaltyRule, '_id'> & { _id?: string };

export interface ILoyaltyRuleDocument
  extends Omit<TLoyaltyRule, '_id'>,
    Document {
  _id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ILoyaltyTierRule = Omit<TLoyaltyTierRule, '_id'> & {
  _id?: string;
};

export interface ILoyaltyTierRuleDocument
  extends Omit<TLoyaltyTierRule, '_id'>,
    Document {
  _id: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
