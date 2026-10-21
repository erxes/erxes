jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  fixDate: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));

import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import Builder from '~/conversationQueryBuilder';

const mockedTRPC = sendTRPCMessage as jest.Mock;

describe('conversation segment filter', () => {
  beforeEach(() => mockedTRPC.mockReset());

  it('collects every member page from fetchSegment', async () => {
    mockedTRPC
      .mockResolvedValueOnce({ ids: ['c1', 'c2'], nextCursor: 'next' })
      .mockResolvedValueOnce({ ids: ['c3'] });

    const builder = new Builder(
      {} as IModels,
      'sub',
      { limit: 10 },
      { _id: 'u1' },
    );

    await expect(builder.segmentFilter('seg')).resolves.toEqual({
      _id: { $in: ['c1', 'c2', 'c3'] },
    });
    expect(mockedTRPC.mock.calls[0][0]).toMatchObject({
      module: 'segment',
      action: 'fetchSegment',
      input: { segmentId: 'seg', limit: 1000 },
    });
    expect(mockedTRPC.mock.calls[1][0].input.cursor).toBe('next');
  });
});
