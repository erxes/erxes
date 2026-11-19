import { AsyncLocalStorage } from 'node:async_hooks';
import type { RoleReach } from './enums';
import type { ActorType, ApiKeyActions, ApiKeyAreas, ApiKeyPlugins } from './schema';
import type { Transaction } from './types';

/**
 * How far a member reaches: their role's `reach` and the units they are in. `organization`
 * limits nothing; `subtree` is their units and every unit under them, `unit` their units alone,
 * `own` the records they own. Row level security applies it to records (drizzle/0090_reach.sql)
 * and `apps/api/src/modules/reach` to the team and the structure.
 */
export interface Reach {
  level: RoleReach;
  unitIds: readonly string[];
}

/** No limit: owners, admins and every role that reaches the whole organisation. */
export const WHOLE_ORGANIZATION: Reach = { level: 'organization', unitIds: [] };

/**
 * The records a member owns and nothing else: for a member who acts before their role is read
 * (a sign-in flow recording what it did for them).
 */
export const NO_REACH: Reach = { level: 'own', unitIds: [] };

/**
 * Which contacts an API key sees and writes, inside its maker's reach: those owned by one of
 * `owners`, those in one of `units` or a unit under them, those with one of `tags`; null for
 * no limit. Row level security applies it (drizzle/0090_reach.sql), so every query obeys it.
 */
export interface RowLimits {
  owners: readonly string[] | null;
  units: readonly string[] | null;
  tags: readonly string[] | null;
}

/** A regular or management API key: the areas it opens (`apps/api/src/http/keyRules.ts`). */
export interface KeyRules {
  id: string;
  kind: 'regular' | 'management';
  areas: ApiKeyAreas;
  /** The plugins whose APIs it may call (`plugins.session`). */
  plugins: ApiKeyPlugins;
  /** Where it uses only some actions, by area or plugin name. */
  actions: ApiKeyActions;
  rows: RowLimits;
}

/**
 * Who is calling: a team member, a plugin, a signed-in customer, or core
 * itself (jobs, payment callbacks). The auth middleware puts it in the
 * request's scope; work outside a request runs as `system`.
 */
export type Caller =
  | {
      type: 'user';
      userId: string;
      role: string;
      permissions: readonly string[];
      /** Where the role's permissions hold. */
      reach: Reach;
      /** Set when the member called with one of their API keys, not a session. */
      apiKeyId?: string;
      /** Set for a regular or management key: what it may do, besides `permissions`. */
      key?: KeyRules;
    }
  | { type: 'plugin'; plugin: string; scopes: readonly string[] }
  | { type: 'customer'; customerId: string; sessionId: string; clientId: string }
  | { type: 'system'; reason: string };

/** What a request or job runs in: its caller, its organisation and its transaction. */
export interface Scope {
  caller: Caller;
  /** The organisation, or null across organisations (system work, a plugin's own token). */
  orgId: string | null;
  /** The transaction `db()` returns; null until `withOrg` or `withSystem` opens one. */
  tx: Transaction | null;
}

export const scopeStorage = new AsyncLocalStorage<Scope>();

export const currentScope = () => scopeStorage.getStore();

/** The open transaction's scope, if there is one. */
export const openScope = () => {
  const current = currentScope();

  return current?.tx ? { ...current, tx: current.tx } : undefined;
};

/** Starts a request's scope: its caller and organisation, no transaction yet (the auth middleware). */
export const enterScope = <T>(who: Caller, orgId: string | null, fn: () => T): T =>
  scopeStorage.run({ caller: who, orgId, tx: null }, fn);

/**
 * Who is calling. `caller('user')` narrows to a member and throws for anyone
 * else: the procedure's access policy already let only members in, so a
 * mismatch is a bug.
 */
export function caller(): Caller;
export function caller<T extends Caller['type']>(type: T): Extract<Caller, { type: T }>;
export function caller(type?: Caller['type']) {
  const current = currentScope()?.caller ?? system('background');

  if (type && current.type !== type) {
    throw new Error(`caller(): expected a ${type}, the caller is a ${current.type}`);
  }

  return current;
}

/** Core acting on its own (`runAs(system('…'), fn)`). */
export const system = (reason: string): Caller => ({ type: 'system', reason });

/** The calling member's id, or null for a plugin, customer or core itself (`createdBy` columns). */
export const callerUserId = () => {
  const who = caller();

  return who.type === 'user' ? who.userId : null;
};

/** The actor columns (`actor_type`, `actor_id`) a record of this caller's change stores. */
export const actorOf = (who: Caller): { actorType: ActorType; actorId: string | null } => {
  switch (who.type) {
    case 'user':
      return { actorType: 'user', actorId: who.userId };
    case 'plugin':
      return { actorType: 'plugin', actorId: who.plugin };
    case 'customer':
      return { actorType: 'customer', actorId: who.customerId };
    case 'system':
      return { actorType: 'system', actorId: null };
  }
};

/** `core`, or the plugin that is calling. */
export const sourceOf = (who: Caller) => (who.type === 'plugin' ? who.plugin : 'core');
