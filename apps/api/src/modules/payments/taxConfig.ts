import { type Db, ebarimtSettings } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { notFound } from '~/http/errors';

/** The eBarimt config an invoice names, checked to exist; null: the default issues. 404. */
export const ebarimtIdOf = async (tx: Db, id: string | undefined) => {
  if (!id) return null;

  const [row] = await tx
    .select({ id: ebarimtSettings.id })
    .from(ebarimtSettings)
    .where(eq(ebarimtSettings.id, id))
    .limit(1);

  if (!row) throw notFound('eBarimt config');

  return row.id;
};
