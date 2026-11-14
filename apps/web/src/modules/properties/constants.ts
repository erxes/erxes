import type { FieldContentType } from '@erxes/core-contract';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';
import { PRODUCT_SETTINGS } from '~/modules/products/paths';

/**
 * Record types with properties: the app settings that list them (`basePath`)
 * and their `content-type.*` label key.
 */
export const PROPERTY_TYPES = {
  customer: { basePath: CONTACT_SETTINGS.properties, i18nKey: 'core-customer', label: 'Customer' },
  company: { basePath: CONTACT_SETTINGS.properties, i18nKey: 'core-company', label: 'Company' },
  product: {
    basePath: PRODUCT_SETTINGS.properties,
    i18nKey: 'core-product',
    label: 'Product & Service',
  },
} as const satisfies Record<FieldContentType, { basePath: string; i18nKey: string; label: string }>;

/** The record types Contacts › Settings › Properties lists. */
export const CONTACT_PROPERTY_TYPES = ['customer', 'company'] as const;

/** A record type's properties page (its fields and groups). */
export const propertiesPath = (contentType: FieldContentType) =>
  `${PROPERTY_TYPES[contentType].basePath}/${contentType}`;

/** Whether `value` is one of `types` (the record types one settings area lists). */
export const isPropertyType = (
  types: readonly FieldContentType[],
  value: string | undefined,
): value is FieldContentType => types.some((type) => type === value);
