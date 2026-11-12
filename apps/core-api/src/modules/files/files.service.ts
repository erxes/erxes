import type { FileInfo } from '@erxes/core-contract';
import { randomBytes } from 'node:crypto';
import { CORE_API_PREFIX } from '@erxes/core-contract';
import { type Db, files, newId } from '@erxes/core-db';
import { and, eq, inArray, lt, sql } from 'drizzle-orm';
import { config } from '~/config';
import type { Actor, Caller } from '~/http/auth';
import { can } from '~/http/access';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { lockRows } from '~/lib/locks';
import { oneRow } from '~/lib/rows';
import { recordAudit } from '~/modules/audit/audit.service';
import { assertUploadAllowed, fileSettingsOf } from './fileSettings';
import { canShowInline, storage } from './storage';
import { logger } from '~/logger';
import { guardDeletions } from '~/lib/deletionGuard';

const log = logger.child({ component: 'files' });

type FileRow = typeof files.$inferSelect;

const downloadPath = (id: string) => `${CORE_API_PREFIX}/files/${id}/download`;

const toFileDto = (row: FileRow): FileInfo => ({
  id: row.id,
  name: row.name,
  contentType: row.contentType,
  size: row.size,
  // Deleting files are never listed; to callers they are gone.
  status: row.status === 'ready' ? 'ready' : 'pending',
  source: row.source,
  uploadedBy: { type: row.actorType, id: row.actorId },
  url: downloadPath(row.id),
  createdAt: row.createdAt.toISOString(),
});

/** Where an upload's bytes wait until core has checked them: a fresh name per upload. */
const uploadKey = (orgId: string, id: string) =>
  `uploads/${orgId}/${id}/${randomBytes(12).toString('hex')}`;

/** `<org>/<yyyy>/<mm>/<id>`: grouped by organisation and month, never from user input. */
const storageKey = (orgId: string, id: string) => {
  const now = new Date();

  return `${orgId}/${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${id}`;
};

/**
 * Step 1 of an upload: checks the file against the organisation's settings,
 * records it as pending and returns where to send the bytes.
 */
export const createUpload = async (
  client: Db,
  caller: Caller,
  input: { name: string; contentType: string; size: number },
) => {
  assertUploadAllowed(await fileSettingsOf(client, caller.orgId), input);

  const id = newId();
  // The upload link writes here; the file's own key is only written by core, after checking.
  const key = uploadKey(caller.orgId, id);
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
        orgId: caller.orgId,
        key,
        name: input.name,
        contentType: input.contentType,
        size: input.size,
        status: 'pending',
        source: caller.source,
        actorType: caller.actorType,
        actorId: caller.actorId,
      })
      .returning(),
  );

  return {
    file: toFileDto(row),
    upload: {
      method: 'PUT' as const,
      url: target.url,
      headers: target.headers,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    },
  };
};

const findFile = async (client: Db, orgId: string, id: string) => {
  const [row] = await client
    .select()
    .from(files)
    .where(and(eq(files.orgId, orgId), eq(files.id, id)))
    .limit(1);

  if (!row) {
    throw notFound('File');
  }

  return row;
};

const isUploader = (row: FileRow, caller: Caller) =>
  row.actorType === caller.actorType && row.actorId === caller.actorId;

/**
 * Step 2: once the bytes are sent, core checks them and promotes exactly
 * those bytes to the file's own key, then marks it ready. The row is locked:
 * a second completion waits and returns the ready file (one audit entry), and
 * the cleanup of unfinished uploads can't take a file being completed.
 */
export const completeUpload = async (client: Db, caller: Caller, id: string) =>
  client.transaction(async (tx) => {
    await lockRows(tx, 'core_files', caller.orgId, [id]);

    const row = await findFile(tx, caller.orgId, id);

    if (!isUploader(row, caller) || row.status === 'deleting') {
      throw notFound('File');
    }

    if (row.status === 'ready') {
      return toFileDto(row);
    }

    const stored = await storage().stat(row.key);

    if (!stored) {
      throw new HttpError(409, 'UPLOAD_INCOMPLETE', 'The file has not been uploaded yet');
    }

    if (stored.size !== row.size) {
      await storage().remove(row.key);
      throw new HttpError(
        409,
        'UPLOAD_INCOMPLETE',
        'The uploaded file does not match the declared size; upload it again',
      );
    }

    const finalKey = storageKey(caller.orgId, id);

    try {
      await storage().promote(row.key, finalKey, stored);
    } catch {
      throw new HttpError(
        409,
        'UPLOAD_CHANGED',
        'The file changed while it was being checked; upload it again',
      );
    }

    const ready = oneRow(
      await tx
        .update(files)
        .set({ status: 'ready', key: finalKey, updatedAt: sql`now()` })
        .where(and(eq(files.orgId, caller.orgId), eq(files.id, id), eq(files.status, 'pending')))
        .returning(),
    );

    await recordAudit(tx, caller, {
      action: 'file.uploaded',
      targetType: 'file',
      targetId: id,
      targetLabel: row.name,
      metadata: { contentType: row.contentType, size: row.size },
    });

    return toFileDto(ready);
  });

