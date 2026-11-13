import type { FileSettings } from '@erxes/core-contract';
import { type Db, organizations, type OrganizationSettings } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import { config } from '~/config';
import { type Actor, requirePermission } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { unique } from '~/lib/contacts';
import { recordAudit } from '~/modules/audit/audit.service';

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

const extensionOf = (name: string) => {
  const dot = name.lastIndexOf('.');

  return dot > 0 ? name.slice(dot).toLowerCase() : '';
};

/** Does `type/subtype` or the name's extension match one of the allowed entries? */
const typeAllowed = (allowed: string[], name: string, contentType: string) => {
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

/** The organisation's upload rules, within what this server accepts. */
export const fileSettingsOf = async (client: Db, orgId: string): Promise<FileSettings> => {
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

/** Throws unless the settings accept a file of this name, type and size. */
export const assertUploadAllowed = (
  settings: FileSettings,
  input: { name: string; contentType: string; size: number },
) => {
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
};

export const getFileSettings = (client: Db, actor: Actor) => fileSettingsOf(client, actor.orgId);

export const updateFileSettings = async (
  client: Db,
  actor: Actor,
  input: { maxSizeMb: number; allowedTypes: string[] },
) => {
  requirePermission(actor, 'settings.manage');

  if (input.maxSizeMb > config.files.maxSizeMb) {
    throw new HttpError(
      400,
      'LIMIT_EXCEEDED',
      `This server accepts files up to ${config.files.maxSizeMb} MB`,
    );
  }

  const before = await fileSettingsOf(client, actor.orgId);

  const next: OrganizationSettings['files'] = {
    maxSizeMb: input.maxSizeMb,
    allowedTypes: unique(input.allowedTypes),
  };

  await client
    .update(organizations)
    .set({
      settings: sql`jsonb_set(${organizations.settings}, '{files}', ${JSON.stringify(next)}::jsonb)`,
      updatedAt: sql`now()`,
    })
    .where(eq(organizations.id, actor.orgId));

  await recordAudit(
    client,
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

  return fileSettingsOf(client, actor.orgId);
};
