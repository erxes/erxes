import type { ContentType } from '@erxes/core-contract';
import { CONTACT_SETTINGS } from '~/modules/contacts/settings/paths';

/** Route base of the properties settings pages. */
export const PROPERTIES_BASE_PATH = CONTACT_SETTINGS.properties;

/** Record types with properties; `i18nKey` is its `content-type.*` key. */
export const PROPERTY_TYPES = [
  { contentType: 'customer', i18nKey: 'core-customer', description: 'Customer' },
  { contentType: 'company', i18nKey: 'core-company', description: 'Company' },
] as const satisfies readonly { contentType: ContentType; i18nKey: string; description: string }[];

export const isPropertyType = (value: string | undefined): value is ContentType =>
  PROPERTY_TYPES.some((type) => type.contentType === value);
