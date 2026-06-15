/**
 * Unit matrix for the customer + agent eligibility gate.
 *
 * `planMatchesContext` decides whether a pricing plan is allowed to apply to a
 * given buyer (customer OR company, per customerType) and agent (salesperson).
 * Product targeting is NOT covered here — that stays in getAllowedProducts().
 *
 * Contract under test (see backend/plugins/loyalty_api/AGENTS.md):
 *   - empty rule set                       → dimension unconstrained → passes
 *   - constrained dimension + missing id   → fails closed
 *   - excludeTags always disqualify
 *   - exclude-only set                     → "everyone except", passes otherwise
 *   - id OR tag OR position OR segment      → passes
 *   - customerType selects customer vs company; unset ⇒ customer
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
    customerType: 'customer',
    customerIds: [],
    customerTags: [],
    customerExcludeTags: [],
    customerSegmentIds: [],
    companyIds: [],
    companyTags: [],
    companyExcludeTags: [],
    companySegmentIds: [],
    agentUserIds: [],
    agentUserPositions: [],
    agentSegmentIds: [],
    ...overrides,
    // Boundary cast: building a full Mongoose document in a unit test is impractical.
  }) as unknown as IPricingPlanDocument;

/**
 * Dispatch tRPC mocks:
 *  - segment.isInSegment → membership from a `${segmentId}:${entityId}` map
 *  - {customers,companies,users}.findOne → entity doc with tagIds/positionIds
 */
const mockTRPC = (opts: {
  segments?: Record<string, boolean>;
  docs?: Record<string, { tagIds?: string[]; positionIds?: string[] }>;
}) => {
  const segments = opts.segments || {};
  const docs = opts.docs || {};

  mockedTRPC.mockImplementation(
    ({
      action,
      input,
    }: {
      action: string;
      input: { segmentId?: string; idToCheck?: string; _id?: string };
    }) => {
      if (action === 'isInSegment') {
        return segments[`${input.segmentId}:${input.idToCheck}`] ?? false;
      }
      if (action === 'findOne') {
        return docs[input._id as string] ?? null;
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

  it('never calls any core service when unconstrained', async () => {
    await planMatchesContext(SUBDOMAIN, plan(), { customerId: 'c1' });
    expect(mockedTRPC).not.toHaveBeenCalled();
  });
});

describe('planMatchesContext — customer ids', () => {
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

describe('planMatchesContext — customer tags', () => {
  it('passes when the customer shares a targeted tag', async () => {
    mockTRPC({ docs: { c1: { tagIds: ['vip', 'gold'] } } });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerTags: ['vip'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(true);
  });

  it('fails when the customer shares no targeted tag', async () => {
    mockTRPC({ docs: { c1: { tagIds: ['bronze'] } } });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerTags: ['vip'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(false);
  });

  it('disqualifies a customer carrying an excluded tag (exclusion wins)', async () => {
    mockTRPC({ docs: { c1: { tagIds: ['blocked', 'vip'] } } });
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerIds: ['c1'], customerExcludeTags: ['blocked'] }),
        { customerId: 'c1' },
      ),
    ).resolves.toBe(false);
  });

  it('passes a non-excluded customer when only an exclude list is set', async () => {
    mockTRPC({ docs: { c1: { tagIds: ['vip'] } } });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerExcludeTags: ['blocked'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(true);
  });
});

describe('planMatchesContext — customer segments', () => {
  it('passes when the customer is a member of the segment', async () => {
    mockTRPC({ segments: { 'seg-vip:c1': true } });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ customerSegmentIds: ['seg-vip'] }), {
        customerId: 'c1',
      }),
    ).resolves.toBe(true);
  });

  it('fails when the customer is not a member of any segment', async () => {
    mockTRPC({ segments: { 'seg-a:c1': false, 'seg-b:c1': false } });
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerSegmentIds: ['seg-a', 'seg-b'] }),
        { customerId: 'c1' },
      ),
    ).resolves.toBe(false);
  });

  it('passes when the customer is a member of ANY listed segment (OR)', async () => {
    mockTRPC({ segments: { 'seg-a:c1': false, 'seg-b:c1': true } });
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerSegmentIds: ['seg-a', 'seg-b'] }),
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

