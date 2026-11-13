export enum ContactsPath {
  Index = '/contacts',
  Customers = '/customers',
  Leads = '/leads',
  Companies = '/companies',
}

export type TContactContentType = 'core:customer' | 'core:company';

/** The list a contact belongs to; a customer opened among leads stays there. */
export const getContactListPath = (contentType: TContactContentType, pathname: string) => {
  const leads = `${ContactsPath.Index}${ContactsPath.Leads}`;

  if (contentType === 'core:company') {
    const companyLeads = `${leads}/companies`;

    return pathname === companyLeads || pathname.startsWith(`${companyLeads}/`)
      ? companyLeads
      : `${ContactsPath.Index}${ContactsPath.Companies}`;
  }

  return pathname === leads || pathname.startsWith(`${leads}/`)
    ? leads
    : `${ContactsPath.Index}${ContactsPath.Customers}`;
};

/** The contact's own page, where the side panel's expand button leads. */
export const getContactDetailPath = (
  contentType: TContactContentType,
  contentId: string,
  pathname: string,
) => `${getContactListPath(contentType, pathname)}/${encodeURIComponent(contentId)}`;
