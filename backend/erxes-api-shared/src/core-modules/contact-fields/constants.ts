export const CUSTOMER_CONTENT_TYPE = 'core:customer';
export const COMPANY_CONTENT_TYPE = 'core:company';

export type TContactKind = 'customer' | 'company';

export const CONTACT_KIND_BY_CONTENT_TYPE: Record<string, TContactKind> = {
  [CUSTOMER_CONTENT_TYPE]: 'customer',
  [COMPANY_CONTENT_TYPE]: 'company',
};

// A record keeps at most one customer and one company.
export const CONTACT_FIELD_BY_KIND = {
  customer: 'customerId',
  company: 'companyId',
} as const;
