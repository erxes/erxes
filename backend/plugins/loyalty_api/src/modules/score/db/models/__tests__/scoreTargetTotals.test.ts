import { loadScoreLogClass } from '@/score/db/models/ScoreLog';

const setup = (rows: { _id: string; total: number }[]) => {
  const aggregate = jest.fn(async () => rows);
  const schema = loadScoreLogClass(
    { ScoreLogs: { aggregate } } as never,
    'test',
    { createActivityLog: jest.fn() } as never,
  );
  const getTargetTotals = schema.statics.getTargetTotals as (
    ids: string[],
  ) => Promise<{ targetId: string; total: number }[]>;

  return { aggregate, getTargetTotals };
};

describe('ScoreLogs.getTargetTotals', () => {
  it('nets each record and asks once for distinct ids', async () => {
    const { aggregate, getTargetTotals } = setup([
      { _id: 'deal-1', total: 0.1 + 0.2 },
    ]);

    expect(await getTargetTotals(['deal-1', 'deal-1', 'deal-2'])).toEqual([
      { targetId: 'deal-1', total: 0.3 },
    ]);
    expect(aggregate.mock.calls[0][0][0]).toEqual({
      $match: { targetId: { $in: ['deal-1', 'deal-2'] } },
    });
  });

  it('asks nothing for no records and caps a long list', async () => {
    const { aggregate, getTargetTotals } = setup([]);

    expect(await getTargetTotals([])).toEqual([]);
    expect(aggregate).not.toHaveBeenCalled();

    await getTargetTotals(Array.from({ length: 600 }, (_, i) => `d-${i}`));
    expect(aggregate.mock.calls[0][0][0].$match.targetId.$in).toHaveLength(500);
  });
});
