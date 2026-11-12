/**
 * The address to show a stored file at. Core's file storage returns addresses
 * that are already URLs (`/core/v1/files/<id>/download`), so they pass as is.
 */
export const readImage = (value?: string | null) => value ?? '';
