import { Schema } from 'mongoose';
import { field } from './utils';
import { RULE_TYPES, EXPIRY_TYPES, DISCOUNT_TYPES } from './constants';

export interface IPrice {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct: string;
}

export interface IQuantity {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct: string;
}

export interface IExpiry {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct: string;
}

export interface IRepeatValue {
  label: string;
  value: string;
}

export interface IRepeat {
  type: string;
  weekValue: IRepeatValue[];
  monthValue: IRepeatValue[];
  yearStartValue: Date;
  yearEndValue: Date;
}

export const priceSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, enum: RULE_TYPES.ALL }),
  value: field({ type: Number }),
  discountType: field({
    type: String,
    enum: DISCOUNT_TYPES.ALL,
    default: DISCOUNT_TYPES.DEFAULT
  }),
  discountValue: field({ type: Number }),
  discountBonusProduct: field({ type: String })
});

export const quantitySchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, enum: RULE_TYPES.ALL }),
  value: field({ type: Number }),
  discountType: field({
    type: String,
    enum: DISCOUNT_TYPES.ALL,
    default: DISCOUNT_TYPES.DEFAULT
  }),
  discountValue: field({ type: Number }),
  discountBonusProduct: field({ type: String })
});

export const expirySchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, enum: EXPIRY_TYPES.ALL }),
  value: field({ type: Number }),
  discountType: field({
    type: String,
    enum: DISCOUNT_TYPES.ALL,
    default: DISCOUNT_TYPES.DEFAULT
  }),
  discountValue: field({ type: Number }),
  discountBonusProduct: field({ type: String })
});

export const repeatValueSchema = new Schema({
  label: field({ type: String }),
  value: field({ type: String })
});

export const repeatSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String }),
  dayStartValue: field({ type: Date }),
  dayEndValue: field({ type: Date }),
  weekValue: field({ type: [repeatValueSchema] }),
  monthValue: field({ type: [repeatValueSchema] }),
  yearStartValue: field({ type: Date }),
  yearEndValue: field({ type: Date })
});
