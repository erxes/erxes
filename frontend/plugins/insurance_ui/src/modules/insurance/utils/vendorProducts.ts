import type { InsuranceVendorProduct } from '../types';

export type OfferedProduct = InsuranceVendorProduct & {
  product: NonNullable<InsuranceVendorProduct['product']>;
};

// An offered product whose product was deleted resolves to null; it has
// nothing to show, price or remove.
export const hasProduct = (
  offered: InsuranceVendorProduct,
): offered is OfferedProduct => offered.product !== null;
