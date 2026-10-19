import { randomUUID } from 'node:crypto';
import { redis } from 'erxes-api-shared/utils';
import jwt from 'jsonwebtoken';
import {
  generateModels,
  type IExtensionDocument,
  type IModels,
} from './connectionResolver';
import { LIMITS } from './limits';
import { invoke, type InvokeResult, type Session } from './sandbox';
import { loadSecrets, redact } from './secrets';

// What started a run: a signed-in user's call, or one of the install's
// triggers, which nobody calls.
export type Trigger = 'call' | 'cron' | 'webhook' | 'event';

type RunOptions = {
  fn: string;
  input: unknown;
  // Who the run acts as.
  userId: string;
  session: Session;
  trigger: Trigger;
  // Set on a trigger's run: whose approval it runs under.
  installerId?: string;
};

// One run of the install's active build, recorded in run history. Secret
// values are redacted from the error before anyone sees it.
export const runFunction = async (
  models: IModels,
  ext: IExtensionDocument,
  { fn, input, userId, session, trigger, installerId }: RunOptions,
) => {
  const secrets = await loadSecrets(
    models,
    ext.subdomain,
    ext.extId,
    Object.keys(ext.secrets ?? {}),
  );
  const result = await invoke({
    tenant: ext.subdomain,
    extId: ext.extId,
    version: ext.version,
    code: ext.code,
    codeHash: ext.codeHash,
    collections: ext.collections,
    uses: ext.uses ?? {},
    network: ext.network ?? [],
    secrets,
    name: fn,
    input,
    user: { _id: userId },
    session,
  });

  if (!result.ok) {
    result.error.message = redact(result.error.message, secrets);
  }

  await recordRun(models, ext, { fn, userId, trigger, installerId, result });
  return result;
};

const recordRun = (
  models: IModels,
  ext: Pick<IExtensionDocument, 'subdomain' | 'extId' | 'version'>,
  {
    fn,
    userId,
    trigger,
    installerId,
    result,
  }: Pick<RunOptions, 'fn' | 'userId' | 'trigger' | 'installerId'> & {
    result: InvokeResult;
  },
) =>
  models.ExtensionRuns.create({
    subdomain: ext.subdomain,
    extId: ext.extId,
    version: ext.version,
    fn,
    trigger,
    userId,
    installerId,
    status: result.ok
      ? 'ok'
      : result.error.code === 'TIMEOUT'
      ? 'timeout'
      : 'error',
    ...(!result.ok && {
      error: { code: result.error.code, message: result.error.message },
    }),
    ms: result.ms,
  });

// A trigger's run was refused before it started. Retrying won't help.
export const REFUSED = new Set([
  'DISABLED',
  'INSTALLER_INACTIVE',
  'USER_INACTIVE',
  'UNKNOWN_FUNCTION',
]);

// The wait for a free sandbox and the run itself each take up to the run
// timeout, and the session has to last through both.
const SESSION_TTL_SECONDS = Math.ceil((2 * LIMITS.runTimeoutMs) / 1000);

// A login session for one trigger run, the same JWT and Redis key core-api's
// login writes, so the gateway accepts it and plugin resolvers check this
// user's permissions. The `ext` claim marks it as the extension's for audit,
// and the runtime's own routes refuse it. It stays host-side in the grant,
// never in the isolate, and is deleted when the run ends.
const mintSession = async (tenant: string, extId: string, userId: string) => {
  const token = jwt.sign(
    { user: { _id: userId }, ext: extId, jti: randomUUID() },
    process.env.JWT_TOKEN_SECRET || 'SECRET',
    { expiresIn: SESSION_TTL_SECONDS },
  );
  const key = `user_token_${userId}_${token}`;

  await redis.set(key, '1', 'EX', SESSION_TTL_SECONDS);

  return {
    // getSubdomain reads the first label of the hostname, so the tenant
    // itself resolves to the tenant.
    session: { token, hostname: tenant },
    revoke: () => redis.del(key),
  };
};

// A run nobody called: a schedule, a webhook or an event. It acts as
// `actAs` (an event's user) or else as the owner who installed the
// extension, and reaches erxes only through the install's pinned contracts,
// so it can do at most what both that user and the install's grants allow.
// The install must be enabled and the user active, checked on every run;
// a refusal is recorded like any other run. Returns undefined when the
// extension is no longer installed.
export const runTrigger = async (
  tenant: string,
  extId: string,
  {
    fn,
    input,
    trigger,
    actAs,
  }: { fn: string; input: unknown; trigger: Trigger; actAs?: string },
) => {
  const models = await generateModels(tenant);
  const ext = await models.Extensions.findById(`${tenant}:${extId}`).lean();

  if (!ext) {
    return undefined;
  }

  const userId = actAs ?? ext.installedBy;
  const refuse = async (code: string, message: string) => {
    const result: InvokeResult = { ok: false, error: { code, message }, ms: 0 };
    await recordRun(models, ext, {
      fn,
      userId,
      trigger,
      installerId: ext.installedBy,
      result,
    });
    return result;
  };

  if (ext.status !== 'installed') {
    return refuse('DISABLED', `${extId} is disabled`);
  }

  if (!ext.functions.includes(fn)) {
    return refuse('UNKNOWN_FUNCTION', `${extId} has no function ${fn}`);
  }

  const active = await models.Extensions.db
    .collection<{ _id: string; isActive?: boolean }>('users')
    .findOne(
      { _id: userId, isActive: { $ne: false } },
      { projection: { _id: 1 } },
    );

  if (!active) {
    return actAs
      ? refuse('USER_INACTIVE', `The user ${userId} is gone or deactivated`)
      : refuse(
          'INSTALLER_INACTIVE',
          `The owner who installed ${extId} is gone or deactivated. Reinstall it as an active owner.`,
        );
  }

  const { session, revoke } = await mintSession(tenant, extId, userId);

  try {
    return await runFunction(models, ext, {
      fn,
      input,
      userId,
      session,
      trigger,
      installerId: ext.installedBy,
    });
  } finally {
    await revoke();
  }
};
