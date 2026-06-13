/**
 * Unit matrix for the customer + agent eligibility gate.
 *
 * `planMatchesContext` decides whether a pricing plan is allowed to apply to a
 * given customer and agent (salesperson). Product targeting is NOT covered here
 * — that stays in getAllowedProducts(). These tests own the who-dimensions.
 *
 * Contract under test (see backend/plugins/loyalty_api/AGENTS.md):
 *   - empty include/exclude/segment lists  → dimension unconstrained → passes
 *   - constrained dimension + missing id   → fails closed
 *   - exclude list always disqualifies
 *   - exclude-only list                    → "everyone except", passes if not excluded
 *   - include id OR any segment membership → passes
 *   - customer AND agent must both pass    → plan applies
 */
import { IPricingPlanDocument } from '@/pricing/@types/pricingPlan';
import { isInSegment, planMatchesContext } from '../eligibility';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

const mockedTRPC = sendTRPCMessage as jest.Mock;

const SUBDOMAIN = 'test';

/** Build a plan with all who-dimensions empty (unconstrained) by default. */
const plan = (
  overrides: Partial<IPricingPlanDocument> = {},
): IPricingPlanDocument =>
  ({
    _id: 'plan-1',
    name: 'Test plan',
    status: 'active',
    customerIds: [],
    customerIdsExcluded: [],
    customerSegmentIds: [],
    agentIds: [],
    agentIdsExcluded: [],
    agentSegmentIds: [],
    ...overrides,
    // Boundary cast: building a full Mongoose document in a unit test is impractical.
  }) as unknown as IPricingPlanDocument;

/** Make isInSegment resolve membership from a `${segmentId}:${entityId}` map. */
const segmentMembership = (members: Record<string, boolean>) => {
  mockedTRPC.mockImplementation(
    ({
      action,
      input,
    }: {
      action: string;
      input: { segmentId: string; idToCheck: string };
    }) => {
      if (action === 'isInSegment') {
        return members[`${input.segmentId}:${input.idToCheck}`] ?? false;
      }
      return false;
    },
  );
};

beforeEach(() => {
  mockedTRPC.mockReset();
  mockedTRPC.mockResolvedValue(false);
});

describe('planMatchesContext — no constraints', () => {
  it('applies to anyone when no customer/agent constraints are set', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan(), { customerId: 'c1', agentId: 'u1' }),
    ).resolves.toBe(true);
  });

  it('applies even with an empty context (backwards compatible)', async () => {
    await expect(planMatchesContext(SUBDOMAIN, plan(), {})).resolves.toBe(true);
  });

  it('never calls the segment service when unconstrained', async () => {
    await planMatchesContext(SUBDOMAIN, plan(), { customerId: 'c1' });
    expect(mockedTRPC).not.toHaveBeenCalled();
  });
});

describe('planMatchesContext — customer ID lists', () => {
  it('passes when customerId is in the include list', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerIds: ['c1', 'c2'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(true);
  });

  it('fails when customerId is not in the include list', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerIds: ['c1'] }), {
        customerId: 'c9',
      }),
    ).resolves.toBe(false);
  });

  it('fails closed when an include list exists but no customerId is supplied', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerIds: ['c1'] }), {}),
    ).resolves.toBe(false);
  });
});

describe('planMatchesContext — customer exclusions', () => {
  it('disqualifies an excluded customer', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerIdsExcluded: ['c1'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(false);
  });

  it('passes a non-excluded customer when only an exclude list is set', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerIdsExcluded: ['c1'] }), {
        customerId: 'c2',
      }),
    ).resolves.toBe(true);
  });

  it('lets exclusion win even if the customer is also in the include list', async () => {
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerIds: ['c1'], customerIdsExcluded: ['c1'] }),
        { customerId: 'c1' },
      ),
    ).resolves.toBe(false);
  });
});

