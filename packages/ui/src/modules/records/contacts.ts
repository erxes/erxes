import type { UseQueryOptions } from '@tanstack/react-query';

/** What a customer reads as: core's `Customer` has these fields and more. */
export interface CustomerContact {
  id: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  avatarUrl: string | null;
}

/** What a company reads as: core's `Company` has these fields and more. */
export interface CompanyContact {
  id: string;
  primaryName: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  avatarUrl: string | null;
}

type ContactQuery<T> = UseQueryOptions<T, Error, T>;

/**
 * Where customers and companies come from, as TanStack query options. erxes-ui knows nothing
 * of core: web and plugin UIs pass `contactQueries` from `@erxes/core-contract/client`.
 */
export interface ContactQueries {
  customer: (id: string) => ContactQuery<CustomerContact>;
  company: (id: string) => ContactQuery<CompanyContact>;
}

/** The customer or company types `ContactLink` shows. */
export type TContactContentType = 'core:customer' | 'core:company';

/** A customer's name, else its email or phone. */
export const customerTitle = (
  customer: Pick<
    CustomerContact,
    'firstName' | 'middleName' | 'lastName' | 'primaryEmail' | 'primaryPhone'
  >,
) =>
  [customer.firstName, customer.middleName, customer.lastName].filter(Boolean).join(' ') ||
  customer.primaryEmail ||
  customer.primaryPhone ||
  '';

/** A company's name, else its email or phone. */
export const companyTitle = (
  company: Pick<CompanyContact, 'primaryName' | 'primaryEmail' | 'primaryPhone'>,
) => company.primaryName || company.primaryEmail || company.primaryPhone || '';
