import { TContactKind } from './constants';

// One record ↔ contact link: e.g. deal `d1` ↔ customer `c1`.
export interface IContactLink {
  contentType: string;
  contentId: string;
  kind: TContactKind;
  contactId: string;
}

/**
 * What core sends a plugin (tRPC `contactFields.sync`) when record ↔ contact
 * links change:
 * - `link` / `unlink`: these links were made / are gone;
 * - `merge`: contacts `oldIds` became `newId`;
 * - `remove`: contacts `ids` were deleted.
 */
export type TContactFieldsSync =
  | { action: 'link' | 'unlink'; links: IContactLink[] }
  | { action: 'merge'; kind: TContactKind; oldIds: string[]; newId: string }
  | { action: 'remove'; kind: TContactKind; ids: string[] };

// The two contact fields a record keeps.
export interface IContactFields {
  customerIds?: string[];
  companyIds?: string[];
}
