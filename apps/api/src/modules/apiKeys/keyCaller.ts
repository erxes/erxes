import { OWNER_ONLY_PERMISSIONS } from '@erxes/core-contract';
import {
  type apiKeys,
  type Caller,
  type Db,
  orgUnitMembers,
  orgUnits,
  type RowLimits,
  roles,
  users,
} from '@erxes/core-db';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { BlockList, isIP } from 'node:net';
import { areaPermissions, type KeyDecision } from '~/http/keyRules';

type KeyRow = typeof apiKeys.$inferSelect;

const OWNER_ONLY = new Set(OWNER_ONLY_PERMISSIONS);

/** Does the address fall in one of the ranges (`10.0.0.0/8`, `2001:db8::/32`, `203.0.113.7`)? */
const ipAllowed = (ranges: readonly string[], ip: string | null) => {
  if (!ranges.length) return true;

  const address = ip?.replace(/^::ffff:(?=\d+\.)/, '') ?? '';
  const family = isIP(address);

  if (!family) return false;

  const list = new BlockList();

  for (const range of ranges) {
    const [network = '', bits] = range.split('/');
    const type = isIP(network) === 6 ? 'ipv6' : 'ipv4';

    if (bits === undefined) list.addAddress(network, type);
    else list.addSubnet(network, Number(bits), type);
  }

  return list.check(address, family === 6 ? 'ipv6' : 'ipv4');
};

/** Members of the units or any unit under them. */
const unitMembers = async (client: Db, unitIds: readonly string[]) => {
  const tree = sql`(
    with recursive tree as (
      select id from ${orgUnits} where ${inArray(orgUnits.id, [...unitIds])}
      union all
      select u.id from ${orgUnits} u join tree on u.parent_id = tree.id
    )
    select id from tree
  )`;

  const rows = await client
    .selectDistinct({ userId: orgUnitMembers.userId })
    .from(orgUnitMembers)
    .where(sql`${orgUnitMembers.unitId} in ${tree}`);

  return rows.map((row) => row.userId);
};

/** The contacts a key sees: the maker's own, its units' members', with its tags. */
const rowLimitsOf = async (client: Db, key: KeyRow): Promise<RowLimits> => {
  if (key.kind === 'management') return { owners: [], tags: [] };

  const fromUnits = key.unitIds.length ? await unitMembers(client, key.unitIds) : null;
  const own = key.ownRecords ? [key.userId] : null;

  const owners = own && fromUnits ? own.filter((id) => fromUnits.includes(id)) : (own ?? fromUnits);

  return { owners, tags: key.tagIds.length ? key.tagIds : null };
};

/** What the maker's role still allows: owners everything, `*` all but owner-only actions. */
const roleAllows = (role: string, permissions: readonly string[]) => (action: string) =>
  role === 'owner' ||
  permissions.includes(action) ||
  (permissions.includes('*') && !OWNER_ONLY.has(action));

const refused = (rule: string, reason: string): { denied: KeyDecision } => ({
  denied: { allowed: false, rule, reason },
});

/**
 * The caller a regular or management key acts as, or why it is refused: past its expiry,
 * from an address it doesn't allow, or its maker's role is gone. It is the organisation's,
 * so it outlives its maker's sign-in, but holds only the permissions its maker had when it
 * was made that the maker's role has now and its areas bring; it sees the contacts its
 * limits leave (row level security).
 */
export const keyCaller = async (
  client: Db,
  key: KeyRow,
  ip: string | null,
  { anyAddress = false } = {},
): Promise<{ caller: Extract<Caller, { type: 'user' }> } | { denied: KeyDecision }> => {
  if (key.kind === 'member') throw new Error('keyCaller(): a member key acts as its member');

  if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) {
    return refused('expired', 'This key has expired');
  }

  if (!anyAddress && !ipAllowed(key.allowedIps, ip)) {
    return refused('ip', `This key doesn't allow calls from ${ip ?? 'an unknown address'}`);
  }

  const [maker] = await client
    .select({ role: users.role, permissions: roles.permissions })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(eq(users.id, key.userId))
    .limit(1);

  if (!maker) return refused('role', "Its maker's role was removed");

  const allows = roleAllows(maker.role, maker.permissions);
  const opened = new Set<string>(areaPermissions(key.areas, key.actions));

  const inOpenedPlugin = (action: string) => {
    const plugin = action.split('.')[0] ?? '';

    return (
      Object.hasOwn(key.pluginAccess, plugin) && (key.actions[plugin]?.includes(action) ?? true)
    );
  };

  const permissions = (key.permissions ?? []).filter(
    (action) => (opened.has(action) || inOpenedPlugin(action)) && allows(action),
  );

  return {
    caller: {
      type: 'user',
      userId: key.userId,
      role: 'api_key',
      permissions,
      apiKeyId: key.id,
      key: {
        id: key.id,
        kind: key.kind,
        areas: key.areas,
        plugins: key.pluginAccess,
        actions: key.actions,
        rows: await rowLimitsOf(client, key),
      },
    },
  };
};
