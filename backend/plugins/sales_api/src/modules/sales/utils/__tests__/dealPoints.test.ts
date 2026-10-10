import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { planDealPoints, syncWrittenDealPoints } from '../dealPoints';
import { getCustomerIds } from '~/modules/sales/utils';
import { TLoyaltyRule, TLoyaltyTierRule } from '../loyaltyRules';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));
jest.mock('~/modules/sales/utils', () => ({ getCustomerIds: jest.fn() }));

const STAGES = {
  start: { _id: 'start', pipelineId: 'p1', probability: '10%' },
  won: { _id: 'won', pipelineId: 'p1', probability: 'Won' },
  lost: { _id: 'lost', pipelineId: 'p1', probability: 'Lost' },
};

const POINTS_PAYMENT = { type: 'points', scoreCampaignId: 'c1' };

const EVERY_BOARD: TLoyaltyRule = {
  _id: 'rule-board',
  type: 'everyBoard',
  scoreCampaignId: 'c1',
  earn: { probability: 'Won' },
  refund: { probability: 'Lost' },
};

const buildModels = (
  rules: TLoyaltyRule[] = [EVERY_BOARD],
  tierRules: TLoyaltyTierRule[] = [],
) =>
  ({
    Stages: {
      findOne: ({ _id }: { _id: string }) => ({
        lean: async () => STAGES[_id] || null,
      }),
    },
    Pipelines: {
      findOne: () => ({
        lean: async () => ({
          _id: 'p1',
          boardId: 'b1',
          paymentTypes: [POINTS_PAYMENT],
        }),
      }),
    },
    LoyaltyRules: {
      find: () => ({ lean: async () => rules }),
    },
    LoyaltyTierRules: {
      find: () => ({ lean: async () => tierRules }),
    },
  } as never);

type TDealDoc = {
  stageId: string;
  productsData?: {
    productId: string;
    amount: number;
    tickUsed?: boolean;
  }[];
  paymentsData?: Record<string, { amount: number }>;
};

const deal = (stageId: string, amount = 100_000, extra = {}): TDealDoc => ({
  stageId,
  productsData: [{ productId: 'coffee', amount, tickUsed: true }],
  ...extra,
});

const plan = (
  current: TDealDoc,
  previous?: TDealDoc,
  rules?: TLoyaltyRule[],
  tierRules?: TLoyaltyTierRule[],
) =>
  planDealPoints({
    subdomain: 'test',
    models: buildModels(rules, tierRules),
    dealId: 'deal-1',
    deal: current as never,
    oldDeal: previous as never,
  });

beforeEach(() => {
  (getCustomerIds as jest.Mock).mockResolvedValue(['customer-a', 'customer-b']);
});

describe('planDealPoints — earning follows where the deal stands', () => {
  it('earns on entering an earning stage', async () => {
    const result = await plan(deal('won'), deal('start'));

    expect(result).toMatchObject({
      kind: 'sync',
      customerId: 'customer-a',
      earns: [
        {
          campaignId: 'c1',
          ruleId: 'rule-board',
          totalAmount: 100_000,
          paidAmount: 100_000,
        },
      ],
    });
  });

  it('earns again from the current deal on every save while it stays there', async () => {
    const result = await plan(deal('won', 150_000), deal('won', 100_000));

    expect(result).toMatchObject({
      kind: 'sync',
      earns: [{ campaignId: 'c1', totalAmount: 150_000 }],
    });
  });

  it('earns again after coming back from a refund stage', async () => {
    const result = await plan(deal('won'), deal('lost'));

    expect(result).toMatchObject({
      kind: 'sync',
      earns: [{ campaignId: 'c1', totalAmount: 100_000 }],
    });
  });

  it('refunds on entering a refund stage', async () => {
    expect(await plan(deal('lost'), deal('won'))).toEqual({ kind: 'refund' });
  });

  it('does nothing while the deal stays in a refund stage', async () => {
    expect(await plan(deal('lost', 200_000), deal('lost'))).toEqual({
      kind: 'none',
    });
  });

  it('does nothing at a stage that neither earns nor refunds', async () => {
    expect(await plan(deal('start'), deal('won'))).toEqual({ kind: 'none' });
  });

  it('counts only rows used for score, less what was paid with points', async () => {
    const result = await plan(
      deal('won', 0, {
        productsData: [
          { productId: 'coffee', amount: 80_000, tickUsed: true },
          { productId: 'bag', amount: 20_000 },
        ],
        paymentsData: { points: { amount: 30_000 } },
      }),
      deal('start'),
    );

    expect(result).toMatchObject({
      kind: 'sync',
      earns: [{ campaignId: 'c1', totalAmount: 80_000, paidAmount: 50_000 }],
      spends: [{ campaignId: 'c1', pointsPaymentAmount: 30_000 }],
    });
  });

  it('earns and spends for the same, first customer', async () => {
    const result = await plan(
      deal('won', 100_000, { paymentsData: { points: { amount: 10_000 } } }),
      deal('start'),
    );

    expect(result).toMatchObject({ kind: 'sync', customerId: 'customer-a' });
  });

  it('earns nothing and does not fail without a customer', async () => {
    (getCustomerIds as jest.Mock).mockResolvedValue([]);

    const result = await plan(deal('won'), deal('start'));

    expect(result).toMatchObject({ kind: 'sync', customerId: undefined });
  });

  it('still refuses to pay with points without a customer', async () => {
    (getCustomerIds as jest.Mock).mockResolvedValue([]);

    await expect(
      plan(
        deal('won', 100_000, { paymentsData: { points: { amount: 10_000 } } }),
        deal('start'),
      ),
    ).rejects.toThrow('Attach a customer to pay with points');
  });

  it('earns once per campaign when several rules match', async () => {
    const result = await plan(deal('won'), deal('start'), [
      EVERY_BOARD,
      { ...EVERY_BOARD, _id: 'rule-copy' },
    ]);

    expect(result).toMatchObject({ kind: 'sync' });
    expect(
      result.kind === 'sync' ? result.earns.map((e) => e.campaignId) : [],
    ).toEqual(['c1']);
  });

  it('earns nothing in a pipeline no rule reaches', async () => {
    expect(await plan(deal('won'), deal('start'), [])).toEqual({
      kind: 'none',
    });
  });

  it('gives the same plan when the same deal is saved twice', async () => {
    const first = await plan(deal('won'), deal('won'));
    const second = await plan(deal('won'), deal('won'));

    expect(second).toEqual(first);
  });
});

