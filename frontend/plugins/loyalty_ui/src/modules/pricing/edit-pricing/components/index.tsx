export type DiscountType =
  | 'default'
  | 'fixed'
  | 'subtraction'
  | 'percentage'
  | 'bonus';

export const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
  { value: 'default', label: 'default' },
  { value: 'fixed', label: 'fixed' },
  { value: 'subtraction', label: 'subtraction' },
  { value: 'percentage', label: 'percentage' },
  { value: 'bonus', label: 'bonus' },
];

export type PriceAdjustType =
  | 'none'
  | 'round'
  | 'floor'
  | 'ceil'
  | 'truncate'
  | 'endsWith9';

export const PRICE_ADJUST_TYPES: {
  value: PriceAdjustType;
  label: string;
}[] = [
  { value: 'none', label: 'none' },
  { value: 'round', label: 'round' },
  { value: 'floor', label: 'floor' },
  { value: 'ceil', label: 'ceil' },
  { value: 'truncate', label: 'truncate' },
  { value: 'endsWith9', label: 'ends-with-9' },
];

export const PRICING_STEPS = [
  { value: 'general', title: 'general' },
  { value: 'options', title: 'options' },
  { value: 'rules', title: 'rules' },
];
