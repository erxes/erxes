import { Connection, createConnection, Schema } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import { buildConversationResponsesPipeline } from '../utils';
import type { IReportFilters } from '../@types/reportFilters';

jest.mock('erxes-api-shared/utils', () => ({ escapeRegExp: jest.fn() }));
jest.mock('erxes-api-shared/core-modules', () => ({
  propertyDataPath: jest.fn(),
}));

const mongoUrl = process.env.REPORT_MONGO_TEST_URL;
const describeMongo = mongoUrl ? describe : describe.skip;

describeMongo('conversation response reports on MongoDB', () => {
  let connection: Connection;
  let models: IModels;

  beforeAll(async () => {
    if (!mongoUrl) throw new Error('REPORT_MONGO_TEST_URL is required');
    connection = await createConnection(mongoUrl, {
      dbName: `frontline_report_test_${process.pid}`,
    }).asPromise();
    const schema = new Schema({ _id: String }, { strict: false });
    const conversations = connection.model(
      'Conversation',
      schema,
      'conversations',
    );
    const integrations = connection.model(
      'Integration',
      schema,
      'integrations',
    );
    const histories = connection.model('CallHistory', schema, 'call_histories');
    // These database-backed fixtures implement the model methods used by the report.
    models = {
      Conversations: conversations,
      Integrations: integrations,
      CallHistory: histories,
    } as unknown as IModels;

    await integrations.insertMany([
      { _id: 'active', channelId: 'channel', kind: 'messenger' },
      {
        _id: 'inactive',
        channelId: 'channel',
        kind: 'messenger',
        isActive: false,
      },
      { _id: 'other', channelId: 'other-channel', kind: 'calls' },
    ]);
    await conversations.insertMany([
      {
        _id: 'open',
        integrationId: 'active',
        status: 'open',
        assignedUserIds: ['agent'],
      },
      {
        _id: 'closed',
        integrationId: 'active',
        status: 'closed',
        assignedUserId: 'agent',
      },
      { _id: 'archived', integrationId: 'active', status: 'archived' },
      { _id: 'deleted', integrationId: 'active', status: 'deleted' },
      { _id: 'inactive', integrationId: 'inactive', status: 'open' },
      { _id: 'other', integrationId: 'other', status: 'open' },
    ]);
    await connection.collection('messages').insertMany([
      ...[
        'open',
        'closed',
        'archived',
        'deleted',
        'inactive',
        'other',
        'missing',
      ].map((conversationId) => ({
        _id: conversationId,
        conversationId,
        internal: false,
        userId: 'agent',
        createdAt: new Date('2026-01-15'),
      })),
      {
        _id: 'internal',
        conversationId: 'open',
        internal: true,
        userId: 'agent',
        createdAt: new Date('2026-01-15'),
      },
      {
        _id: 'customer',
        conversationId: 'open',
        internal: false,
        createdAt: new Date('2026-01-15'),
      },
      {
        _id: 'old',
        conversationId: 'open',
        internal: false,
        userId: 'agent',
        createdAt: new Date('2025-01-15'),
      },
    ]);
  });

  afterAll(async () => {
    if (connection) {
      await connection.dropDatabase();
      await connection.close();
    }
  });

  const responseIds = async (filters: IReportFilters): Promise<string[]> => {
    const pipeline = await buildConversationResponsesPipeline(filters, models);
    const responses = await connection
      .collection('messages')
      .aggregate(pipeline)
      .toArray();
    return responses.map(({ _id }) => String(_id)).sort();
  };

  it('counts only agent replies in eligible conversations within the message date range', async () => {
    await expect(
      responseIds({ fromDate: '2026-01-01', toDate: '2026-01-31' }),
    ).resolves.toEqual(['closed', 'open', 'other']);
  });

  it('preserves channel, source, status and both assignee formats', async () => {
    await expect(
      responseIds({
        channelIds: ['channel'],
        source: 'messenger',
        memberIds: ['agent'],
        fromDate: '2026-01-01',
        toDate: '2026-01-31',
      }),
    ).resolves.toEqual(['closed', 'open']);
    await expect(
      responseIds({ status: 'closed', memberIds: ['agent'] }),
    ).resolves.toEqual(['closed']);
    await expect(responseIds({ channelIds: ['missing'] })).resolves.toEqual([]);
  });
});
