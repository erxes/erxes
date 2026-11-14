import { CORE_API_PREFIX } from '@erxes/core-contract';
import {
  actorOf,
  caller,
  type Db,
  files,
  newId,
  requestOrgId,
  sourceOf,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, getTableColumns, inArray, lt, sql } from 'drizzle-orm';
import { config } from '~/config';
import { callerCan } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { randomToken } from '~/lib/crypto';
import { lockRows } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { inOrder } from '~/lib/sequence';
import { recordAudit } from '~/modules/audit/audit.service';
import { assertUploadAllowed, fileSettingsOf } from './fileSettings';
import { canShowInline, storage } from './storage';
import { logger } from '~/logger';
import { guardDeletions } from '~/lib/deletionGuard';

const log = logger.child({ component: 'files' });

type FileRow = typeof files.$inferSelect;

/** A file with its stable address, `/core/v1/files/<id>/download`. */
const fileWithUrl = {
  ...getTableColumns(files),
  url: sql<string>`${`${CORE_API_PREFIX}/files/`} || ${files.id} || '/download'`.as('url'),
};

/** Where an upload's bytes wait until core has checked them: a fresh name per upload. */
const uploadKey = (orgId: string, id: string) => `uploads/${orgId}/${id}/${randomToken(12, 'hex')}`;

/** `<org>/<yyyy>/<mm>/<id>`: grouped by organisation and month, never from user input. */
const storageKey = (orgId: string, id: string) => {
  const now = new Date();

  return `${orgId}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${id}`;
};

/** The `source`, `actor_type` and `actor_id` of a file the caller stores. */
const uploadedBy = () => {
  const who = caller();

  return { source: sourceOf(who), ...actorOf(who) };
};

/**
 * Step 1 of an upload: checks the file against the organisation's settings,
 * records it as pending and returns where to send the bytes.
 */
export const createUpload = async (
  client: Db,
  input: { name: string; contentType: string; size: number },
) => {
  assertUploadAllowed(await fileSettingsOf(client), input);

  const id = newId();
  // The upload link writes here; the file's own key is only written by core, after checking.
  const key = uploadKey(requestOrgId(), id);
  const expiresIn = config.files.linkTtlSeconds;

  const target = await storage().uploadTarget(key, {
    contentType: input.contentType,
    size: input.size,
    expiresIn,
  });

  const row = oneRow(
    await client
      .insert(files)
      .values({
        id,
        key,
        name: input.name,
        contentType: input.contentType,
        size: input.size,
        status: 'pending',
        ...uploadedBy(),
      })
      .returning(fileWithUrl),
  );

  return {
    file: row,
    upload: {
      method: 'PUT' as const,
      url: target.url,
      headers: target.headers,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    },
  };
};

const findFile = async (client: Db, id: string) => {
  const [row] = await client.select(fileWithUrl).from(files).where(eq(files.id, id)).limit(1);

  if (!row) {
    throw notFound('File');
  }

  return row;
};

const isUploader = (row: FileRow) => {
  const { actorType, actorId } = actorOf(caller());

  return row.actorType === actorType && row.actorId === actorId;
};

/**
 * Step 2: once the bytes are sent, core checks them and promotes exactly
 * those bytes to the file's own key, then marks it ready. The row is locked:
 * a second completion waits and returns the ready file (one audit entry), and
 * the cleanup of unfinished uploads can't take a file being completed.
 */
export const completeUpload = async (client: Db, id: string) => {
  await lockRows(client, 'core_files', [id]);

  const row = await findFile(client, id);

  if (!isUploader(row) || row.status === 'deleting') {
    throw notFound('File');
  }

  if (row.status === 'ready') {
    return row;
  }

  const stored = await storage().stat(row.key);

  if (!stored) {
    throw fail('UPLOAD_INCOMPLETE', 'The file has not been uploaded yet');
  }

  if (stored.size !== row.size) {
    await storage().remove(row.key);
    throw fail(
      'UPLOAD_INCOMPLETE',
      'The uploaded file does not match the declared size; upload it again',
    );
  }

  const finalKey = storageKey(requestOrgId(), id);

  try {
    await storage().promote(row.key, finalKey, stored);
  } catch {
    throw fail('UPLOAD_CHANGED', 'The file changed while it was being checked; upload it again');
  }

  const ready = oneRow(
    await client
      .update(files)
      .set({ status: 'ready', key: finalKey, updatedAt: sql`now()` })
      .where(and(eq(files.id, id), eq(files.status, 'pending')))
      .returning(fileWithUrl),
  );

  await recordAudit(client, {
    action: 'file.uploaded',
    targetType: 'file',
    targetId: id,
    targetLabel: row.name,
    metadata: { contentType: row.contentType, size: row.size },
  });

  return ready;
};

/** A ready file and a short-lived link to read it. */
export const getFile = async (client: Db, id: string) => {
  const row = await findFile(client, id);

  if (row.status === 'deleting') throw notFound('File');

  if (row.status !== 'ready') {
    return { ...row, downloadUrl: null };
  }

  return { ...row, downloadUrl: await downloadUrlOf(row, false) };
};

