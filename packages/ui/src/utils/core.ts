/** A URL with a scheme (`https:`, `data:`, `blob:`) or a path on this site. */
const ADDRESS = /^([a-z][a-z0-9+.-]*:|\/)/i;

/**
 * The address to show a stored file at. Core's file storage returns addresses
 * (`/core/v1/files/<id>/download`), which pass as is. Records brought over from
 * erxes 3.x keep its bare storage keys; core reads those in place at `read-file`.
 */
export const readImage = (value?: string | null) => {
  if (!value || ADDRESS.test(value)) return value ?? '';

  return `/core/v1/read-file?key=${encodeURIComponent(value)}`;
};
