import type { FileInfo, FileSettings } from '@erxes/core-contract';
import { CORE_API_PREFIX } from '@erxes/core-contract';
import { type Db, files, newId, organizations, type OrganizationSettings } from '@erxes/core-db';
import { and, eq, inArray, lt, sql } from 'drizzle-orm';
import { config } from '~/config';
import { type Actor, type Caller, isManager, requireManager } from '~/http/auth';
import { HttpError, notFound } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { recordAudit } from '~/modules/audit/audit.service';
import { canShowInline, storage } from './storage';

type FileRow = typeof files.$inferSelect;

const MB = 1024 * 1024;

/**
 * Never accepted, whatever the settings say: programs and scripts that run
 * when opened.
 */
const BLOCKED_EXTENSIONS = new Set([
  '.exe',
  '.msi',
  '.bat',
  '.cmd',
  '.com',
  '.scr',
  '.pif',
  '.cpl',
  '.ps1',
  '.vbs',
  '.vbe',
  '.wsf',
  '.jar',
  '.app',
  '.dll',
]);

export const downloadPath = (id: string) => `${CORE_API_PREFIX}/files/${id}/download`;

export const toFileDto = (row: FileRow): FileInfo => ({
  id: row.id,
  name: row.name,
  contentType: row.contentType,
  size: row.size,
  status: row.status,
  source: row.source,
  uploadedBy: { type: row.actorType, id: row.actorId },
  url: downloadPath(row.id),
  createdAt: row.createdAt.toISOString(),
});

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf('.');

  return dot > 0 ? name.slice(dot).toLowerCase() : '';
};

/** Does `type/subtype` or the name's extension match one of the allowed entries? */
export const typeAllowed = (allowed: string[], name: string, contentType: string) => {
  if (!allowed.length) {
    return true;
  }

  const extension = extensionOf(name);

  return allowed.some((entry) => {
    if (entry.startsWith('.')) {
      return entry === extension;
    }

    if (entry.endsWith('/*')) {
      return contentType.startsWith(entry.slice(0, -1));
    }

    return entry === contentType;
  });
};

const settingsOf = async (client: Db, orgId: string): Promise<FileSettings> => {
  const [row] = await client
    .select({ settings: organizations.settings })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);
  const saved = row?.settings.files ?? {};
  const limitMb = config.files.maxSizeMb;

  return {
    maxSizeMb: Math.min(saved.maxSizeMb ?? limitMb, limitMb),
    allowedTypes: saved.allowedTypes ?? [],
    limitMb,
    storage: config.files.driver,
  };
};

export const getFileSettings = (client: Db, actor: Actor) => settingsOf(client, actor.orgId);

