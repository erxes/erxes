import { type Db, users } from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { HttpError } from '~/http/errors';
import { unique } from '~/lib/contacts';

/** 400 INVALID_TYPE unless the type is namespaced by the calling plugin. */
export const assertPluginNamespace = (plugin: string, type: string) => {
  if (!type.startsWith(`${plugin}.`)) {
    throw new HttpError(400, 'INVALID_TYPE', `The type must start with "${plugin}."`);
  }
};

/** Whether every given user is a team member of the organisation (one query; empty ids are skipped). */
const allMembers = async (client: Db, orgId: string, userIds: (string | null | undefined)[]) => {
  const wanted = unique(userIds);

  if (!wanted.length) return true;

  const rows = await client
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.orgId, orgId), inArray(users.id, wanted)));

  return rows.length === wanted.length;
};

/** 400 INVALID_ACTOR unless every user is a team member of the organisation. */
export const assertMembers = async (
  client: Db,
  orgId: string,
  userIds: (string | null | undefined)[],
) => {
  if (!(await allMembers(client, orgId, userIds))) {
    throw new HttpError(
      400,
      'INVALID_ACTOR',
      'The actor is not a team member of this organisation',
    );
  }
};

/** 400 INVALID_OWNER unless a record's new owner is a team member of the organisation. */
export const assertOwner = async (
  client: Db,
  orgId: string,
  ownerId: string | null | undefined,
) => {
  if (!(await allMembers(client, orgId, [ownerId]))) {
    throw new HttpError(
      400,
      'INVALID_OWNER',
      'The owner is not a team member of this organisation',
    );
  }
};
