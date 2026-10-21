jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { fetchSegmentIds, isInSegment } from '../utils';

const mockedTRPC = sendTRPCMessage as jest.Mock;

describe('segment contract', () => {
  beforeEach(() => mockedTRPC.mockReset());

  it('pages fetchSegment through nextCursor until exhausted', async () => {
    mockedTRPC
      .mockResolvedValueOnce({ ids: ['a', 'b'], nextCursor: 'c1' })
      .mockResolvedValueOnce({ ids: ['c'] });

    await expect(fetchSegmentIds('sub', 'seg')).resolves.toEqual([
      'a',
      'b',
      'c',
    ]);

    expect(mockedTRPC).toHaveBeenCalledTimes(2);
    expect(mockedTRPC.mock.calls[0][0]).toMatchObject({
      module: 'segment',
      action: 'fetchSegment',
      input: { segmentId: 'seg', cursor: undefined, limit: 1000 },
    });
    expect(mockedTRPC.mock.calls[1][0].input.cursor).toBe('c1');
  });

  it('returns no ids when core is unavailable', async () => {
    mockedTRPC.mockImplementation(async ({ defaultValue }) => defaultValue);

    await expect(fetchSegmentIds('sub', 'seg')).resolves.toEqual([]);
  });

  it('routes isInSegment to the segment router', async () => {
    mockedTRPC.mockResolvedValueOnce(true);

    await expect(isInSegment('sub', 'seg', 'c1')).resolves.toBe(true);
    expect(mockedTRPC.mock.calls[0][0]).toMatchObject({
      module: 'segment',
      action: 'isInSegment',
      input: { segmentId: 'seg', idToCheck: 'c1' },
    });
  });
});