describe('planMatchesContext — customer segments', () => {
  it('passes when the customer is a member of the segment', async () => {
    segmentMembership({ 'seg-vip:c1': true });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerSegmentIds: ['seg-vip'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(true);
  });

  it('fails when the customer is not a member of the segment', async () => {
    segmentMembership({ 'seg-vip:c1': false });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerSegmentIds: ['seg-vip'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(false);
  });

  it('passes when the customer is a member of ANY of several segments (OR)', async () => {
    segmentMembership({ 'seg-a:c1': false, 'seg-b:c1': true });
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerSegmentIds: ['seg-a', 'seg-b'] }),
        { customerId: 'c1' },
      ),
    ).resolves.toBe(true);
  });

  it('passes via include id even when the segment does not match', async () => {
    segmentMembership({ 'seg-a:c1': false });
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerIds: ['c1'], customerSegmentIds: ['seg-a'] }),
        { customerId: 'c1' },
      ),
    ).resolves.toBe(true);
  });

  it('fails closed when a segment constraint exists but no customerId is supplied', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerSegmentIds: ['seg-a'] }), {}),
    ).resolves.toBe(false);
    expect(mockedTRPC).not.toHaveBeenCalled();
  });
});

describe('planMatchesContext — agent dimension', () => {
  it('passes when the agent is in the include list', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentIds: ['u1'] }), {
        agentId: 'u1',
      }),
    ).resolves.toBe(true);
  });

  it('fails when the agent is not in the include list', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentIds: ['u1'] }), {
        agentId: 'u2',
      }),
    ).resolves.toBe(false);
  });

  it('disqualifies an excluded agent', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentIdsExcluded: ['u1'] }), {
        agentId: 'u1',
      }),
    ).resolves.toBe(false);
  });

  it('passes an agent who is a member of an agent segment', async () => {
    segmentMembership({ 'seg-seniors:u1': true });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentSegmentIds: ['seg-seniors'] }), {
        agentId: 'u1',
      }),
    ).resolves.toBe(true);
  });

  it('fails closed when an agent constraint exists but no agentId is supplied', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentIds: ['u1'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(false);
  });
});

describe('planMatchesContext — customer AND agent combined', () => {
  it('applies only when BOTH dimensions pass', async () => {
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerIds: ['c1'], agentIds: ['u1'] }),
        { customerId: 'c1', agentId: 'u1' },
      ),
    ).resolves.toBe(true);
  });

  it('fails when the customer passes but the agent does not', async () => {
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerIds: ['c1'], agentIds: ['u1'] }),
        { customerId: 'c1', agentId: 'u9' },
      ),
    ).resolves.toBe(false);
  });

  it('fails when the agent passes but the customer does not', async () => {
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerIds: ['c1'], agentIds: ['u1'] }),
        { customerId: 'c9', agentId: 'u1' },
      ),
    ).resolves.toBe(false);
  });

  it('short-circuits the agent check when the customer check already failed', async () => {
    segmentMembership({});
    await planMatchesContext(
      SUBDOMAIN,
      plan({ customerIds: ['c1'], agentSegmentIds: ['seg-x'] }),
      { customerId: 'c9', agentId: 'u1' },
    );
    // customer failed on a plain id list (no tRPC), so the agent segment lookup
    // must never fire.
    expect(mockedTRPC).not.toHaveBeenCalled();
  });
});

describe('isInSegment — fail-closed + caching', () => {
  it('returns false (fails closed) when the segment service yields a falsy value', async () => {
    mockedTRPC.mockResolvedValue(false);
    await expect(isInSegment(SUBDOMAIN, 'seg', 'c1')).resolves.toBe(false);
  });

  it('memoizes membership per (segmentId, entityId) across plans via a shared cache', async () => {
    segmentMembership({ 'seg-vip:c1': true });
    const cache = new Map<string, boolean>();

    const planA = plan({ customerSegmentIds: ['seg-vip'] });
    const planB = plan({ _id: 'plan-2', customerSegmentIds: ['seg-vip'] });

    await planMatchesContext(SUBDOMAIN, planA, { customerId: 'c1' }, cache);
    await planMatchesContext(SUBDOMAIN, planB, { customerId: 'c1' }, cache);

    expect(mockedTRPC).toHaveBeenCalledTimes(1);
  });

  it('does NOT memoize across different entities for the same segment', async () => {
    segmentMembership({ 'seg-vip:c1': true, 'seg-vip:c2': false });
    const cache = new Map<string, boolean>();

    await isInSegment(SUBDOMAIN, 'seg-vip', 'c1', cache);
    await isInSegment(SUBDOMAIN, 'seg-vip', 'c2', cache);

    expect(mockedTRPC).toHaveBeenCalledTimes(2);
  });
});
