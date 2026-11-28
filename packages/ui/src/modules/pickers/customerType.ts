/**
 * Who a plugin record is about: a customer, a company or a team member.
 * 3.x's names; a record keeps the kind beside the id (`customerType`, `customerId`).
 */
export const CustomerType = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  USER: 'user',
} as const;

/** A kind `CustomerType` lists: `'customer'`, `'company'` or `'user'`. */
export type CustomerType = (typeof CustomerType)[keyof typeof CustomerType];
