import { TContactKind } from './constants';

/**
 * What a plugin declares in `startPlugin({ meta: { contactFields } })`: its
 * record types that keep their contact on themselves as `customerId` /
 * `companyId`. The plugin saves those fields itself; core only tells it
 * (tRPC `contactFields.sync`) when a contact is merged or removed.
 */
export interface IContactFieldsMeta {
  // e.g. `['sales:deal']`; old names records were related under, too.
  contentTypes: string[];
}

/**
 * A contact change core broadcasts to every plugin declaring
 * `meta.contactFields` (tRPC `contactFields.sync`):
 * - `merge`: contacts `oldIds` became `newId`;
 * - `remove`: contacts `ids` were deleted.
 */
export type TContactFieldsSync =
  | { action: 'merge'; kind: TContactKind; oldIds: string[]; newId: string }
  | { action: 'remove'; kind: TContactKind; ids: string[] };

// The record's one customer and one company; `null` for none.
export interface IContactFields {
  customerId?: string | null;
  companyId?: string | null;
}
