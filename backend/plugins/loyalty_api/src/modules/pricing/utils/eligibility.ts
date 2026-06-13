import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export interface IPricingContext {
  customerId?: string;
  agentId?: string;
}

/**
 * Per-request memo of segment-membership checks, keyed `${segmentId}:${entityId}`.
 * Pass the same Map across every plan in one checkPricing call so that N plans
 * referencing the same segment fan out only a single isInSegment tRPC call.
 */
export type SegmentMembershipCache = Map<string, boolean>;

/**
 * Is a single entity (customer or agent/user) a member of a segment?
 * Wraps the core `segment.isInSegment` tRPC procedure and fails closed
 * (returns false) when the segment service is unreachable.
 */
export const isInSegment = async (
  subdomain: string,
  segmentId: string,
  idToCheck: string,
  cache?: SegmentMembershipCache,
): Promise<boolean> => {
  const key = `${segmentId}:${idToCheck}`;

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

/**
 * Evaluate one targeting dimension (customer OR agent).
 *
 * Rules:
 *  - no include/exclude/segment values  → unconstrained, always passes
 *  - constrained but no entityId supplied → fails closed (cannot prove match)
 *  - excluded list always wins (disqualifies)
 *  - only an exclude list set            → "everyone except", passes if not excluded
 *  - otherwise must match an include id OR be a member of any listed segment
 */
const matchesDimension = async (
  subdomain: string,
  entityId: string | undefined,
  includeIds: string[],
  excludedIds: string[],
  segmentIds: string[],
  cache?: SegmentMembershipCache,
): Promise<boolean> => {
  const isConstrained =
    includeIds.length > 0 || excludedIds.length > 0 || segmentIds.length > 0;

  if (!isConstrained) {
    return true;
  }

  if (!entityId) {
    return false;
  }

  if (excludedIds.includes(entityId)) {
    return false;
  }

  const hasIncludeRules = includeIds.length > 0 || segmentIds.length > 0;

  if (!hasIncludeRules) {
    return true;
  }

  if (includeIds.includes(entityId)) {
    return true;
  }

  for (const segmentId of segmentIds) {
    if (await isInSegment(subdomain, segmentId, entityId, cache)) {
      return true;
    }
  }

  return false;
};

/**
 * Decide whether a pricing plan is eligible for the given customer + agent.
 *
 * Product targeting stays in getAllowedProducts(); this gate only covers the
 * who-dimensions. Every dimension must pass (logical AND), matching the design:
 * `qualify customer AND agent AND product`.
 */
export const planMatchesContext = async (
  subdomain: string,
  plan: IPricingPlanDocument,
  context: IPricingContext,
  cache?: SegmentMembershipCache,
): Promise<boolean> => {
  const customerOk = await matchesDimension(
    subdomain,
    context.customerId,
    plan.customerIds || [],
    plan.customerIdsExcluded || [],
    plan.customerSegmentIds || [],
    cache,
  );

  if (!customerOk) {
    return false;
  }

  return matchesDimension(
    subdomain,
    context.agentId,
    plan.agentIds || [],
    plan.agentIdsExcluded || [],
    plan.agentSegmentIds || [],
    cache,
  );
};
