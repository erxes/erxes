import { z } from 'zod';

const Row = z.record(z.string(), z.unknown());

const Text = z.string();

/**
 * The fields record tables read from a row's data: its id (`_id` on records from old
 * GraphQL plugins, `id` on core REST records), a pagination cursor and a tree order.
 * A field that isn't text reads as missing; the others still count.
 */
export const readRow = (original: unknown) => {
  const parsed = Row.safeParse(original);

  if (!parsed.success) return {};

  const [legacyId, id, cursor, order] = ['_id', 'id', 'cursor', 'order'].map(
    (key) => Text.safeParse(parsed.data[key]).data,
  );

  return { id: legacyId ?? id, cursor, order };
};
