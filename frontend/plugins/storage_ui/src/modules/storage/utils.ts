import { IProductRef } from './types';

/** One key per user action, so a retried request is applied only once. */
export const newRequestKey = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Splits reader output (one EPC per line, or separated by commas or spaces). */
export const parseEpcList = (text: string) =>
  [...new Set(text.split(/[\s,;]+/).map((e) => e.trim().toUpperCase()).filter(Boolean))];

export const productLabel = (productId: string, product?: IProductRef | null) =>
  product?.name ? `${product.code ? `${product.code} — ` : ''}${product.name}` : productId;

export const singleValue = (value: string | string[] | undefined | null) =>
  (Array.isArray(value) ? value[0] : value) || '';
