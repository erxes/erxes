import { paths } from '~/lib/paths';

export type TContactContentType = 'core:customer' | 'core:company';

const within = (pathname: string, list: string) =>
  pathname === list || pathname.startsWith(`${list}/`);

/** The list a contact belongs to; a customer opened among leads stays there. */
export const getContactListPath = (contentType: TContactContentType, pathname: string) => {
  if (contentType === 'core:company') {
    return within(pathname, paths.contacts.companyLeads)
      ? paths.contacts.companyLeads
      : paths.contacts.companies;
  }

  return within(pathname, paths.contacts.leads) ? paths.contacts.leads : paths.contacts.customers;
};

/** The contact's own page, where the side panel's expand button leads. */
export const getContactDetailPath = (
  contentType: TContactContentType,
  contentId: string,
  pathname: string,
) => {
  const list = getContactListPath(contentType, pathname);

  if (list === paths.contacts.companyLeads) return paths.contacts.companyLead(contentId);

  if (list === paths.contacts.companies) return paths.contacts.company(contentId);

  return list === paths.contacts.leads
    ? paths.contacts.lead(contentId)
    : paths.contacts.customer(contentId);
};
