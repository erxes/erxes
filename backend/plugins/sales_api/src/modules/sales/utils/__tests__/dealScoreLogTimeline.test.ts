import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { dealScoreLogTimeline, timelineKeys } from '../dealScoreLogTimeline';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

const buildModels = (deals: { _id: string; scoreLogIds: string[] }[]) =>
  ({ Deals: { find: () => ({ lean: async () => deals }) } } as never);

// 2026-11-05 01:30 in Ulaanbaatar is still 11-04 in UTC.
const now = new Date('2026-11-04T17:30:00Z');

describe('timelineKeys', () => {
  it('ends with the current period in the asker’s time zone', () => {
    const days = timelineKeys('day', 'Asia/Ulaanbaatar', now);

    expect(days).toHaveLength(30);
    expect(days[29]).toBe('2026-11-05');
    expect(days[0]).toBe('2026-10-07');
    expect(timelineKeys('day', 'UTC', now)[29]).toBe('2026-11-04');
  });

  it('names weeks as ISO weeks and months by year', () => {
    const weeks = timelineKeys('week', 'Asia/Ulaanbaatar', now);

    expect(weeks).toHaveLength(26);
    expect(weeks[25]).toBe('2026-W45');
    // 2026-01-01 is a Thursday, so 2025-12-29 starts 2026-W01.
    expect(
      timelineKeys('week', 'UTC', new Date('2025-12-29T12:00:00Z'))[25],
    ).toBe('2026-W01');
    // The same keys local Mongo gives `%G-W%V` / `%Y-%m-%d` in Ulaanbaatar.
    for (const [at, week, day] of [
      ['2025-12-28T16:30:00Z', '2026-W01', '2025-12-29'],
      ['2026-01-04T20:00:00Z', '2026-W02', '2026-01-05'],
      ['2027-01-01T00:00:00Z', '2026-W53', '2027-01-01'],
    ]) {
      expect(timelineKeys('week', 'Asia/Ulaanbaatar', new Date(at))[25]).toBe(
        week,
      );
      expect(timelineKeys('day', 'Asia/Ulaanbaatar', new Date(at))[29]).toBe(
        day,
      );
    }
    expect(timelineKeys('month', 'UTC', now)).toEqual(
      expect.arrayContaining(['2025-12', '2026-11']),
    );
    expect(timelineKeys('month', 'UTC', now)[0]).toBe('2025-12');
  });
});

describe('dealScoreLogTimeline', () => {
  beforeEach(() => (sendTRPCMessage as jest.Mock).mockReset());

  it('fills empty periods and carries what came before', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue([
      { bucket: '2025-06', action: 'add', total: 1000 },
      // Recalculated from 1000 to 1200: neither a refund nor a new earning.
      { bucket: '2026-10', action: 'add', recalculates: 'add', total: 1200 },
      {
        bucket: '2026-10',
        action: 'refund',
        recalculates: 'add',
        total: -1000,
      },
      { bucket: '2026-11', action: 'refund', total: -50 },
      { bucket: '2026-11', action: 'subtract', total: -100 },
    ]);

    const { buckets } = await dealScoreLogTimeline(
      buildModels([{ _id: 'd1', scoreLogIds: ['a', 'b'] }]),
      'test',
      {},
      'month',
      'UTC',
      now,
    );

    expect(buckets).toHaveLength(12);
    expect(buckets[0]).toMatchObject({
      key: '2025-12',
      net: 0,
      cumulative: 1000,
    });
    expect(buckets[10]).toMatchObject({
      key: '2026-10',
      earned: 0,
      recalculated: 200,
      refunded: 0,
      cumulative: 1200,
    });
    expect(buckets[11]).toMatchObject({
      key: '2026-11',
      spent: -100,
      refunded: -50,
      net: -150,
      cumulative: 1050,
    });
  });

  it('asks loyalty in batches of 1000 with the period and zone', async () => {
    (sendTRPCMessage as jest.Mock).mockResolvedValue([]);

    await dealScoreLogTimeline(
      buildModels([
        {
          _id: 'd1',
          scoreLogIds: Array.from({ length: 1500 }, (_, i) => `l${i}`),
        },
      ]),
      'test',
      {},
      'week',
      'Asia/Ulaanbaatar',
      now,
    );

    const calls = (sendTRPCMessage as jest.Mock).mock.calls;

    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toMatchObject({
      action: 'timelineByIds',
      input: { interval: 'week', timezone: 'Asia/Ulaanbaatar' },
    });
    expect(calls[1][0].input.ids).toHaveLength(500);
  });
});