export const updateFileSettings = async (
  client: Db,
  actor: Actor,
  input: { maxSizeMb: number; allowedTypes: string[] },
) => {
  requireManager(actor, 'Only owners and admins can change upload settings');

  if (input.maxSizeMb > config.files.maxSizeMb) {
    throw new HttpError(
      400,
      'LIMIT_EXCEEDED',
      `This server accepts files up to ${config.files.maxSizeMb} MB`,
    );
  }

  const before = await settingsOf(client, actor.orgId);
  const next: OrganizationSettings['files'] = {
    maxSizeMb: input.maxSizeMb,
    allowedTypes: unique(input.allowedTypes),
  };

  await client.transaction(async (tx) => {
    await tx
      .update(organizations)
      .set({
        settings: sql`jsonb_set(${organizations.settings}, '{files}', ${JSON.stringify(next)}::jsonb)`,
        updatedAt: sql`now()`,
      })
      .where(eq(organizations.id, actor.orgId));

    await recordAudit(
      tx,
      { orgId: actor.orgId, actorType: 'user', actorId: actor.userId, source: 'core' },
      {
        action: 'settings.files_changed',
        targetType: 'organization',
        targetId: actor.orgId,
        changes: {
          maxSizeMb: [before.maxSizeMb, next.maxSizeMb],
          allowedTypes: [before.allowedTypes, next.allowedTypes],
        },
      },
    );
  });

  return settingsOf(client, actor.orgId);
};

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
  const settings = await settingsOf(client, caller.orgId);

  if (input.size > settings.maxSizeMb * MB) {
    throw new HttpError(400, 'FILE_TOO_LARGE', `Files can be up to ${settings.maxSizeMb} MB`, {
      maxSizeMb: settings.maxSizeMb,
    });
  }

  if (
    BLOCKED_EXTENSIONS.has(extensionOf(input.name)) ||
    !typeAllowed(settings.allowedTypes, input.name, input.contentType)
  ) {
    throw new HttpError(400, 'FILE_TYPE_NOT_ALLOWED', 'This type of file is not allowed', {
      allowedTypes: settings.allowedTypes,
    });
  }

  const id = newId();
  const key = storageKey(caller.orgId, id);
  const expiresIn = config.files.linkTtlSeconds;
  const target = await storage().uploadTarget(key, {
    contentType: input.contentType,
    size: input.size,
    expiresIn,
  });

  const [row] = await client
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
    .returning();

  return {
    file: toFileDto(row!),
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
 * Step 2: once the bytes are sent, core checks the stored object and marks
 * the file ready. Only whoever started the upload can finish it.
 */
export const completeUpload = async (client: Db, caller: Caller, id: string) => {
  const row = await findFile(client, caller.orgId, id);

  if (!isUploader(row, caller)) {
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

  return client.transaction(async (tx) => {
    const [ready] = await tx
      .update(files)
      .set({ status: 'ready', updatedAt: sql`now()` })
      .where(and(eq(files.orgId, caller.orgId), eq(files.id, id)))
      .returning();

    await recordAudit(tx, caller, {
      action: 'file.uploaded',
      targetType: 'file',
      targetId: id,
      targetLabel: row.name,
      metadata: { contentType: row.contentType, size: row.size },
    });

    return toFileDto(ready!);
  });
};

/** A ready file and a short-lived link to read it. */
export const getFile = async (client: Db, caller: Caller, id: string) => {
  const row = await findFile(client, caller.orgId, id);

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
  const byId = new Map(rows.map((row) => [row.id, row]));

  return { data: wanted.flatMap((id) => (byId.has(id) ? [toFileDto(byId.get(id)!)] : [])) };
};

/** The uploader can delete a file; so can owners and admins (members only). */
export const removeFile = async (client: Db, caller: Caller, actor: Actor | null, id: string) => {
  const row = await findFile(client, caller.orgId, id);

  if (!isUploader(row, caller) && !(actor && isManager(actor))) {
    throw new HttpError(
      403,
      'NOT_ALLOWED',
      'Only the uploader or an owner or admin can delete this file',
    );
  }

  await client.transaction(async (tx) => {
    await tx.delete(files).where(and(eq(files.orgId, caller.orgId), eq(files.id, id)));

    if (row.status === 'ready') {
      await recordAudit(tx, caller, {
        action: 'file.deleted',
        targetType: 'file',
        targetId: id,
        targetLabel: row.name,
      });
    }
  });

  // After the row is gone: a failure here leaves an orphan object, never a broken record.
  await storage()
    .remove(row.key)
    .catch((error: unknown) =>
      console.error('[core] could not delete stored file', row.key, error),
    );

  return { ok: true as const };
};

/** Removes uploads that were started but never finished (all organisations). */
export const pruneUploads = async (client: Db, hours: number) => {
  const stale = await client
    .select({ id: files.id, key: files.key })
    .from(files)
    .where(
      and(
        eq(files.status, 'pending'),
        lt(files.createdAt, sql`now() - make_interval(hours => ${hours})`),
      ),
    )
    .limit(500);

  for (const row of stale) {
    await storage()
      .remove(row.key)
      .catch(() => undefined);
    await client.delete(files).where(and(eq(files.id, row.id), eq(files.status, 'pending')));
  }

  return stale.length;
};
