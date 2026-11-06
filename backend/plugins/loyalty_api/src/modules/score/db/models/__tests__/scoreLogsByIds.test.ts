import { loadScoreLogClass } from '@/score/db/models/ScoreLog';

const setup = () => {
  const lean = jest.fn(async () => [{ _id: 'log-1' }]);
  const find = jest.fn(() => ({ lean }));
  const schema = loadScoreLogClass({ ScoreLogs: { find } } as never, 'test', {
    createActivityLog: jest.fn(),
  } as never);
  const getByIds = schema.statics.getByIds as (
    ids: string[],
  ) => Promise<{ _id: string }[]>;

  return { find, getByIds };
};

describe('ScoreLogs.getByIds', () => {
  it('finds each distinct id once', async () => {
    const { find, getByIds } = setup();

    expect(await getByIds(['log-1', 'log-1', 'log-2'])).toEqual([
      { _id: 'log-1' },
    ]);
    expect(find).toHaveBeenCalledWith({ _id: { $in: ['log-1', 'log-2'] } });
  });

  it('asks nothing for no ids and caps a long list', async () => {
    const { find, getByIds } = setup();

    expect(await getByIds([])).toEqual([]);
    expect(find).not.toHaveBeenCalled();

    await getByIds(Array.from({ length: 150 }, (_, i) => `log-${i}`));
    expect(find.mock.calls[0][0]._id.$in).toHaveLength(100);
  });
});

describe('ScoreLogs.getTotalsByIds', () => {
  const setupTotals = (rows: unknown[], reversals: unknown[] = []) => {
    const aggregate = jest.fn(async () => rows);
    const find = jest.fn(() => ({ lean: async () => reversals }));
    const schema = loadScoreLogClass(
      { ScoreLogs: { aggregate, find } } as never,
      'test',
      { createActivityLog: jest.fn() } as never,
    );
    const getTotalsByIds = schema.statics.getTotalsByIds as (
      ids: string[],
    ) => Promise<unknown[]>;

    return { aggregate, find, getTotalsByIds };
  };

  it('sums the given entries per record, owner and action', async () => {
    const { aggregate, getTotalsByIds } = setupTotals([
      {
        _id: { targetId: 'deal-1', ownerId: 'c1', action: 'add' },
        total: 0.1 + 0.2,
        count: 2,
      },
    ]);

    expect(await getTotalsByIds(['log-1', 'log-1', 'log-2'])).toEqual([
      {
        targetId: 'deal-1',
        ownerId: 'c1',
        action: 'add',
        total: 0.3,
        count: 2,
      },
    ]);
    expect(aggregate.mock.calls[0][0][0]).toEqual({
      $match: { _id: { $in: ['log-1', 'log-2'] } },
    });
  });

  it('marks the entry that replaced a reversed one as a recalculation', async () => {
    const { aggregate, find, getTotalsByIds } = setupTotals(
      [],
      [{ replacedByScoreLogId: 'log-2' }],
    );

    await getTotalsByIds(['log-1', 'log-2']);

    expect(find).toHaveBeenCalledWith(
      { replacedByScoreLogId: { $in: ['log-1', 'log-2'] } },
      { replacedByScoreLogId: 1 },
    );
    expect(
      aggregate.mock.calls[0][0][1].$group._id.recalculates.$cond[2],
    ).toEqual({ $cond: [{ $in: ['$_id', ['log-2']] }, '$action', null] });
  });

  it('asks nothing for no ids and caps a long list', async () => {
    const { aggregate, getTotalsByIds } = setupTotals([]);

    expect(await getTotalsByIds([])).toEqual([]);
    expect(aggregate).not.toHaveBeenCalled();

    await getTotalsByIds(Array.from({ length: 1200 }, (_, i) => `log-${i}`));
    expect(aggregate.mock.calls[0][0][0].$match._id.$in).toHaveLength(1000);
  });
});

