jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));

import type { IModels } from '~/connectionResolvers';
import Builder from '~/conversationQueryBuilder';

describe('inbox Created at filter', () => {
  const builder = new Builder({} as IModels, 'test', {}, { _id: 'viewer' });
  const start = '2026-10-05T16:00:00.000Z';
  const end = '2026-10-06T15:59:59.999Z';

  it('keeps creation date independent of recent updates and resolved status', () => {
    builder.queries = {
      integrations: { integrationId: { $in: ['fb'] } },
      status: builder.statusFilter(['closed']),
      createdAt: builder.dateFilter(start, end),
    };
    expect(builder.mainQuery()).toEqual({
      integrationId: { $in: ['fb'] },
      status: { $in: ['closed'] },
      createdAt: { $gte: new Date(start), $lte: new Date(end) },
    });
  });

  it('rejects invalid or reversed dates instead of substituting today', () => {
    expect(() => builder.dateFilter('invalid', end)).toThrow(
      'Invalid conversation date range',
    );
    expect(() => builder.dateFilter(end, start)).toThrow(
      'start date must precede',
    );
  });
});
