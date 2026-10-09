import { planOrderPoints, validateEarnTier } from '../orderPoints';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const buildModels = (earnScoreCampaignId?: string, earnTier?: unknown) =>
  ({
    Pos: {
      findOne: () => ({
        lean: async () => ({
          token: 'pos-token',
          paymentTypes: [{ type: 'points', scoreCampaignId: 'c1' }],
          earnScoreCampaignId,
          earnTier,
        }),
      }),
    },
  } as never);

type TOrderDoc = {
  _id: string;
  posToken: string;
  status: string;
  customerId?: string;
  paidDate?: Date;
  totalAmount: number;
  items: { productId: string; count: number; unitPrice: number }[];
  paidAmounts?: { type: string; amount: number }[];
};

const order = (extra: Partial<TOrderDoc> = {}): TOrderDoc => ({
  _id: 'order-1',
  posToken: 'pos-token',
  status: 'complete',
  customerId: 'customer-a',
  paidDate: new Date('2026-10-08T10:00:00Z'),
  totalAmount: 30_000,
  items: [{ productId: 'latte', count: 2, unitPrice: 15_000 }],
  ...extra,
});

// `null`: a POS with no earning campaign.
const plan = (
  current: TOrderDoc,
  campaign: string | null = 'c1',
  earnTier?: unknown,
) =>
  planOrderPoints({
    models: buildModels(campaign ?? undefined, earnTier),
    order: current as never,
  });

describe('planOrderPoints — a paid order earns, a returned one gives back', () => {
  it('earns once the order is paid', async () => {
    expect(await plan(order())).toMatchObject({
      kind: 'sync',
      customerId: 'customer-a',
      earns: [
        {
          campaignId: 'c1',
          totalAmount: 30_000,
          paidAmount: 30_000,
          items: [{ productId: 'latte', amount: 30_000 }],
        },
      ],
    });
  });

  it('earns on what was paid with money, not points', async () => {
    expect(
      await plan(order({ paidAmounts: [{ type: 'points', amount: 5_000 }] })),
    ).toMatchObject({
      kind: 'sync',
      earns: [{ campaignId: 'c1', totalAmount: 30_000, paidAmount: 25_000 }],
    });
  });

  it('earns nothing before it is paid', async () => {
    expect(await plan(order({ paidDate: undefined }))).toEqual({
      kind: 'none',
    });
  });

  it('gives everything back once returned', async () => {
    expect(await plan(order({ status: 'return' }))).toEqual({
      kind: 'refund',
    });
  });

  it('earns nothing and does not fail without a customer', async () => {
    expect(await plan(order({ customerId: undefined }))).toMatchObject({
      kind: 'sync',
      customerId: undefined,
    });
  });

  it('earns nothing at a POS with no earning campaign', async () => {
    expect(await plan(order(), null)).toEqual({ kind: 'none' });
  });

  it('gives the same plan when the same order is synced again', async () => {
    expect(await plan(order())).toEqual(await plan(order()));
  });
});

describe('planOrderPoints — the tier a paid order sets', () => {
  const EARN_TIER = {
    accountTypeId: 'w1',
    bands: [{ tier: 'gold', min: 20_000 }],
    onlyUpgrade: true,
  };

  it('sets the tier by the order total, with or without points', async () => {
    expect(await plan(order(), null, EARN_TIER)).toMatchObject({
      kind: 'sync',
      earns: [],
      tier: { ...EARN_TIER, totalAmount: 30_000 },
    });
    expect(await plan(order(), 'c1', EARN_TIER)).toMatchObject({
      earns: [{ campaignId: 'c1' }],
      tier: { accountTypeId: 'w1' },
    });
  });

  it('leaves the tier alone on a return', async () => {
    expect(await plan(order({ status: 'return' }), null, EARN_TIER)).toEqual({
      kind: 'refund',
    });
  });
});

describe('validateEarnTier', () => {
  it('needs a wallet and a tier on every band, and lets none through', () => {
    expect(() => validateEarnTier(null)).not.toThrow();
    expect(() =>
      validateEarnTier({ accountTypeId: '', bands: [{ tier: 'gold' }] }),
    ).toThrow('Choose a wallet for the tier');
    expect(() =>
      validateEarnTier({ accountTypeId: 'w1', bands: [{ tier: '' }] }),
    ).toThrow('Give every tier band a tier');
  });
});