describe('syncWrittenDealPoints — writes outside the deal mutations count too', () => {
  const askedOf = () =>
    (sendTRPCMessage as jest.Mock).mock.calls.map(([call]) => call.action);

  const syncWritten = (
    written: (TDealDoc & { _id: string })[],
    before?: (TDealDoc & { _id: string })[],
  ) => {
    const models = buildModels() as unknown as Record<string, unknown>;

    return syncWrittenDealPoints({
      subdomain: 'test',
      models: {
        ...models,
        Deals: { find: () => ({ lean: async () => written }) },
      } as never,
      before: before as never,
      dealIds: before ? undefined : written.map(({ _id }) => _id),
    });
  };

  beforeEach(() => {
    (sendTRPCMessage as jest.Mock).mockReset();
  });

  it('earns for a deal created straight into an earning stage', async () => {
    await syncWritten([{ _id: 'deal-1', ...deal('won') }]);

    expect(askedOf()).toEqual(['earn']);
  });

  it('gives back for a deal an automation moved to a refund stage', async () => {
    await syncWritten(
      [{ _id: 'deal-1', ...deal('lost') }],
      [{ _id: 'deal-1', ...deal('won') }],
    );

    expect(askedOf()).toEqual(['refund']);
  });

  it('asks nothing for a deal written where nothing earns', async () => {
    await syncWritten(
      [{ _id: 'deal-1', ...deal('start') }],
      [{ _id: 'deal-1', ...deal('start') }],
    );

    expect(askedOf()).toEqual([]);
  });
});

const WON_TIER: TLoyaltyTierRule = {
  _id: 'tier-board',
  type: 'everyBoard',
  accountTypeId: 'w1',
  bands: [{ tier: 'gold', min: 50_000 }],
  onlyUpgrade: true,
  earn: { probability: 'Won' },
};

describe('planDealPoints — the tier a purchase sets', () => {
  it('sets the tier by the score total where the rule says', async () => {
    expect(
      await plan(deal('won', 80_000), deal('start'), [], [WON_TIER]),
    ).toMatchObject({
      kind: 'sync',
      customerId: 'customer-a',
      earns: [],
      tier: {
        accountTypeId: 'w1',
        bands: WON_TIER.bands,
        onlyUpgrade: true,
        totalAmount: 80_000,
      },
    });
  });

  it('sets no tier elsewhere and never in a refund stage', async () => {
    expect(await plan(deal('start'), deal('won'), [], [WON_TIER])).toEqual({
      kind: 'none',
    });
    expect(
      await plan(deal('lost'), deal('won'), [EVERY_BOARD], [WON_TIER]),
    ).toEqual({ kind: 'refund' });
  });

  it('asks loyalty for the tier after the points', async () => {
    (sendTRPCMessage as jest.Mock).mockReset();

    await syncWrittenDealPoints({
      subdomain: 'test',
      models: {
        ...(buildModels([EVERY_BOARD], [WON_TIER]) as unknown as Record<
          string,
          unknown
        >),
        Deals: {
          find: () => ({
            lean: async () => [{ _id: 'deal-1', ...deal('won') }],
          }),
        },
      } as never,
      dealIds: ['deal-1'],
    });

    expect(
      (sendTRPCMessage as jest.Mock).mock.calls.map(([call]) => call.action),
    ).toEqual(['earn', 'applyPurchaseTier']);
    expect((sendTRPCMessage as jest.Mock).mock.calls[1][0].input).toMatchObject(
      { targetId: 'deal-1', targetName: 'deal-1', totalAmount: 100_000 },
    );
  });
});
