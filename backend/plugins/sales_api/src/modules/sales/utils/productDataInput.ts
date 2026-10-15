import type { IProductData } from '../@types/deal';

export const validateProductDataInput = (product: IProductData): void => {
  if (typeof product.productId !== 'string' || !product.productId.trim()) {
    throw new Error('Product productId must be a non-empty string');
  }

  if (
    product.uomInfo != null &&
    (typeof product.uomInfo !== 'object' || Array.isArray(product.uomInfo))
  ) {
    throw new Error('Product uomInfo must be an object');
  }

  if (product.uomInfo?.uom != null && typeof product.uomInfo.uom !== 'string') {
    throw new Error('Product uomInfo.uom must be a string');
  }

  // Entry-unit values can supply price and quantity; the UOM normalizer
  // converts them to base units and validates the saved ratio before writing.
  for (const field of ['unitPrice', 'quantity'] as const) {
    const value = product.uomInfo?.[field] ?? product[field];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`Product ${field} must be a finite number`);
    }
  }

  for (const field of [
    'unitPrice',
    'quantity',
    'globalUnitPrice',
    'unitPricePercent',
  ] as const) {
    if (product[field] != null && !Number.isFinite(product[field])) {
      throw new Error(`Product ${field} must be a finite number`);
    }
  }

  // Keep legacy rows without currency/UOM valid: their existing defaults and
  // catalog lookup belong to the normalizers, not to the JSON input guard.
  for (const field of ['currency', 'uom'] as const) {
    if (product[field] != null && typeof product[field] !== 'string') {
      throw new Error(`Product ${field} must be a string`);
    }
  }
};
