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
