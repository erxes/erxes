import {
  DiscountType,
  PriceAdjustType,
} from '@/pricing/edit-pricing/components';

export interface FixedPricingFormRow {
  _id?: string;
  productId: string;
  sortField?: string;
  uom: string;
  unitPrice: number;
  newPrice: number;
}

export interface CommonRuleFormValues {
  discountType: DiscountType;
  discountValue: number;
  priceAdjustType: PriceAdjustType;
  priceAdjustFactor: number;
  bonusProductId: string | null;
  fixedValues: FixedPricingFormRow[];
}
