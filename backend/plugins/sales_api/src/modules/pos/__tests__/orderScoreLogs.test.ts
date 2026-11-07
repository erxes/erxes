import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { posOrderScoreLogInsights } from '../utils/orderScoreLogs';
import { refundOrderPoints, spendOrderPoints } from '../utils';

jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
  checkServiceRunning: jest.fn(),
  isEnabled: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  sendAutomationTrigger: jest.fn(),
}));

const lean = <T>(rows: T) => ({ lean: async () => rows });

describe('POS orders link the loyalty entries they cause', () => {
  const addScoreLogs = jest.fn();
  const models = {
    Pos: {
      findOne: () =>
        lean({ paymentTypes: [{ type: 'points', scoreCampaignId: 'c1' }] }),
    },
    PosOrders: { addScoreLogs },
  } as never;
  const order = {
    _id: 'o1',
    customerId: 'cus1',
    posToken: 't1',
    paidAmounts: [{ type: 'points', amount: 500 }],
    totalAmount: 1000,
  } as never;

  beforeEach(() => {
    addScoreLogs.mockReset();
    (sendTRPCMessage as jest.Mock).mockReset();
  });

  it('links a spend and both entries of its recalculation', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue({
      _id: 'log-2',
      scoreLogIds: ['rev-1', 'log-2'],
    });

    await spendOrderPoints('test', models, order);

    expect(addScoreLogs).toHaveBeenCalledWith('o1', ['rev-1', 'log-2']);
  });

  it('links what a return wrote', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue([
      { _id: 'refund-1' },
      { _id: 'refund-2' },
    ]);

    await refundOrderPoints('test', models, order);

    expect(addScoreLogs).toHaveBeenCalledWith('o1', ['refund-1', 'refund-2']);
  });
});

describe('posOrderScoreLogInsights', () => {
  it('groups by POS, cashier and branch, recalculations apart', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue([
      { targetId: 'o1', ownerId: 'c1', action: 'add', total: 100, count: 1 },
      {
        targetId: 'o1',
        ownerId: 'c1',
        action: 'add',
        recalculates: 'add',
        total: 80,
        count: 1,
      },
      {
        targetId: 'o1',
        ownerId: 'c1',
        action: 'refund',
        recalculates: 'add',
        total: -100,
        count: 1,
      },
      {
        targetId: 'o2',
        ownerId: 'c2',
        action: 'subtract',
        total: -30,
        count: 1,
      },
    ]);

    const result = await posOrderScoreLogInsights(
      {
        PosOrders: {
          find: () =>
            lean([
              {
                _id: 'o1',
                number: '001',
                posToken: 't1',
                userId: 'u1',
                branchId: 'b1',
                scoreLogIds: ['a', 'b', 'c'],
              },
              {
                _id: 'o2',
                number: '002',
                posToken: 't1',
                userId: 'u2',
                scoreLogIds: ['d'],
              },
            ]),
        },
        Pos: { find: () => lean([{ _id: 'p1', name: 'Shop', token: 't1' }]) },
      } as never,
      'test',
      {},
    );

    expect(result.net).toBe(50);
    expect(result.recalculatedEarned).toBe(-20);
    expect(result.orderCount).toBe(2);
    expect(result.byPos).toEqual([
      {
        posId: 'p1',
        posName: 'Shop',
        earned: 100,
        spent: -30,
        refunded: 0,
        other: 0,
        recalculated: -20,
        net: 50,
      },
    ]);
    expect(result.topOrders).toEqual([
      {
        orderId: 'o1',
        orderNumber: '001',
        posName: 'Shop',
        earned: 80,
        net: 80,
      },
    ]);
    expect(result.byCashier.map(({ id }) => id)).toEqual(['u1']);
    expect(result.byBranch.map(({ id, earned }) => [id, earned])).toEqual([
      ['b1', 80],
    ]);
  });
});
