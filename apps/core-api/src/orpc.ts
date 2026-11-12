import { coreContract } from '@erxes/core-contract';
import { type Transaction, withOrg, withTransaction } from '@erxes/core-db';
import { getLogger, type LoggerContext } from '@orpc/experimental-pino';
import { implement, os } from '@orpc/server';
import type { Request, Response } from 'express';
import { enforceAccess } from '~/http/access';
import { type Actor, actorOf, callerOf, pluginOf, userCaller } from '~/http/auth';
import { type AuditInput, recordAudit } from '~/modules/audit/audit.service';

/**
 * What the handler passes in: the Express request (actor, host), the response
 * (cookies) and the request's logger for oRPC's logging plugin.
 */
export interface CoreContext extends LoggerContext {
  req: Request;
  res: Response;
}

/**
 * Every procedure first passes the access map (`~/http/access`): the caller
 * must be allowed by the procedure's policy before its handler runs. It gets
 * `context.log`: the request's logger with its `requestId`, `orgId`,
 * `actorId` and the procedure (`rpc.method`). Public procedures use `pub`
 * and scope themselves.
 */
export const pub = implement(coreContract)
  .$context<CoreContext>()
  .use(({ context, path, next }) => {
    enforceAccess(path.join('.'), context.req);

    return next({ context: { log: getLogger(context) ?? context.req.log } });
  });

/**
 * The whole call runs in one transaction scoped to the caller's organisation
 * (row level security).
 */
const orgScoped = pub.use(({ context, next }) => {
  const orgId = context.req.actor?.orgId ?? context.req.plugin?.orgId;

  return orgId ? withOrg(orgId, async () => next()) : next();
});

const asMember = os
  .$context<CoreContext>()
  .middleware(({ context, next }) => next({ context: { actor: actorOf(context.req) } }));

/**
 * Procedures for a signed-in member: `context.actor` is the caller (resolved
 * by the `authenticate` middleware; public paths never reach these).
 */
export const authed = orgScoped.use(asMember);

/**
 * A member's procedure that calls out over the network: no transaction around
 * the handler, so a slow remote holds none. Its service reads in a short
 * `withOrg` scope and calls out after it.
 */
export const authedUnscoped = pub.use(asMember);

/** Procedures for plugins only (a plugin token for an organisation). */
export const plugin = orgScoped.use(({ context, next }) =>
  next({ context: { plugin: pluginOf(context.req) } }),
);

/** Procedures for members and plugins alike; `context.caller` says which. */
export const anyone = orgScoped.use(({ context, next }) =>
  next({ context: { caller: callerOf(context.req), actor: context.req.actor ?? null } }),
);

/**
 * Runs a settings change and its audit entry in one transaction: both are
 * saved, or neither.
 */
export const audited = <T>(
  actor: Actor,
  run: (tx: Transaction) => Promise<T>,
  entry: (result: T) => AuditInput | AuditInput[],
) =>
  withTransaction(async (tx) => {
    const result = await run(tx);

    await recordAudit(tx, userCaller(actor), entry(result));

    return result;
  });

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
