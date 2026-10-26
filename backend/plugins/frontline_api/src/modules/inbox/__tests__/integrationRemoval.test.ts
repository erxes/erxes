import { randomUUID } from 'node:crypto';
import mongoose, { Schema, type Connection } from 'mongoose';
import type { IModels } from '~/connectionResolvers';
import type { IIntegrationDocument } from '@/inbox/@types/integrations';
import type { IConversationDocument } from '@/inbox/@types/conversations';
import { loadClass } from '@/inbox/db/models/Integrations';
import { loadClass as loadConversationClass } from '@/inbox/db/models/Conversations';
import {
  buildConversationResponsesPipeline,
  buildConversationStatusCountReport,
  generateConversationReportFilter,
} from '@/reports/utils';
import { migrateDeletedIntegrationConversations } from '~/migrations/migrateDeletedIntegrationConversations';

jest.mock('erxes-api-shared/utils', () => ({
  mongooseStringRandomId: { type: String },
  cleanHtml: async (content: string) => content,
  schemaWrapper: (schema: Schema) => {
    schema.add({ _id: String });
    return schema;
  },
}));
jest.mock('@/inbox/meta/segments', () => ({ conversationsChanged: jest.fn() }));
jest.mock('erxes-api-shared/core-modules', () => ({
  ruleSchema: new (jest.requireActual<typeof import('mongoose')>(
    'mongoose',
  ).Schema)({}),
}));

const mongoSuite =
  process.env.FRONTLINE_MONGO_TESTS === '1' ? describe : describe.skip;

