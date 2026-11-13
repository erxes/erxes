import { coreContract, CORE_API_PREFIX, OWNER_ONLY_PERMISSIONS } from '@erxes/core-contract';
import { getContractRouter, isContractProcedure } from '@orpc/contract';
import type { Request } from 'express';
import { HttpError } from './errors';
import { ACCESS, type Policy } from './policies';

const OWNER_ONLY = new Set<string>(OWNER_ONLY_PERMISSIONS);

/**
 * May the member do `action`? Owners may do everything; `*` grants every
 * action except owner-only ones; otherwise the role must list it.
 */
export const can = (member: { role: string; permissions: readonly string[] }, action: string) => {
  if (member.role === 'owner') return true;

  if (OWNER_ONLY.has(action)) return false;

  return member.permissions.includes('*') || member.permissions.includes(action);
};

/** ACCESS by the dotted path oRPC reports, which is a plain string at run time. */
const POLICIES = new Map<string, Policy>(Object.entries(ACCESS));

/** Checks the caller against the procedure's policy (oRPC middleware, every call). */
export const enforceAccess = (path: string, req: Request) => {
  const policy = POLICIES.get(path);

  if (!policy) {
    // Unreachable while ACCESS satisfies the contract; fail closed regardless.
    throw new HttpError(403, 'NOT_ALLOWED', 'This procedure has no access policy');
  }

  if ('public' in policy) return;

  if ('customer' in policy) {
    if (!req.customer) throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');

    return;
  }

  if (req.customer) throw new HttpError(403, 'NOT_ALLOWED', 'Customers cannot do this');

  if (req.actor) {
    if (!policy.member) throw new HttpError(403, 'PLUGIN_ONLY', 'Only plugins can do this');

    if (policy.member !== 'any' && !can(req.actor, policy.member)) {
      throw new HttpError(403, 'NOT_ALLOWED', "Your role doesn't allow this", {
        permission: policy.member,
      });
    }

    return;
  }

  if (req.plugin || req.pluginService) {
    if (!policy.plugin) throw new HttpError(403, 'MEMBERS_ONLY', 'Plugins cannot do this');

    if (policy.plugin === 'manifest') {
      if (!req.pluginService) {
        throw new HttpError(
          403,
          'SERVICE_TOKEN_REQUIRED',
          'Use a token without an organisation to do this',
        );
      }

      return;
    }

    if (!req.plugin)
      throw new HttpError(403, 'ORG_REQUIRED', 'Use a token for an organisation to do this');

    if (policy.plugin === 'installed') return;

    if (!req.plugin.scopes.includes(policy.plugin)) {
      throw new HttpError(
        403,
        'SCOPE_REQUIRED',
        `This needs the ${policy.plugin} scope, which this installation hasn't granted`,
      );
    }

    return;
  }

  throw new HttpError(401, 'UNAUTHORIZED', 'Sign in to continue');
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