export const downloadUrlOf = (row: FileRow, forceDownload: boolean) =>
  storage().downloadUrl(row.key, {
    name: row.name,
    contentType: row.contentType,
    inline: !forceDownload && canShowInline(row.contentType),
    expiresIn: config.files.linkTtlSeconds,
  });

/** For `GET /files/:id/download`: the ready file in the caller's organisation. */
export const readyFile = async (client: Db, id: string) => {
  const row = await findFile(client, id);

  if (row.status !== 'ready') {
    throw notFound('File');
  }

  return row;
};

export const listFiles = async (client: Db, ids: string[]) => {
  const wanted = unique(ids);

  if (!wanted.length) {
    return { data: [] };
  }

  const rows = await client
    .select(fileWithUrl)
    .from(files)
    .where(and(eq(files.status, 'ready'), inArray(files.id, wanted)));

  const byId = new Map(rows.map((row) => [row.id, row]));

  return { data: wanted.flatMap((id) => byId.get(id) ?? []) };
};

/** The uploader may delete a file, and so may members allowed to moderate files. */
const assertCanRemove = (row: FileRow) => {
  if (!isUploader(row) && !callerCan('files.moderate')) {
    throw fail(
      'NOT_ALLOWED',
      'Only the uploader or someone who moderates files can delete this file',
    );
  }
};

/**
 * The uploader can delete a file; so can members allowed to moderate files.
 * The row is kept as a tombstone (`deleting`) until storage confirms the
 * bytes are gone; a failed removal is retried by the cleanup, never lost.
 */
export const removeFile = async (client: Db, id: string) => {
  const row = await findFile(client, id);

  if (row.status === 'deleting') throw notFound('File');

  assertCanRemove(row);

  await guardDeletions(client, 1, 'files');

  const [claimed] = await client
    .update(files)
    .set({ status: 'deleting', updatedAt: sql`now()` })
    .where(and(eq(files.id, id), sql`${files.status} <> 'deleting'`))
    .returning();

  if (!claimed) throw notFound('File');

  if (row.status === 'ready') {
    await recordAudit(client, {
      action: 'file.deleted',
      targetType: 'file',
      targetId: id,
      targetLabel: row.name,
    });
  }

  return { ok: true as const };
};

/**
 * Finishes deletions: removes the bytes of `deleting` files, then their rows.
 * Storage is called between two short system scopes, never inside one. A
 * storage failure leaves the tombstone for the next run (all organisations).
 */
export const purgeDeletedFiles = async (olderThanSeconds = 0) => {
  const rows = await withSystem('files: deletions to purge', (tx) =>
    tx
      .select({ id: files.id, key: files.key })
      .from(files)
      .where(
        and(
          eq(files.status, 'deleting'),
          lt(files.updatedAt, sql`now() - make_interval(secs => ${olderThanSeconds})`),
        ),
      )
      .limit(500),
  );

  const removed: string[] = [];

  // One object at a time: the store never gets 500 deletes at once.
  await inOrder(rows, async (row) => {
    try {
      await storage().remove(row.key);
      removed.push(row.id);
    } catch (error) {
      log.error({ key: row.key, err: error }, 'could not delete stored file; will retry');
    }
  });

  if (!removed.length) return 0;

  const deleted = await withSystem('files: purge rows', (tx) =>
    tx
      .delete(files)
      .where(and(inArray(files.id, removed), eq(files.status, 'deleting')))
      .returning({ id: files.id }),
  );

  return deleted.length;
};

/**
 * Unfinished uploads past their time are claimed (`pending` → `deleting`, a
 * conditional update a completion in progress blocks); `purgeDeletedFiles`
 * removes them after.
 */
export const pruneUploads = async (client: Db, hours: number) => {
  const claimed = await client.execute(sql`
    update ${files} set status = 'deleting', updated_at = now()
    where id in (
      select id from ${files}
      where status = 'pending' and created_at < now() - make_interval(hours => ${hours})
      limit 500
      for update skip locked
    )
  `);

  return claimed.rowCount ?? 0;
};

/**
 * A file core made itself (an export): stored under core's own key and ready
 * at once — no upload link ever existed for it. Downloads go through
 * `/files/:id/download` like any other file. The bytes are written before
 * the row's own short scope: call it outside any scope.
 */
export const storeServerFile = async (
  orgId: string,
  input: { name: string; contentType: string; body: Buffer },
) => {
  const id = newId();
  const key = storageKey(orgId, id);

  await storage().write(key, input.body, input.contentType);

  return withOrg(orgId, async (tx) =>
    oneRow(
      await tx
        .insert(files)
        .values({
          id,
          key,
          name: input.name,
          contentType: input.contentType,
          size: input.body.length,
          status: 'ready',
          ...uploadedBy(),
        })
        .returning(),
    ),
  );
};

/**
 * A ready file's bytes (imports read the uploaded file with it). The row is
 * read in a short scope and the bytes after it: call it outside any scope.
 */
export const readFileBytes = async (orgId: string, id: string) => {
  const row = await withOrg(orgId, (tx) => readyFile(tx, id));

  return { row, body: await storage().read(row.key) };
};
