import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { drilledIds } from '../scoreLogSums';

jest.mock('erxes-api-shared/utils', () => ({ sendTRPCMessage: jest.fn() }));

describe('drilledIds', () => {
  beforeEach(() => (sendTRPCMessage as jest.Mock).mockReset());

  it('asks nothing when no kind or period is drilled', async () => {
    expect(await drilledIds('test', ['a'], {})).toBeNull();
    expect(sendTRPCMessage).not.toHaveBeenCalled();
  });

  it('asks loyalty in batches of 1000 and joins its answers', async () => {
    (sendTRPCMessage as jest.Mock)
      .mockResolvedValueOnce(['l1'])
      .mockResolvedValueOnce(['l1200']);

    const period = { interval: 'day', timezone: 'UTC', key: '2026-11-05' };
    const ids = Array.from({ length: 1500 }, (_, i) => `l${i}`);

    expect(await drilledIds('test', ids, { kind: 'refunded', period })).toEqual(
      ['l1', 'l1200'],
    );

    const calls = (sendTRPCMessage as jest.Mock).mock.calls;

    expect(calls[0][0]).toMatchObject({
      action: 'filterIds',
      input: { kind: 'refunded', period },
    });
    expect(calls[0][0].input.ids).toHaveLength(1000);
    expect(calls[1][0].input.ids).toHaveLength(500);
  });
});
