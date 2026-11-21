import { CORE_API_PREFIX } from '@erxes/core-contract';
import { files } from '@erxes/core-db';
import { getTableColumns, sql } from 'drizzle-orm';

/**
 * A file with its stable address, `/core/v1/files/<id>/download`, and a public picture's
 * address for anyone, `/core/v1/files/public/<id>`.
 */
export const fileWithUrl = {
  ...getTableColumns(files),
  url: sql<string>`${`${CORE_API_PREFIX}/files/`} || ${files.id} || '/download'`.as('url'),
  publicUrl: sql<
    string | null
  >`case when ${files.public} then ${`${CORE_API_PREFIX}/files/public/`} || ${files.id} end`.as(
    'public_url',
  ),
};
