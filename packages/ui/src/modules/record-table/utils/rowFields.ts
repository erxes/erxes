import { z } from 'zod';

const field = z.string().optional().catch(undefined);

const rowFields = z.object({ _id: field, id: field, cursor: field, order: field });

/**
 * The fields record tables read from a row's data: its id (`_id` on records from old
 * GraphQL plugins, `id` on core REST records), a pagination cursor and a tree order.
 */
export const readRow = (original: unknown) => {
  const parsed = rowFields.safeParse(original);

  if (!parsed.success) return {};

  const { _id: legacyId, id, cursor, order } = parsed.data;

  return { id: legacyId ?? id, cursor, order };
};
