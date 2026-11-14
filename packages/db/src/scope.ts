import { AsyncLocalStorage } from 'node:async_hooks';
import type { ActorType } from './schema';
import type { Transaction } from './types';

/**
 * Who is calling: a team member, a plugin, a signed-in customer, or core
 * itself (jobs, payment callbacks). The auth middleware puts it in the
 * request's scope; work outside a request runs as `system`.
 */
export type Caller =
  | { type: 'user'; userId: string; role: string; permissions: readonly string[] }
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

/**
 * Runs `fn` as `who`, in the current organisation and transaction: a sign-in
 * acting for the member it found, an automation for the member who turned it
 * on, core recording what it did on its own inside a member's request.
 */
export const runAs = <T>(who: Caller, fn: () => T): T => {
  const current = currentScope();

  return scopeStorage.run(
    { caller: who, orgId: current?.orgId ?? null, tx: current?.tx ?? null },
    fn,
  );
};

/** Core acting on its own (`runAs(system('…'), fn)`). */
export const system = (reason: string): Caller => ({ type: 'system', reason });

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
