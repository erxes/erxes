import { coreContract } from '@erxes/core-contract';
import { db, type Db, scopedOrgId, withOrg } from '@erxes/core-db';
import { getLogger, type LoggerContext } from '@orpc/experimental-pino';
import { implement } from '@orpc/server';
import type { Request, Response } from 'express';
import { enforceAccess } from '~/http/access';
import { fromDatabase } from '~/http/errors';
import { type AuditInput, recordAudit } from '~/modules/audit/audit.service';

/**
 * What the handler passes in: the Express request (host, cookies), the
 * response (cookies) and the request's logger for oRPC's logging plugin. The
 * caller is in scope (`caller()` from `@erxes/core-db`), not in the context.
 */
export interface CoreContext extends LoggerContext {
  req: Request;
  res: Response;
}

/**
 * Every procedure first passes the access map (`~/http/access`): the caller
 * must be allowed by the procedure's policy before its handler runs. It gets
 * `context.log`: the request's logger with its `requestId`, `orgId`,
 * `actorId` and the procedure (`rpc.method`). `unscoped` opens no
 * transaction: public and customer procedures, and those that call out over
 * the network, read in a short `withOrg` of their own.
 */
export const unscoped = implement(coreContract)
  .$context<CoreContext>()
  .use(async ({ context, path, next }) => {
    enforceAccess(path.join('.'));

    try {
      return await next({ context: { log: getLogger(context) ?? context.req.log } });
    } catch (error) {
      throw fromDatabase(error);
    }
  });

/**
 * The whole call runs in one transaction scoped to the caller's organisation
 * (row level security). A plugin's own token has no organisation: no transaction.
 */
export const scoped = unscoped.use(({ next }) => {
  const orgId = scopedOrgId();

  return orgId ? withOrg(orgId, async () => next()) : next();
});

/**
 * Runs a settings change and its audit entry in the request's transaction:
 * both are saved, or neither.
 */
export const audited = async <T>(
  run: (tx: Db) => Promise<T>,
  entry: (result: T) => AuditInput | AuditInput[],
) => {
  const result = await run(db());

  await recordAudit(db(), entry(result));

  return result;
};

/** An audit entry for `<targetType>.<action>`, labelled with the record's label or name. */
export const recordOf = (
  targetType: string,
  action: string,
  id: string,
  record?: { label?: string; name?: string },
): AuditInput => ({
  action: `${targetType}.${action}`,
  targetType,
  targetId: id,
  targetLabel: record?.label ?? record?.name ?? null,
});
