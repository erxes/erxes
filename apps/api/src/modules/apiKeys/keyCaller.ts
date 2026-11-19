import { type apiKeys, type Caller, type Db, type RowLimits, roles, users } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { BlockList, isIP } from 'node:net';
import { can } from '~/http/access';
import { areaPermissions, type KeyDecision } from '~/http/keyRules';
import { permissionsWithinReach, unitIdsOf } from '~/modules/reach/reach';

type KeyRow = typeof apiKeys.$inferSelect;

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

/**
 * The contacts a key sees inside its maker's reach: the maker's own, those in its units or a
 * unit under them, those with its tags. A management key sees none.
 */
const rowLimitsOf = (key: KeyRow): RowLimits => {
  if (key.kind === 'management') return { owners: [], units: null, tags: [] };

  return {
    owners: key.ownRecords ? [key.userId] : null,
    units: key.unitIds.length ? key.unitIds : null,
    tags: key.tagIds.length ? key.tagIds : null,
  };
};

const refused = (rule: string, reason: string): { denied: KeyDecision } => ({
  denied: { allowed: false, rule, reason },
});

/**
 * The caller a regular or management key acts as, or why it is refused: past its expiry,
 * from an address it doesn't allow, or its maker's role is gone. It is the organisation's,
 * so it outlives its maker's sign-in, but holds only the permissions its maker had when it
 * was made that the maker's role has now and its areas bring; it sees the contacts its
 * maker reaches now that its limits leave (row level security).
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

  const [row] = await client
    .select({ role: users.role, permissions: permissionsWithinReach, level: roles.reach })
    .from(users)
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .where(eq(users.id, key.userId))
    .limit(1);

  if (!row) return refused('role', "Its maker's role was removed");

  // The key is the organisation's, but it never reaches further than its maker does now.
  const reach = { level: row.level, unitIds: await unitIdsOf(client, key.userId) };
  const maker = { role: row.role, permissions: row.permissions, reach };
  const allows = (action: string) => can(maker, action);
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
      reach,
      apiKeyId: key.id,
      key: {
        id: key.id,
        kind: key.kind,
        areas: key.areas,
        plugins: key.pluginAccess,
        actions: key.actions,
        rows: rowLimitsOf(key),
      },
    },
  };
};
