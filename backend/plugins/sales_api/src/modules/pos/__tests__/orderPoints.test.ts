import { planOrderPoints } from '../orderPoints';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const buildModels = (earnScoreCampaignId?: string) =>
  ({
    Pos: {
      findOne: () => ({
        lean: async () => ({
          token: 'pos-token',
          paymentTypes: [{ type: 'points', scoreCampaignId: 'c1' }],
          earnScoreCampaignId,
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
const plan = (current: TOrderDoc, campaign: string | null = 'c1') =>
  planOrderPoints({
    models: buildModels(campaign ?? undefined),
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
