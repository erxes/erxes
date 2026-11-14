import type { FieldContentType } from '@erxes/core-contract';

/** Record types with properties: their `content-type.*` label key. */
export const PROPERTY_TYPES = {
  customer: { i18nKey: 'core-customer', label: 'Customer' },
  company: { i18nKey: 'core-company', label: 'Company' },
  product: { i18nKey: 'core-product', label: 'Product & Service' },
} as const satisfies Record<FieldContentType, { i18nKey: string; label: string }>;

/** The record types Contacts › Settings › Properties lists. */
export const CONTACT_PROPERTY_TYPES = ['customer', 'company'] as const;

/** Whether `value` is one of `types` (the record types one settings area lists). */
export const isPropertyType = (
  types: readonly FieldContentType[],
  value: string | undefined,
): value is FieldContentType => types.some((type) => type === value);
