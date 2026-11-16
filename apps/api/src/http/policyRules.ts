import type { CorePermission, coreContract, PluginScope } from '@erxes/core-contract';

type Contract = typeof coreContract;

/** Every procedure of the core API: `customers.list`, `plugins.token`, … */
export type ProcedurePath = {
  [G in keyof Contract]: `${G & string}.${keyof Contract[G] & string}`;
}[keyof Contract];

/** Which members: any signed-in member, or those whose role has this permission. */
type MemberRule = 'any' | CorePermission;

/**
 * Who may call a procedure. Nothing is allowed unless written here:
 * `member` for signed-in team members (a permission their role must hold),
 * `plugin` for plugin tokens with that scope (`manifest`: the plugin's own
 * deployment-wide token, no organisation; `installed`: any token for an
 * organisation that has it, no scope needed), `customer` for a signed-in
 * customer on `/customer/*` (`authenticate` lets nobody else in there).
 * Services may check more (a member's own note, an owner's account).
 */
export type Policy =
  | { public: true }
  | { customer: true }
  | { member?: MemberRule; plugin?: PluginScope | 'manifest' | 'installed' };

export const MEMBER = { member: 'any' } as const;
export const PUBLIC = { public: true } as const;
export const CUSTOMER = { customer: true } as const;
export const needs = <P extends CorePermission>(permission: P) => ({ member: permission }) as const;
