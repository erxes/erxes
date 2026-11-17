import { coreContract, CORE_API_PREFIX, OWNER_ONLY_PERMISSIONS } from '@erxes/core-contract';
import { caller, type Caller, type KeyRules, scopedOrgId, withOrgDetached } from '@erxes/core-db';
import { getContractRouter, isContractProcedure } from '@orpc/contract';
import { recordAudit } from '~/modules/audit/audit.service';
import { fail } from './errors';
import { decideKey, type KeyDecision } from './keyRules';
import { ACCESS } from './policies';
import type { Policy, ProcedurePath } from './policyRules';

const OWNER_ONLY = new Set<string>(OWNER_ONLY_PERMISSIONS);

type Member = Extract<Caller, { type: 'user' }>;

/**
 * May the member do `action`? Owners may do everything; `*` grants every
 * action except owner-only ones; otherwise the role must list it. The router
 * checks a procedure's permission (`ACCESS`); services call this only for
 * rules that depend on the record (an author's own note, a shared view).
 */
export const can = (member: Pick<Member, 'role' | 'permissions' | 'key'>, action: string) => {
  // A key's permissions are spelled out (keyCaller): no role, no `*`.
  if (member.key) return member.permissions.includes(action);

  if (member.role === 'owner') return true;

  if (OWNER_ONLY.has(action)) return false;

  return member.permissions.includes('*') || member.permissions.includes(action);
};

/** Is the caller a member whose role allows `action`? */
export const callerCan = (action: string) => {
  const who = caller();

  return who.type === 'user' && can(who, action);
};

/** ACCESS by the dotted path oRPC reports, which is a plain string at run time. */
const POLICIES = new Map<string, Policy>(Object.entries(ACCESS));

const unauthorized = () => fail('UNAUTHORIZED', 'Sign in to continue');

export const memberMayCall = (path: string, member: Member) => {
  const policy = POLICIES.get(path);

  if (!policy || !('member' in policy) || !policy.member) return false;

  return policy.member === 'any' || can(member, policy.member);
};

const checkMember = (policy: Policy, member: Member) => {
  if (!('member' in policy) || !policy.member) {
    throw fail('PLUGIN_ONLY', 'Only plugins can do this');
  }

  if (policy.member !== 'any' && !can(member, policy.member)) {
    throw fail('NOT_ALLOWED', "Your role doesn't allow this", {
      permission: policy.member,
    });
  }
};

const checkPlugin = (policy: Policy, scopes: readonly string[]) => {
  if (!('plugin' in policy) || !policy.plugin) {
    throw fail('MEMBERS_ONLY', 'Plugins cannot do this');
  }

  const orgId = scopedOrgId();

  if (policy.plugin === 'manifest') {
    if (orgId) {
      throw fail('SERVICE_TOKEN_REQUIRED', 'Use a token without an organisation to do this');
    }

    return;
  }

  if (!orgId) {
    throw fail('ORG_REQUIRED', 'Use a token for an organisation to do this');
  }

  if (policy.plugin !== 'installed' && !scopes.includes(policy.plugin)) {
    throw fail(
      'SCOPE_REQUIRED',
      `This needs the ${policy.plugin} scope, which this installation hasn't granted`,
    );
  }
};

/**
 * Records a key's refused call with the rule that decided, in a transaction of its own so
 * the refusal's rollback keeps it.
 */
export const recordKeyDenial = (keyId: string, path: string | null, decision: KeyDecision) => {
  const orgId = scopedOrgId();

  if (!orgId) return Promise.resolve();

  return withOrgDetached(orgId, (tx) =>
    recordAudit(tx, {
      action: 'api_key.denied',
      targetType: 'api_key',
      targetId: keyId,
      metadata: { procedure: path, rule: decision.rule, reason: decision.reason },
    }),
  );
};

/**
 * May a regular or management key call the procedure? Its rules first (`decideKey`), then
 * the member policy with the permissions the key holds. Pure: the middleware and "Try this
 * key" both ask it.
 */
export const decideKeyCall = (
  member: Pick<Member, 'role' | 'permissions'> & { key: KeyRules },
  path: string,
): KeyDecision => {
  const decision = decideKey(member.key, path);

  if (!decision.allowed) return decision;

  const policy = POLICIES.get(path);

  if (!policy || !('member' in policy) || !policy.member) {
    return { allowed: false, rule: 'never', reason: 'API keys cannot call this' };
  }

  if (policy.member !== 'any' && !can(member, policy.member)) {
    return {
      allowed: false,
      rule: `permission:${policy.member}`,
      reason: `It needs ${policy.member}, which the maker's role no longer has`,
    };
  }

  return decision;
};

/** Refuses a key's call with the rule that decided, and records it. */
export const refuseKeyCall = async (keyId: string, path: string, decision: KeyDecision) => {
  await recordKeyDenial(keyId, path, decision);

  return fail('KEY_NOT_ALLOWED', decision.reason, { rule: decision.rule });
};

const checkKey = async (member: Member, key: KeyRules, path: string) => {
  const decision = decideKeyCall({ ...member, key }, path);

  if (!decision.allowed) throw await refuseKeyCall(key.id, path, decision);
};

/** An HTTP route outside oRPC that serves what `path` serves: a key meets the same rules. */
export const enforceKeyAccess = async (path: ProcedurePath) => {
  const who = caller();

  if (who.type === 'user' && who.key) await checkKey(who, who.key, path);
};

/** Checks the request's caller against the procedure's policy (oRPC middleware, every call). */
export const enforceAccess = async (path: string) => {
  const policy = POLICIES.get(path);

  if (!policy) {
    // Unreachable while ACCESS satisfies the contract; fail closed regardless.
    throw fail('NOT_ALLOWED', 'This procedure has no access policy');
  }

  if ('public' in policy) return;

  const who = caller();

  if ('customer' in policy) {
    if (who.type !== 'customer') throw unauthorized();

    return;
  }

  switch (who.type) {
    case 'customer':
      throw fail('NOT_ALLOWED', 'Customers cannot do this');
    case 'user':
      return who.key ? checkKey(who, who.key, path) : checkMember(policy, who);
    case 'plugin':
      return checkPlugin(policy, who.scopes);
    case 'system':
      throw unauthorized();
  }
};

/** Paths (under /core/v1) that `authenticate` lets through without credentials. */
export const publicPaths = () => {
  const paths = new Set<string>();

  for (const [name, policy] of Object.entries(ACCESS)) {
    const procedure = getContractRouter(coreContract, name.split('.'));
    const path = isContractProcedure(procedure) ? procedure['~orpc'].route.path : undefined;

    if ('public' in policy && path) paths.add(path.replace(CORE_API_PREFIX, ''));
  }

  return paths;
};
