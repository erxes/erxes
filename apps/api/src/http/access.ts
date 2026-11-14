import { coreContract, CORE_API_PREFIX, OWNER_ONLY_PERMISSIONS } from '@erxes/core-contract';
import { caller, type Caller, scopedOrgId } from '@erxes/core-db';
import { getContractRouter, isContractProcedure } from '@orpc/contract';
import { fail } from './errors';
import { ACCESS, type Policy } from './policies';

const OWNER_ONLY = new Set<string>(OWNER_ONLY_PERMISSIONS);

type Member = Extract<Caller, { type: 'user' }>;

/**
 * May the member do `action`? Owners may do everything; `*` grants every
 * action except owner-only ones; otherwise the role must list it. The router
 * checks a procedure's permission (`ACCESS`); services call this only for
 * rules that depend on the record (an author's own note, a shared view).
 */
export const can = (member: Pick<Member, 'role' | 'permissions'>, action: string) => {
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

/** Checks the request's caller against the procedure's policy (oRPC middleware, every call). */
export const enforceAccess = (path: string) => {
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
      return checkMember(policy, who);
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