/** A ready file and a short-lived link to read it. */
export const getFile = async (client: Db, caller: Caller, id: string) => {
  const row = await findFile(client, caller.orgId, id);

  if (row.status === 'deleting') throw notFound('File');

  if (row.status !== 'ready') {
    return { ...toFileDto(row), downloadUrl: null };
  }

  return { ...toFileDto(row), downloadUrl: await downloadUrlOf(row, false) };
};

export const downloadUrlOf = (row: FileRow, forceDownload: boolean) =>
  storage().downloadUrl(row.key, {
    name: row.name,
    contentType: row.contentType,
    inline: !forceDownload && canShowInline(row.contentType),
    expiresIn: config.files.linkTtlSeconds,
  });

/** For `GET /files/:id/download`: the ready file in the caller's organisation. */
export const readyFile = async (client: Db, orgId: string, id: string) => {
  const row = await findFile(client, orgId, id);

  if (row.status !== 'ready') {
    throw notFound('File');
  }

  return row;
};

export const listFiles = async (client: Db, caller: Caller, ids: string[]) => {
  const wanted = unique(ids);

  if (!wanted.length) {
    return { data: [] };
  }

  const rows = await client
    .select()
    .from(files)
    .where(
      and(eq(files.orgId, caller.orgId), eq(files.status, 'ready'), inArray(files.id, wanted)),
    );

  const byId = new Map(rows.map((row) => [row.id, toFileDto(row)]));

  return { data: wanted.flatMap((id) => byId.get(id) ?? []) };
};

/**
 * The uploader can delete a file; so can members allowed to moderate files.
 * The row is kept as a tombstone (`deleting`) until storage confirms the
 * bytes are gone; a failed removal is retried by the cleanup, never lost.
 */
export const removeFile = async (client: Db, caller: Caller, actor: Actor | null, id: string) => {
  const row = await findFile(client, caller.orgId, id);

  if (row.status === 'deleting') throw notFound('File');

  if (!isUploader(row, caller) && !(actor && can(actor, 'files.moderate'))) {
    throw new HttpError(
      403,
      'NOT_ALLOWED',
      'Only the uploader or someone who moderates files can delete this file',
    );
  }

  await guardDeletions(client, caller, 1, 'files', actor?.role);

  const [claimed] = await client
    .update(files)
    .set({ status: 'deleting', updatedAt: sql`now()` })
    .where(and(eq(files.orgId, caller.orgId), eq(files.id, id), sql`${files.status} <> 'deleting'`))
    .returning();

  if (!claimed) throw notFound('File');

  if (row.status === 'ready') {
    await recordAudit(client, caller, {
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
 * A storage failure leaves the tombstone for the next run (all organisations).
 */
export const purgeDeletedFiles = async (client: Db, olderThanSeconds = 0) => {
  const rows = await client
    .select({ id: files.id, key: files.key })
    .from(files)
    .where(
      and(
        eq(files.status, 'deleting'),
        lt(files.updatedAt, sql`now() - make_interval(secs => ${olderThanSeconds})`),
      ),
    )
    .limit(500);

  let purged = 0;

  for (const row of rows) {
    try {
      await storage().remove(row.key);
    } catch (error) {
      log.error(
        {
          key: row.key,
          err: error,
        },
        'could not delete stored file; will retry',
      );
      continue;
    }

    await client.delete(files).where(and(eq(files.id, row.id), eq(files.status, 'deleting')));
    purged += 1;
  }

  return purged;
};

/**
 * Unfinished uploads past their time are claimed (`pending` → `deleting`, a
 * conditional update a completion in progress blocks), then purged.
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

  await purgeDeletedFiles(client);

  return claimed.rowCount ?? 0;
};

/**
 * A file core made itself (an export): stored under core's own key and ready
 * at once — no upload link ever existed for it. Downloads go through
 * `/files/:id/download` like any other file.
 */
export const storeServerFile = async (
  client: Db,
  caller: Caller,
  input: { name: string; contentType: string; body: Buffer },
) => {
  const id = newId();
  const key = storageKey(caller.orgId, id);

  await storage().write(key, input.body, input.contentType);

  return oneRow(
    await client
      .insert(files)
      .values({
        id,
        orgId: caller.orgId,
        key,
        name: input.name,
        contentType: input.contentType,
        size: input.body.length,
        status: 'ready',
        source: caller.source,
        actorType: caller.actorType,
        actorId: caller.actorId,
      })
      .returning(),
  );
};

/** A ready file's bytes (imports read the uploaded file with it). */
export const readFileBytes = async (client: Db, orgId: string, id: string) => {
  const row = await readyFile(client, orgId, id);

  return { row, body: await storage().read(row.key) };
};
