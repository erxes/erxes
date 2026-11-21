import { files, withOrg } from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { storage } from '~/modules/files/storage';

/** A stored file sent with an email, as nodemailer takes it. */
export interface FileAttachment {
  filename: string;
  contentType: string;
  content: Buffer;
}

/** An attached file is gone: the email can't be sent as written, so it isn't retried. */
export class AttachmentMissing extends Error {}

/**
 * The ready files' bytes for an email, in the order given. The rows are read in
 * a short scope and the bytes after it: call it outside any scope. A file deleted
 * since it was attached throws `AttachmentMissing`.
 */
export const readAttachments = async (
  orgId: string,
  ids: readonly string[],
): Promise<FileAttachment[]> => {
  if (!ids.length) return [];

  const rows = await withOrg(orgId, (tx) =>
    tx
      .select({ id: files.id, key: files.key, name: files.name, contentType: files.contentType })
      .from(files)
      .where(and(eq(files.status, 'ready'), inArray(files.id, [...ids]))),
  );

  const byId = new Map(rows.map((row) => [row.id, row]));
  const missing = ids.find((id) => !byId.has(id));

  if (missing) throw new AttachmentMissing(`The attached file ${missing} was deleted`);

  return Promise.all(
    ids
      .flatMap((id) => byId.get(id) ?? [])
      .map(async ({ key, name, contentType }) => ({
        filename: name,
        contentType,
        content: await storage().read(key),
      })),
  );
};
