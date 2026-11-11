import { type Db, users } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { HttpError } from '~/http/errors';

/** 400 INVALID_TYPE unless the type is namespaced by the calling plugin. */
export const assertPluginNamespace = (plugin: string, type: string) => {
  if (!type.startsWith(`${plugin}.`)) {
    throw new HttpError(400, 'INVALID_TYPE', `The type must start with "${plugin}."`);
  }
};

/** 400 INVALID_ACTOR unless the user is a team member of the organisation. */
export const assertMember = async (client: Db, orgId: string, userId: string | undefined) => {
  if (!userId) {
    return;
  }

  const [row] = await client
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.orgId, orgId), eq(users.id, userId)))
    .limit(1);

  if (!row) {
    throw new HttpError(400, 'INVALID_ACTOR', 'The actor is not a team member of this organisation');
  }
};