mongoSuite('integration removal with retained conversation history', () => {
  let connection: Connection;
  let otherTenant: Connection;
  let models: IModels;

  beforeAll(async () => {
    const database = `erxes_integration_test_${randomUUID().replace(/-/g, '')}`;
    connection = await mongoose
      .createConnection(`mongodb://127.0.0.1:27017/${database}`)
      .asPromise();
    otherTenant = await mongoose
      .createConnection(`mongodb://127.0.0.1:27017/${database}_other`)
      .asPromise();
    // Only these plugin-owned models are needed at this persistence boundary.
    models = {} as IModels;
    models.Conversations = connection.model<
      IConversationDocument,
      IModels['Conversations']
    >('conversations', loadConversationClass(models, 'test'));
    models.Integrations = connection.model<
      IIntegrationDocument,
      IModels['Integrations']
    >('integrations', loadClass(models, 'test'));
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    await otherTenant.dropDatabase();
    await models.Integrations.create([
      { _id: 'removed', kind: 'messenger', channelId: 'channel-a' },
      { _id: 'kept', kind: 'messenger', channelId: 'channel-a' },
    ]);
    await models.Conversations.create([
      {
        _id: 'history',
        integrationId: 'removed',
        status: 'closed',
        closedAt: new Date('2026-08-17T12:00:00Z'),
      },
      { _id: 'active', integrationId: 'kept', status: 'open' },
    ]);
    await connection.collection('conversation_messages').insertMany([
      {
        _id: 'reply-1',
        conversationId: 'history',
        userId: 'u1',
        internal: false,
      },
      {
        _id: 'reply-2',
        conversationId: 'active',
        userId: 'u1',
        internal: false,
      },
    ]);
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => {
    await connection?.dropDatabase();
    await otherTenant?.dropDatabase();
    await connection?.close();
    await otherTenant?.close();
  });

  it('retains history and messages, excludes it from reports, and isolates tenants', async () => {
    await otherTenant.collection('conversations').insertOne({
      integrationId: 'removed',
      status: 'open',
    });
    await models.Integrations.removeIntegration('removed');

    expect(await models.Conversations.findById('history').lean()).toMatchObject(
      {
        status: 'deleted',
        closedAt: new Date('2026-08-17T12:00:00Z'),
      },
    );
    expect(await models.Integrations.exists({ _id: 'removed' })).toBeNull();
    expect(await models.Integrations.exists({ _id: 'kept' })).not.toBeNull();
    expect(
      await connection.collection('conversation_messages').countDocuments(),
    ).toBe(2);
    expect(
      await otherTenant.collection('conversations').findOne(),
    ).toMatchObject({ status: 'open' });

    const integrationsRead = jest.spyOn(models.Integrations, 'find');
    const filter = await generateConversationReportFilter({}, models);
    expect(await models.Conversations.find(filter).distinct('_id')).toEqual([
      'active',
    ]);
    const deletedFilter = await generateConversationReportFilter(
      { status: 'deleted' },
      models,
    );
    expect(await models.Conversations.countDocuments(deletedFilter)).toBe(0);
    const responses = await buildConversationResponsesPipeline({}, models);
    expect(responses).not.toBeNull();
    expect(
      await connection
        .collection('conversation_messages')
        .aggregate(responses ?? [])
        .toArray(),
    ).toHaveLength(1);
    expect(integrationsRead).not.toHaveBeenCalled();
  });

  it('handles batch and repeated removals without deleting conversations', async () => {
    await models.Integrations.removeIntegrations(['removed', 'kept']);
    await models.Integrations.removeIntegration('removed');
    expect(
      await models.Conversations.countDocuments({ status: 'deleted' }),
    ).toBe(2);
    expect(await models.Integrations.countDocuments()).toBe(0);
  });

  it('does not revive deleted history through late status changes or bulk resolution', async () => {
    await models.Integrations.removeIntegration('removed');
    await models.Conversations.reopen('history');
    await models.Conversations.changeStatusConversation(
      ['history', 'active'],
      'open',
      'u1',
    );
    await models.Conversations.resolveAllConversation({}, { status: 'closed' });
    expect(await models.Conversations.findById('history').lean()).toMatchObject(
      { status: 'deleted' },
    );
    expect(await models.Conversations.findById('active').lean()).toMatchObject({
      status: 'closed',
    });
  });

  it('resolves the integration scope once for a KPI numerator and denominator', async () => {
    const integrationRead = jest.spyOn(models.Integrations, 'find');
    await expect(
      buildConversationStatusCountReport(
        { channelIds: ['channel-a'] },
        models,
        { statusDefault: 'closed', dateField: 'closedAt' },
      ),
    ).resolves.toEqual({ count: 1, percentage: 50 });
    expect(integrationRead).toHaveBeenCalledTimes(1);
  });

  it('leaves integrations in place when marking their history fails', async () => {
    jest
      .spyOn(models.Conversations, 'updateMany')
      .mockRejectedValueOnce(new Error('write failed'));
    await expect(
      models.Integrations.removeIntegration('removed'),
    ).rejects.toThrow('write failed');
    expect(await models.Integrations.exists({ _id: 'removed' })).not.toBeNull();
    expect(await models.Conversations.findById('history').lean()).toMatchObject(
      { status: 'closed' },
    );
  });

  it('backfills old orphaned history only on apply and keeps an original backup', async () => {
    await models.Integrations.deleteOne({ _id: 'removed' });
    const db = connection.db;
    if (!db) throw new Error('Test database is not connected');

    await expect(migrateDeletedIntegrationConversations(db)).resolves.toEqual({
      matched: 1,
      modified: 0,
    });
    expect(await models.Conversations.findById('history').lean()).toMatchObject(
      { status: 'closed' },
    );
    await expect(
      migrateDeletedIntegrationConversations(db, false),
    ).resolves.toEqual({ matched: 1, modified: 1 });
    await expect(
      migrateDeletedIntegrationConversations(db, false),
    ).resolves.toEqual({ matched: 0, modified: 0 });
    expect(
      await db.collection('conversations_bak_deleted_integrations').findOne(),
    ).toMatchObject({ _id: 'history', status: 'closed' });
    expect(await models.Conversations.findById('active').lean()).toMatchObject({
      status: 'open',
    });
  });
});
