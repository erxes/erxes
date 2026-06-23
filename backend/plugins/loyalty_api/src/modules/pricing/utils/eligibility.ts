import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export interface IPricingContext {
  customerId?: string;
  companyId?: string;
  agentId?: string;
}

/** Targetable entity kinds. Drives which core tRPC supplies tags/positions. */
type EntityKind = 'customer' | 'company' | 'user';

/**
 * Per-request memo shared across every plan in one checkPricing call. Holds two
 * kinds of entries so that N plans referencing the same segment/entity fan out
 * at most one tRPC call each:
 *   - `seg:${segmentId}:${entityId}`  -> boolean       (segment membership)
 *   - `doc:${kind}:${entityId}`       -> EntityFacts    (tagIds + positionIds)
 */
export type EligibilityCache = Map<string, unknown>;

interface EntityFacts {
  tagIds: string[];
  positionIds: string[];
}

/** Empty arrays are interchangeable with "field not set" for constraint checks. */
const hasAny = (list?: string[]): boolean => !!list && list.length > 0;

/** Do two id lists overlap? */
const intersects = (a: string[], b: string[]): boolean =>
  a.some((id) => b.includes(id));

/**
 * Is a single entity a member of a segment? Wraps the core `segment.isInSegment`
 * tRPC procedure and fails closed (false) when the segment service is
 * unreachable. The segment carries its own contentType, so the same call works
 * for customer / company / user segments.
 */
export const isInSegment = async (
  subdomain: string,
  segmentId: string,
  idToCheck: string,
  cache?: EligibilityCache,
): Promise<boolean> => {
  const key = `seg:${segmentId}:${idToCheck}`;

  if (cache?.has(key)) {
    return cache.get(key) as boolean;
  }

  const result = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'segment',
    action: 'isInSegment',
    input: { segmentId, idToCheck },
    defaultValue: false,
  });

  const isMember = result === true;
  cache?.set(key, isMember);
  return isMember;
};

const ENTITY_TRPC: Record<EntityKind, { module: string }> = {
  customer: { module: 'customers' },
  company: { module: 'companies' },
  user: { module: 'users' },
};

/**
 * Fetch the tagIds + positionIds of an entity once per request and memoize.
 * tagIds live on customer/company docs; positionIds on user docs. Fails closed
 * to empty facts (no membership) when the entity cannot be loaded.
 */
const getEntityFacts = async (
  subdomain: string,
  kind: EntityKind,
  entityId: string,
  cache?: EligibilityCache,
): Promise<EntityFacts> => {
  const key = `doc:${kind}:${entityId}`;

  if (cache?.has(key)) {
    return cache.get(key) as EntityFacts;
  }

  const doc = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: ENTITY_TRPC[kind].module,
    action: 'findOne',
    input: { _id: entityId },
    defaultValue: null,
  });

  const facts: EntityFacts = {
    tagIds: doc?.tagIds || [],
    positionIds: doc?.positionIds || [],
  };

  cache?.set(key, facts);
  return facts;
};

/** Fields that make up one targeting dimension. Unused kinds pass undefined. */
interface DimensionRules {
  ids?: string[];
  tags?: string[];
  excludeTags?: string[];
  segmentIds?: string[];
  positions?: string[];
}

/**
 * Evaluate one targeting dimension against a single entity.
 *
 * Rules:
 *  - no rules at all                      → unconstrained, always passes
 *  - constrained but no entityId supplied → fails closed (cannot prove match)
 *  - excludeTags match                    → disqualifies (exclusion wins)
 *  - only exclusion set                   → "everyone except", passes otherwise
 *  - else must match an include id OR tag OR position OR any listed segment
 */
const matchesDimension = async (
  subdomain: string,
  kind: EntityKind,
  entityId: string | undefined,
  rules: DimensionRules,
  cache?: EligibilityCache,
): Promise<boolean> => {
  const ids = rules.ids || [];
  const tags = rules.tags || [];
  const excludeTags = rules.excludeTags || [];
  const segmentIds = rules.segmentIds || [];
  const positions = rules.positions || [];

  const isConstrained =
    hasAny(ids) ||
    hasAny(tags) ||
    hasAny(excludeTags) ||
    hasAny(segmentIds) ||
    hasAny(positions);

  if (!isConstrained) {
    return true;
  }

  if (!entityId) {
    return false;
  }

  // Lazily load the entity's tags/positions only when a rule needs them.
  const needsFacts = hasAny(tags) || hasAny(excludeTags) || hasAny(positions);
  const facts = needsFacts
    ? await getEntityFacts(subdomain, kind, entityId, cache)
    : { tagIds: [], positionIds: [] };

  // Exclusion wins.
  if (hasAny(excludeTags) && intersects(facts.tagIds, excludeTags)) {
    return false;
  }

  const hasIncludeRules =
    hasAny(ids) || hasAny(tags) || hasAny(segmentIds) || hasAny(positions);

  if (!hasIncludeRules) {
    return true;
  }

  if (ids.includes(entityId)) {
    return true;
  }

  if (hasAny(tags) && intersects(facts.tagIds, tags)) {
    return true;
  }

  if (hasAny(positions) && intersects(facts.positionIds, positions)) {
    return true;
  }

  for (const segmentId of segmentIds) {
    if (await isInSegment(subdomain, segmentId, entityId, cache)) {
      return true;
    }
  }

  return false;
};

/** Resolve the active customer (buyer) dimension from the plan's customerType. */
const customerDimension = (
  plan: IPricingPlanDocument,
  context: IPricingContext,
): { kind: EntityKind; entityId?: string; rules: DimensionRules } => {
  if (plan.customerType === 'company') {
    return {
      kind: 'company',
      entityId: context.companyId,
      rules: {
        ids: plan.companyIds,
        tags: plan.companyTags,
        excludeTags: plan.companyExcludeTags,
        segmentIds: plan.companySegmentIds,
      },
    };
  }

  // Unset customerType is treated as 'customer'.
  return {
    kind: 'customer',
    entityId: context.customerId,
    rules: {
      ids: plan.customerIds,
      tags: plan.customerTags,
      excludeTags: plan.customerExcludeTags,
      segmentIds: plan.customerSegmentIds,
    },
  };
};

/**
 * Decide whether a pricing plan is eligible for the given customer + agent.
 *
 * Product targeting stays in getAllowedProducts(); this gate only covers the
 * who-dimensions. Both dimensions must pass (logical AND). The agent dimension
 * is always evaluated against a team-member/user.
 */
export const planMatchesContext = async (
  subdomain: string,
  plan: IPricingPlanDocument,
  context: IPricingContext,
  cache?: EligibilityCache,
): Promise<boolean> => {
  const customer = customerDimension(plan, context);

  const customerOk = await matchesDimension(
    subdomain,
    customer.kind,
    customer.entityId,
    customer.rules,
    cache,
  );

  if (!customerOk) {
    return false;
  }

  return matchesDimension(
    subdomain,
    'user',
    context.agentId,
    {
      ids: plan.agentUserIds,
      positions: plan.agentUserPositions,
      segmentIds: plan.agentSegmentIds,
    },
    cache,
  );
};