describe('ScoreLogs.writtenWith', () => {
  const setupWritten = (reversal: { _id: string } | null) => {
    const findOne = jest.fn(() => ({ lean: async () => reversal }));
    const schema = loadScoreLogClass(
      { ScoreLogs: { findOne } } as never,
      'test',
      { createActivityLog: jest.fn() } as never,
    );
    const writtenWith = schema.statics.writtenWith as (log: {
      _id: string;
    }) => Promise<string[]>;

    return { findOne, writtenWith };
  };

  it('returns a correction reversal with the entry that replaced it', async () => {
    const { findOne, writtenWith } = setupWritten({ _id: 'rev-1' });

    expect(await writtenWith({ _id: 'log-2' })).toEqual(['rev-1', 'log-2']);
    expect(findOne).toHaveBeenCalledWith(
      { replacedByScoreLogId: 'log-2' },
      { _id: 1 },
    );
  });

  it('returns the entry alone when it replaced nothing', async () => {
    const { writtenWith } = setupWritten(null);

    expect(await writtenWith({ _id: 'log-1' })).toEqual(['log-1']);
  });
});

describe('ScoreLogs.getTimelineByIds', () => {
  const setupTimeline = (rows: unknown[]) => {
    const aggregate = jest.fn(async () => rows);
    const find = jest.fn(() => ({ lean: async () => [] }));
    const schema = loadScoreLogClass(
      { ScoreLogs: { aggregate, find } } as never,
      'test',
      { createActivityLog: jest.fn() } as never,
    );
    const getTimelineByIds = schema.statics.getTimelineByIds as (
      ids: string[],
      interval: string,
      timezone: string,
    ) => Promise<unknown[]>;

    return { aggregate, getTimelineByIds };
  };

  it('cuts periods in the asked time zone', async () => {
    const { aggregate, getTimelineByIds } = setupTimeline([
      {
        _id: { bucket: '2026-W45', action: 'add', recalculates: null },
        total: 0.1 + 0.2,
        count: 2,
      },
    ]);

    expect(
      await getTimelineByIds(['log-1'], 'week', 'Asia/Ulaanbaatar'),
    ).toEqual([
      {
        bucket: '2026-W45',
        action: 'add',
        recalculates: null,
        total: 0.3,
        count: 2,
      },
    ]);
    expect(aggregate.mock.calls[0][0][1].$group._id.bucket).toEqual({
      $dateToString: {
        date: '$createdAt',
        format: '%G-W%V',
        timezone: 'Asia/Ulaanbaatar',
      },
    });
  });

  it('asks nothing for no ids', async () => {
    const { aggregate, getTimelineByIds } = setupTimeline([]);

    expect(await getTimelineByIds([], 'day', 'UTC')).toEqual([]);
    expect(aggregate).not.toHaveBeenCalled();
  });
});

describe('ScoreLogs.filterIds', () => {
  const setupFilter = (rows: { _id: string }[]) => {
    const aggregate = jest.fn(async () => rows);
    const find = jest.fn(() => ({ lean: async () => [] }));
    const schema = loadScoreLogClass(
      { ScoreLogs: { aggregate, find } } as never,
      'test',
      { createActivityLog: jest.fn() } as never,
    );
    const filterIds = schema.statics.filterIds as (
      ids: string[],
      filter: Record<string, unknown>,
    ) => Promise<string[]>;

    return { aggregate, filterIds };
  };

  it('keeps the entries of one kind in one period', async () => {
    const { aggregate, filterIds } = setupFilter([{ _id: 'log-2' }]);

    expect(
      await filterIds(['log-1', 'log-2'], {
        kind: 'refunded',
        period: { interval: 'day', timezone: 'UTC', key: '2026-11-05' },
      }),
    ).toEqual(['log-2']);

    const [, addFields, match] = aggregate.mock.calls[0][0];

    expect(addFields.$addFields.bucket.$dateToString).toMatchObject({
      format: '%Y-%m-%d',
      timezone: 'UTC',
    });
    expect(match).toEqual({
      $match: { kind: 'refunded', bucket: '2026-11-05' },
    });
  });

  it('asks nothing for no ids', async () => {
    const { aggregate, filterIds } = setupFilter([]);

    expect(await filterIds([], { kind: 'earned' })).toEqual([]);
    expect(aggregate).not.toHaveBeenCalled();
  });
});
