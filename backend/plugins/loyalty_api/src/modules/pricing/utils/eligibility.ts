import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export interface IPricingContext {
  customerId?: string;
  customerIds?: string[];
  companyId?: string;
  companyIds?: string[];
  userId?: string;
  userIds?: string[];
  brokerCustomerId?: string;
  brokerCustomerIds?: string[];
  brokerCompanyId?: string;
  brokerCompanyIds?: string[];
  brokerUserId?: string;
  brokerUserIds?: string[];
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

const compactIds = (ids: Array<string | undefined>): string[] =>
  ids.filter((id): id is string => !!id);

const mergeIds = (singular?: string, multiple?: string[]): string[] =>
  compactIds([singular, ...(multiple || [])]);

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
 * Evaluate one targeting dimension against one or more entities.
 *
 * Rules:
 *  - no rules at all                      → unconstrained, always passes
 *  - constrained but no entity ids supplied → fails closed (cannot prove match)
 *  - excludeTags match                    → disqualifies (exclusion wins)
 *  - only exclusion set                   → "everyone except", passes otherwise
 *  - else must match an include id OR tag OR position OR any listed segment
 */
const matchesDimension = async (
  subdomain: string,
  kind: EntityKind,
  entityIds: string[],
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

  if (entityIds.length === 0) {
    return false;
  }

  // Lazily load the entity's tags/positions only when a rule needs them.
  const needsFacts = hasAny(tags) || hasAny(excludeTags) || hasAny(positions);
  const factsList = needsFacts
    ? await Promise.all(
        entityIds.map((entityId) =>
          getEntityFacts(subdomain, kind, entityId, cache),
        ),
      )
    : [];

  // Exclusion wins.
  if (
    hasAny(excludeTags) &&
    factsList.some((facts) => intersects(facts.tagIds, excludeTags))
  ) {
    return false;
  }

  const hasIncludeRules =
    hasAny(ids) || hasAny(tags) || hasAny(segmentIds) || hasAny(positions);

  if (!hasIncludeRules) {
    return true;
  }

  if (intersects(ids, entityIds)) {
    return true;
  }

  if (
    hasAny(tags) &&
    factsList.some((facts) => intersects(facts.tagIds, tags))
  ) {
    return true;
  }

  if (
    hasAny(positions) &&
    factsList.some((facts) => intersects(facts.positionIds, positions))
  ) {
    return true;
  }

  for (const segmentId of segmentIds) {
    for (const entityId of entityIds) {
      if (await isInSegment(subdomain, segmentId, entityId, cache)) {
        return true;
      }
    }
  }

  return false;
};

interface ResolvedDimension {
  kind: EntityKind;
  entityIds: string[];
  rules: DimensionRules;
}

const customerDimensions = (
  plan: IPricingPlanDocument,
  context: IPricingContext,
): ResolvedDimension[] => [
  {
    kind: 'customer',
    entityIds: mergeIds(context.customerId, context.customerIds),
    rules: {
      ids: plan.customerIds,
      tags: plan.customerTags,
      excludeTags: plan.customerExcludeTags,
      segmentIds: plan.customerSegmentIds,
    },
  },
  {
    kind: 'company',
    entityIds: mergeIds(context.companyId, context.companyIds),
    rules: {
      ids: plan.companyIds,
      tags: plan.companyTags,
      excludeTags: plan.companyExcludeTags,
      segmentIds: plan.companySegmentIds,
    },
  },
  {
    kind: 'user',
    entityIds: mergeIds(context.userId, context.userIds),
    rules: {
      ids: plan.userIds,
      positions: plan.userPositions,
      segmentIds: plan.userSegmentIds,
    },
  },
];

const brokerDimensions = (
  plan: IPricingPlanDocument,
  context: IPricingContext,
): ResolvedDimension[] => [
  {
    kind: 'customer',
    entityIds: mergeIds(context.brokerCustomerId, context.brokerCustomerIds),
    rules: {
      ids: plan.brokerCustomerIds,
      tags: plan.brokerCustomerTags,
      excludeTags: plan.brokerCustomerExcludeTags,
      segmentIds: plan.brokerCustomerSegmentIds,
    },
  },
  {
    kind: 'company',
    entityIds: mergeIds(context.brokerCompanyId, context.brokerCompanyIds),
    rules: {
      ids: plan.brokerCompanyIds,
      tags: plan.brokerCompanyTags,
      excludeTags: plan.brokerCompanyExcludeTags,
      segmentIds: plan.brokerCompanySegmentIds,
    },
  },
  {
    kind: 'user',
    entityIds: mergeIds(context.brokerUserId, context.brokerUserIds),
    rules: {
      ids: plan.brokerUserIds,
      positions: plan.brokerUserPositions,
      segmentIds: plan.brokerUserSegmentIds,
    },
  },
];

const matchesDimensions = async (
  subdomain: string,
  dimensions: ResolvedDimension[],
  cache?: EligibilityCache,
): Promise<boolean> => {
  for (const dimension of dimensions) {
    const ok = await matchesDimension(
      subdomain,
      dimension.kind,
      dimension.entityIds,
      dimension.rules,
      cache,
    );

    if (!ok) {
      return false;
    }
  }

  return true;
};

/**
 * Decide whether a pricing plan is eligible for the given customer + broker.
 *
 * Product targeting stays in getAllowedProducts(); this gate only covers the
 * who-dimensions. Both dimensions must pass (logical AND).
 */
export const planMatchesContext = async (
  subdomain: string,
  plan: IPricingPlanDocument,
  context: IPricingContext,
  cache?: EligibilityCache,
): Promise<boolean> => {
  const customerOk = await matchesDimensions(
    subdomain,
    customerDimensions(plan, context),
    cache,
  );

  if (!customerOk) {
    return false;
  }

  return matchesDimensions(subdomain, brokerDimensions(plan, context), cache);
};
