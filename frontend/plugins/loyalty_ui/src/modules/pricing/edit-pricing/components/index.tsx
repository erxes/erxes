export type DiscountType =
  | 'default'
  | 'fixed'
  | 'subtraction'
  | 'percentage'
  | 'bonus';

export const DISCOUNT_TYPES: { value: DiscountType; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'subtraction', label: 'Subtraction' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'bonus', label: 'Bonus' },
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
  { value: 'none', label: 'None' },
  { value: 'round', label: 'Round' },
  { value: 'floor', label: 'Floor' },
  { value: 'ceil', label: 'Ceil' },
  { value: 'truncate', label: 'Truncate' },
  { value: 'endsWith9', label: 'Ends With 9' },
];

export const PRICING_STEPS = [
  { value: 'general', title: 'General' },
  { value: 'options', title: 'Options' },
  { value: 'price', title: 'Price' },
  { value: 'quantity', title: 'Quantity' },
  { value: 'repeat', title: 'Repeat' },
  { value: 'expiry', title: 'Expiry' },
];
