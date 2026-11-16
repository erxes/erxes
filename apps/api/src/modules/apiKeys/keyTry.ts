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

    const { method = 'POST', path = '', summary } = procedure['~orpc'].route;
    const need = keyNeed(name);

    return [
      {
        procedure: name,
        method,
        path,
        summary: summary ?? null,
        area: need?.area ?? null,
        access: need?.access ?? 'read',
        permission: callPermission(name),
      },
    ];
  }),
});

/** A key made before rules: what its maker's role allows now. */
const tryMemberKey = async (orgId: string, userId: string, path: string) => {
  const member = await memberOf(orgId, userId);

  if (!member) return deny('maker', "Its maker can't sign in, so the key doesn't work");

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

/**
 * Would the key be allowed the call, from the address, on the contact? The same checks a
 * real call meets, in the same order; says which rule decided. Nothing is recorded.
 */
export const tryKey = async (
  client: Db,
  input: { id: string; procedure: string; recordId?: string; ip?: string },
): Promise<KeyDecision> => {
  const me = sessionMember();
  const key = await visibleKey(client, input.id, me.userId);

  if (!POLICIES.has(input.procedure)) return deny('unknown', 'No such call');

  if (key.kind === 'member') {
    if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) {
      return deny('expired', 'This key has expired');
    }

    return tryMemberKey(key.orgId, key.userId, input.procedure);
  }

  const result = await keyCaller(client, key, input.ip ?? null, { anyAddress: !input.ip });

  if ('denied' in result) return result.denied;

  const { caller } = result;

  const decision = caller.key
    ? decideKeyCall({ ...caller, key: caller.key }, input.procedure)
    : null;

  if (!decision?.allowed || !caller.key) return decision ?? deny('never', 'Not a key');

  if (input.recordId && keyNeed(input.procedure)?.area === 'contacts') {
    const { recordId } = input;

    if (!(await contactVisible(client, recordId))) return deny('rows', 'No contact has this id');

    if (!(await withRowLimits(caller.key.rows, (tx) => contactVisible(tx, recordId)))) {
      return deny('rows', "This contact is outside the key's limits, so the key can't see it");
    }
  }

  return decision;
};
