export const CUSTOMER_CONTENT_TYPE = 'core:customer';
export const COMPANY_CONTENT_TYPE = 'core:company';

export type TContactKind = 'customer' | 'company';

export const CONTACT_KIND_BY_CONTENT_TYPE: Record<string, TContactKind> = {
  [CUSTOMER_CONTENT_TYPE]: 'customer',
  [COMPANY_CONTENT_TYPE]: 'company',
};

export const CONTACT_FIELD_BY_KIND = {
  customer: 'customerIds',
  company: 'companyIds',
} as const;

/**
 * Plugin records that keep their contacts on themselves as `customerIds` /
 * `companyIds`, by content type, with the plugin that owns them. Core tells
 * that plugin whenever one of these records gains or loses a contact
 * relation, so the fields stay in step with `relations`.
 */
export const CONTACT_FIELD_RECORD_PLUGINS: Record<string, string> = {
  'sales:deal': 'sales',
  'frontline:ticket': 'frontline',
  'operation:task': 'operation',
  'car:car': 'car',
  // Cars related before the content type was renamed.
  'cars:car': 'car',
};
