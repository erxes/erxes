jest.mock('erxes-api-shared/core-modules', () => ({
  propertyDataPath: jest.fn(),
}));
jest.mock('erxes-api-shared/utils', () => ({
  escapeRegExp: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));

import type { PipelineStage } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import {
  buildConversationDateReport,
  buildConversationResponsesPipeline,
  generateConversationReportFilter,
} from '../utils';

const integrations = [
  { _id: 'fb', kind: 'facebook-messenger', channelId: 'support' },
  { _id: 'post', kind: 'facebook-post', channelId: 'support' },
  { _id: 'form', kind: 'lead', channelId: 'support' },
  { _id: 'legacy-form', kind: 'form', channelId: 'sales' },
  { _id: 'phone', kind: 'calls', channelId: 'support' },
  { _id: 'callpro', kind: 'callpro', channelId: 'support' },
];

const setup = () => {
  const find = jest.fn(
    (query: {
      channelId?: { $in: string[] };
      kind?: string | { $in: string[] };
    }) => ({
      lean: async () =>
        integrations.filter((integration) => {
          const kind = query.kind;
          return (
            (!query.channelId ||
              query.channelId.$in.includes(integration.channelId)) &&
            (!kind ||
              (typeof kind === 'string'
                ? integration.kind === kind
                : kind.$in.includes(integration.kind)))
          );
        }),
    }),
  );
  const aggregate = jest
    .fn<Promise<Array<{ _id: string; count: number }>>, [PipelineStage[]]>()
    .mockResolvedValue([{ _id: '2026-10-06', count: 1 }]);
  // Only the queried Mongoose model methods are needed by these filter utilities.
  const models = {
    Integrations: { find },
    Conversations: { aggregate },
  } as unknown as IModels;
  return { models, find, aggregate };
};

describe('conversation report source filters', () => {
  it('includes current lead forms and legacy form integrations', async () => {
    const { models } = setup();
    await expect(
      generateConversationReportFilter({ source: 'form' }, models),
    ).resolves.toEqual({
      integrationId: { $in: ['form', 'legacy-form'] },
    });
  });

  it('includes both call providers in Calls', async () => {
    const { models } = setup();
    await expect(
      generateConversationReportFilter({ source: 'calls' }, models),
    ).resolves.toEqual({
      integrationId: { $in: ['phone', 'callpro'] },
    });
  });

  it('intersects source and channel filters', async () => {
    const { models } = setup();
    await expect(
      generateConversationReportFilter(
        { source: 'form', channelIds: ['support'] },
        models,
      ),
    ).resolves.toEqual({
      integrationId: { $in: ['form'] },
    });
    await expect(
      generateConversationReportFilter(
        { source: 'facebook-post', channelIds: ['sales'] },
        models,
      ),
    ).resolves.toEqual({
      integrationId: { $in: [] },
    });
  });

  it('isolates Facebook messages from posts and clears All Sources', async () => {
    const { models } = setup();
    await expect(
      generateConversationReportFilter(
        { source: 'facebook-messenger' },
        models,
      ),
    ).resolves.toEqual({
      integrationId: { $in: ['fb'] },
    });
    await expect(
      generateConversationReportFilter({ source: 'all' }, models),
    ).resolves.toEqual({});
  });

  it('uses the same source families in response reports', async () => {
    const { models } = setup();
    const pipeline = await buildConversationResponsesPipeline(
      { source: 'form' },
      models,
    );
    expect(pipeline).toContainEqual({
      $match: expect.objectContaining({
        'integration.kind': { $in: ['lead', 'form'] },
      }),
    });
  });
});

describe('resolved chart dates', () => {
  it('filters by resolution date without also requiring creation in the range', async () => {
    const { models, aggregate } = setup();
    const range = {
      fromDate: '2026-10-05T16:00:00.000Z',
      toDate: '2026-10-06T15:59:59.999Z',
    };
    await expect(
      buildConversationDateReport(
        { ...range, source: 'facebook-messenger' },
        models,
        'closedAt',
        { status: 'closed' },
      ),
    ).resolves.toEqual([{ date: '2026-10-06', count: 1 }]);
    const stages = aggregate.mock.calls[0][0];
    expect(stages).toContainEqual({ $match: { status: 'closed' } });
    expect(stages).toContainEqual({
      $match: {
        closedAt: {
          $gte: new Date(range.fromDate),
          $lte: new Date(range.toDate),
        },
        integrationId: { $in: ['fb'] },
      },
    });
    expect(
      stages
        .filter((stage) => '$match' in stage)
        .some((stage) => '$match' in stage && 'createdAt' in stage.$match),
    ).toBe(false);
  });
});
