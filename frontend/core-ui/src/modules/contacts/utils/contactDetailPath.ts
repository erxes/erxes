import { ContactsPath } from '@/types/paths/ContactsPath';

export type TContactContentType =
  | 'core:customer'
  | 'core:company'
  | 'core:cpUser';

const CONTACT_CONTENT_TYPES = new Set([
  'core:customer',
  'core:company',
  'core:cpUser',
]);

export const isContactContentType = (
  contentType: string,
): contentType is TContactContentType => CONTACT_CONTENT_TYPES.has(contentType);

/** The list a contact belongs to; a customer opened among leads stays there. */
export const getContactListPath = (
  contentType: TContactContentType,
  pathname: string,
) => {
  if (contentType === 'core:cpUser') {
    return `${ContactsPath.Index}${ContactsPath.ClientPortalUsers}`;
  }
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
) =>
  `${getContactListPath(contentType, pathname)}/${encodeURIComponent(
    contentId,
  )}`;
