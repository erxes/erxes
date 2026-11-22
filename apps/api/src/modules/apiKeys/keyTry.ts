import { coreContract } from '@erxes/core-contract';
import { companies, customers, type Db, withRowLimits } from '@erxes/core-db';
import { getContractRouter, isContractProcedure } from '@orpc/contract';
import { eq } from 'drizzle-orm';
import { can, decideKeyCall } from '~/http/access';
import { memberOf } from '~/http/auth';
import { callPermission, type KeyDecision, keyNeed } from '~/http/keyRules';
import { ACCESS } from '~/http/policies';
import { sessionMember, visibleKey } from './apiKeys.service';
import { keyCaller } from './keyCaller';

const POLICIES = new Map<string, (typeof ACCESS)[keyof typeof ACCESS]>(Object.entries(ACCESS));

const deny = (rule: string, reason: string): KeyDecision => ({ allowed: false, rule, reason });

/** Every procedure, with the area and access a key needs for it. */
export const keyCalls = () => ({
  data: Object.keys(ACCESS).flatMap((name) => {
    const procedure = getContractRouter(coreContract, name.split('.'));

    if (!isContractProcedure(procedure)) return [];

    const { method = 'POST', path = '', summary, description } = procedure['~orpc'].route;
    const need = keyNeed(name);

    return [
      {
        procedure: name,
        method,
        path,
        summary: summary ?? null,
        description: description ?? null,
        area: need?.area ?? null,
        access: need?.access ?? 'read',
        permission: callPermission(name),
      },
    ];
  }),
});

type Member = NonNullable<Awaited<ReturnType<typeof memberOf>>>;

/** A key made before rules: what its maker's role allows now. */
const decideMemberKey = (member: Member, path: string): KeyDecision => {
  const policy = POLICIES.get(path);
  const rule = policy && 'member' in policy ? policy.member : undefined;

  if (!rule) return deny('never', 'API keys cannot call this');

  if (rule !== 'any' && !can(member, rule)) {
    return deny(`permission:${rule}`, `Its maker's role doesn't allow ${rule}`);
  }

  return {
    allowed: true,
    rule: 'member',
    reason: "It acts as its maker, with their role's rights",
  };
};

/** Is the contact (customer or company) one the limits leave? */
const contactVisible = async (client: Db, id: string) => {
  const [customer] = await client
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.id, id));

  const [company] = await client
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, id));

  return Boolean(customer ?? company);
};

/** Why the contact stops a call the key's rules allow; null when it doesn't. */
const contactDenial = async (
  client: Db,
  rows: Parameters<typeof withRowLimits>[0],
  recordId: string | undefined,
) => {
  if (!recordId) return null;

  if (!(await contactVisible(client, recordId))) return deny('rows', 'No contact has this id');

  return (await withRowLimits(rows, (tx) => contactVisible(tx, recordId)))
    ? null
    : deny('rows', "This contact is outside the key's limits, so the key can't see it");
};

type Input = { id: string; recordId?: string; ip?: string };

/** How the key decides each call: the same checks a real call meets, in the same order. */
const decider = async (client: Db, input: Input): Promise<(path: string) => KeyDecision> => {
  const me = sessionMember();
  const key = await visibleKey(client, input.id, me.userId);

  if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) {
    return () => deny('expired', 'This key has expired');
  }

  if (key.kind === 'member') {
    const member = await memberOf(key.orgId, key.userId);

    if (!member) return () => deny('maker', "Its maker can't sign in, so the key doesn't work");

    return (path) => decideMemberKey(member, path);
  }

  const result = await keyCaller(client, key, input.ip ?? null, { anyAddress: !input.ip });

  if ('denied' in result) return () => result.denied;

  const { caller } = result;
  const rules = caller.key;

  if (!rules) return () => deny('never', 'Not a key');

  const contact = await contactDenial(client, rules.rows, input.recordId);

  return (path) => {
    const decision = decideKeyCall({ ...caller, key: rules }, path);

    return decision.allowed && contact && keyNeed(path)?.area === 'contacts' ? contact : decision;
  };
};

/** The calls a key can be given: every procedure in an area or a lookup list. */
const KEY_CALLS = keyCalls().data.flatMap((call) => (call.area ? [call.procedure] : []));

/**
 * Would the key be allowed each call it can be given, from the address, on the contact? Says
 * which rule decided each. Nothing is called or recorded.
 */
export const tryKey = async (client: Db, input: Input) => {
  const decide = await decider(client, input);

  return { data: KEY_CALLS.map((procedure) => ({ procedure, ...decide(procedure) })) };
};