describe('planMatchesContext — company kind (customerType=company)', () => {
  it('matches against companyId, not customerId', async () => {
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerType: 'company', companyIds: ['co1'] }),
        { customerId: 'c1', companyId: 'co1' },
      ),
    ).resolves.toBe(true);
  });

  it('fails closed when company-typed but no companyId is supplied', async () => {
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerType: 'company', companyIds: ['co1'] }),
        { customerId: 'co1' },
      ),
    ).resolves.toBe(false);
  });

  it('ignores customer fields when the plan targets companies', async () => {
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({
          customerType: 'company',
          customerIds: ['c1'],
          companyIds: ['co1'],
        }),
        { customerId: 'c1', companyId: 'co9' },
      ),
    ).resolves.toBe(false);
  });

  it('matches a company by tag', async () => {
    mockTRPC({ docs: { co1: { tagIds: ['partner'] } } });
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerType: 'company', companyTags: ['partner'] }),
        { companyId: 'co1' },
      ),
    ).resolves.toBe(true);
  });
});

describe('planMatchesContext — agent dimension (user)', () => {
  it('passes when the agent is in the include list', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentUserIds: ['u1'] }), {
        agentId: 'u1',
      }),
    ).resolves.toBe(true);
  });

  it('fails when the agent is not in the include list', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentUserIds: ['u1'] }), {
        agentId: 'u2',
      }),
    ).resolves.toBe(false);
  });

  it('passes when the agent holds a targeted position', async () => {
    mockTRPC({ docs: { u1: { positionIds: ['pos-senior'] } } });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentUserPositions: ['pos-senior'] }), {
        agentId: 'u1',
      }),
    ).resolves.toBe(true);
  });

  it('fails when the agent holds none of the targeted positions', async () => {
    mockTRPC({ docs: { u1: { positionIds: ['pos-junior'] } } });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentUserPositions: ['pos-senior'] }), {
        agentId: 'u1',
      }),
    ).resolves.toBe(false);
  });

  it('passes an agent who is a member of an agent segment', async () => {
    mockTRPC({ segments: { 'seg-seniors:u1': true } });
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentSegmentIds: ['seg-seniors'] }), {
        agentId: 'u1',
      }),
    ).resolves.toBe(true);
  });

  it('fails closed when an agent constraint exists but no agentId is supplied', async () => {
    await expect(
      planMatchesContext(SUBDOMAIN, plan({ agentUserIds: ['u1'] }), {
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
        plan({ customerIds: ['c1'], agentUserIds: ['u1'] }),
        { customerId: 'c1', agentId: 'u1' },
      ),
    ).resolves.toBe(true);
  });

  it('fails when the customer passes but the agent does not', async () => {
    await expect(
      planMatchesContext(
        SUBDOMAIN,
        plan({ customerIds: ['c1'], agentUserIds: ['u1'] }),
        { customerId: 'c1', agentId: 'u9' },
      ),
    ).resolves.toBe(false);
  });

  it('short-circuits the agent check when the customer check already failed', async () => {
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

describe('caching — fail-closed + memoization', () => {
  it('isInSegment returns false (fails closed) on a falsy service result', async () => {
    mockedTRPC.mockResolvedValue(false);
    await expect(isInSegment(SUBDOMAIN, 'seg', 'c1')).resolves.toBe(false);
  });

  it('memoizes segment membership per (segmentId, entityId) across plans', async () => {
    mockTRPC({ segments: { 'seg-vip:c1': true } });
    const cache = new Map<string, unknown>();

    const planA = plan({ customerSegmentIds: ['seg-vip'] });
    const planB = plan({ _id: 'plan-2', customerSegmentIds: ['seg-vip'] });

    await planMatchesContext(SUBDOMAIN, planA, { customerId: 'c1' }, cache);
    await planMatchesContext(SUBDOMAIN, planB, { customerId: 'c1' }, cache);

    expect(mockedTRPC).toHaveBeenCalledTimes(1);
  });

  it('memoizes entity facts: tag + position lookups for one entity share a fetch', async () => {
    mockTRPC({ docs: { c1: { tagIds: ['vip'] } } });
    const cache = new Map<string, unknown>();

    const planA = plan({ customerTags: ['vip'] });
    const planB = plan({ _id: 'plan-2', customerTags: ['gold'] });

    await planMatchesContext(SUBDOMAIN, planA, { customerId: 'c1' }, cache);
    await planMatchesContext(SUBDOMAIN, planB, { customerId: 'c1' }, cache);

    // Both plans read c1's tags; the doc is fetched only once.
    expect(mockedTRPC).toHaveBeenCalledTimes(1);
  });
});
