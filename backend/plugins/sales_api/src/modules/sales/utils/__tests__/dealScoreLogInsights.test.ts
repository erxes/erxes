import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { dealScoreLogInsights } from '../dealScoreLogs';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const lean = <T>(rows: T[]) => ({ lean: async () => rows });

const buildModels = (
  deals: {
    _id: string;
    stageId: string;
    scoreLogIds: string[];
    assignedUserIds?: string[];
    branchIds?: string[];
  }[],
) =>
  ({
    Deals: { find: () => lean(deals) },
    Stages: {
      find: () => lean([{ _id: 's1', name: 'Won', pipelineId: 'p1' }]),
    },
    Pipelines: {
      find: () => lean([{ _id: 'p1', name: 'Retail', boardId: 'b1' }]),
    },
    Boards: { find: () => lean([{ _id: 'b1', name: 'Shop' }]) },
  } as never);

describe('dealScoreLogInsights', () => {
  beforeEach(() => (sendTRPCMessage as jest.Mock).mockReset());

  it('counts a recalculation apart from what was first earned', async () => {
    // Earned 1000, then recalculated to 1200: reversal -1000, replacement 1200.
    (sendTRPCMessage as jest.Mock).mockResolvedValue([
      { targetId: 'd1', ownerId: 'c1', action: 'add', total: 1000, count: 1 },
      {
        targetId: 'd1',
        ownerId: 'c1',
        action: 'add',
        recalculates: 'add',
        total: 1200,
        count: 1,
      },
      {
        targetId: 'd1',
        ownerId: 'c1',
        action: 'refund',
        recalculates: 'add',
        total: -1000,
        count: 1,
      },
    ]);

    const result = await dealScoreLogInsights(
      buildModels([
        { _id: 'd1', stageId: 's1', scoreLogIds: ['a', 'a2', 'b'] },
      ]),
      'test',
      {},
    );

    expect(result.net).toBe(1200);
    // What was first given stays; the recalculation shows apart, no refund.
    expect(result.totals).toEqual([{ action: 'add', total: 1000, count: 1 }]);
    expect(result.recalculatedEarned).toBe(200);
    expect(result.recalculatedSpent).toBe(0);
    expect(result.byPipeline[0]).toMatchObject({
      earned: 1000,
      refunded: 0,
      recalculated: 200,
      net: 1200,
    });
    // Rankings read what the deal and customer earn now.
    expect(result.topDeals[0]).toMatchObject({ earned: 1200 });
    expect(result.topEarners[0]).toMatchObject({ id: 'c1', earned: 1200 });
  });

  it('groups loyalty totals so the kinds add up to the net', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue([
      { targetId: 'd1', ownerId: 'c1', action: 'add', total: 500, count: 1 },
      {
        targetId: 'd1',
        ownerId: 'c1',
        action: 'subtract',
        total: -200,
        count: 1,
      },
      {
        targetId: 'd2',
        ownerId: 'c2',
        action: 'refund',
        total: -100,
        count: 1,
      },
      { targetId: 'd2', ownerId: 'c2', action: 'expire', total: -50, count: 1 },
    ]);

    const result = await dealScoreLogInsights(
      buildModels([
        {
          _id: 'd1',
          stageId: 's1',
          scoreLogIds: ['l1', 'l2'],
          assignedUserIds: ['u1', 'u2'],
          branchIds: ['br1'],
        },
        { _id: 'd2', stageId: 's1', scoreLogIds: ['l3', 'l4'] },
      ]),
      'test',
      {},
    );

    expect(result.net).toBe(150);
    // Each assignee of d1 counts it in full.
    expect(result.byAssignee.map(({ id, earned }) => [id, earned])).toEqual([
      ['u1', 500],
      ['u2', 500],
    ]);
    expect(result.byBranch).toEqual([
      { id: 'br1', earned: 500, spent: -200, refunded: 0, net: 300 },
    ]);
    expect(result.topEarners.map(({ id }) => id)).toEqual(['c1']);
    expect(result.topSpenders.map(({ id, spent }) => [id, spent])).toEqual([
      ['c1', -200],
    ]);
    // d2 earned nothing, so it is no top deal.
    expect(result.topDeals).toEqual([
      {
        dealId: 'd1',
        dealName: undefined,
        pipelineName: 'Retail',
        earned: 500,
        net: 300,
      },
    ]);
    expect(result.dealCount).toBe(2);
    expect(result.customerCount).toBe(2);
    expect(result.byPipeline).toEqual([
      {
        pipelineId: 'p1',
        pipelineName: 'Retail',
        boardId: 'b1',
        boardName: 'Shop',
        earned: 500,
        spent: -200,
        recalculated: 0,
        refunded: -100,
        other: -50,
        net: 150,
      },
    ]);
  });

  it('asks loyalty in batches and nothing without linked entries', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue([]);

    await dealScoreLogInsights(buildModels([]), 'test', {});
    expect(sendTRPCMessage).not.toHaveBeenCalled();

    const scoreLogIds = Array.from({ length: 1500 }, (_, i) => `l${i}`);
    await dealScoreLogInsights(
      buildModels([{ _id: 'd1', stageId: 's1', scoreLogIds }]),
      'test',
      {},
    );

    const calls = (sendTRPCMessage as jest.Mock).mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0].input.ids).toHaveLength(1000);
    expect(calls[1][0].input.ids).toHaveLength(500);
  });
});
