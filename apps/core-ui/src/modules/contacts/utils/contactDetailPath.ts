export enum ContactsPath {
  Index = '/contacts',
  Customers = '/customers',
  Leads = '/leads',
  Companies = '/companies',
}

export type TContactContentType = 'core:customer' | 'core:company';

export const isContactContentType = (contentType: string): contentType is TContactContentType =>
  contentType === 'core:customer' || contentType === 'core:company';

/** The list a contact belongs to; a customer opened among leads stays there. */
export const getContactListPath = (contentType: TContactContentType, pathname: string) => {
  if (contentType === 'core:company') {
    return `${ContactsPath.Index}${ContactsPath.Companies}`;
  }

  const leads = `${ContactsPath.Index}${ContactsPath.Leads}`;

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
