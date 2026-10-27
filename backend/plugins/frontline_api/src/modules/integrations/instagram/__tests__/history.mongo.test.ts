import { randomUUID } from 'node:crypto';
import mongoose, { Schema, type Connection, type PipelineStage } from 'mongoose';
import { generateModels, type IModels } from '~/connectionResolvers';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { messageSchema } from '@/inbox/db/definitions/conversationMessages';
import { conversationMessageSchema } from '../db/definitions/conversationMessages';
import { commentConversationSchema } from '../db/definitions/comment_conversations';
import { commentConversationReplySchema } from '../db/definitions/comment_conversations_reply';
import { integrationSchema } from '../db/definitions/integrations';
import { postConversationSchema } from '../db/definitions/postConversations';
import type { IInstagramConversationMessageDocument } from '../@types/conversationMessages';
import type { IInstagramCommentConversationDocument } from '../@types/comment_conversations';
import type { IInstagramCommentConversationReplyDocument } from '../@types/comment_conversations_reply';
import type { IInstagramIntegrationDocument } from '../@types/integrations';
import type { IInstagramPostConversationDocument } from '../@types/postConversations';
import { INTEGRATION_KINDS } from '../constants';
import { removeIntegration } from '../helpers';
import {
  countInstagramHistory,
  readInstagramHistory,
} from '../services/history';

jest.mock('erxes-api-shared/utils', () => ({
  getEnv: jest.fn(),
  schemaWrapper: (schema: unknown) => schema,
  mongooseStringRandomId: {
    type: String,
    default: () =>
      jest
        .requireActual<typeof import('node:crypto')>('node:crypto')
        .randomUUID(),
  },
}));
jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('../utils', () => ({}));
jest.mock('../debuggers', () => ({ debugError: jest.fn() }));
jest.mock('node-fetch', () => jest.fn());
jest.mock('erxes-api-shared/core-modules', () => ({
  attachmentSchema: new (jest.requireActual<typeof import('mongoose')>(
    'mongoose',
  ).Schema)({ url: String, name: String, type: String }, { _id: false }),
}));

const mongoSuite =
  process.env.INSTAGRAM_MONGO_TESTS === '1' ? describe : describe.skip;
mongoSuite('Instagram history against isolated local MongoDB', () => {
  let connection: Connection;
  let models: IModels;
  const date = (second: number) =>
    new Date(Date.UTC(2026, 9, 27, 0, 0, second));
  beforeAll(async () => {
    connection = await mongoose
      .createConnection(
        `mongodb://127.0.0.1:27017/erxes_ig_history_test_${randomUUID().replace(
          /-/g,
          '',
        )}`,
        { serverSelectionTimeoutMS: 3000 },
      )
      .asPromise();
    models = {} as IModels;
    models.InstagramIntegrations = connection.model<
      IInstagramIntegrationDocument,
      IModels['InstagramIntegrations']
    >('ig_integrations', integrationSchema);
    models.InstagramPostConversations = connection.model<
      IInstagramPostConversationDocument,
      IModels['InstagramPostConversations']
    >('ig_posts', postConversationSchema);
    models.InstagramConversations = connection.model(
      'ig_conversations',
      new Schema({ _id: String, erxesApiId: String }),
    ) as unknown as IModels['InstagramConversations'];
    models.InstagramConversationMessages = connection.model<
      IInstagramConversationMessageDocument,
      IModels['InstagramConversationMessages']
    >('ig_messages', conversationMessageSchema);
    models.InstagramCommentConversation = connection.model<
      IInstagramCommentConversationDocument,
      IModels['InstagramCommentConversation']
    >('ig_comments', commentConversationSchema);
    models.InstagramCommentConversationReply = connection.model<
      IInstagramCommentConversationReplyDocument,
      IModels['InstagramCommentConversationReply']
    >('ig_replies', commentConversationReplySchema);
    models.ConversationMessages = connection.model<
      IMessageDocument,
      IModels['ConversationMessages']
    >('inbox_messages', messageSchema);
  });
  beforeEach(() => {
    jest.mocked(generateModels).mockResolvedValue(models);
  });
  afterEach(async () => {
    for (const collection of Object.values(connection.collections))
      await collection.deleteMany({});
  });
  afterAll(async () => {
    await connection?.dropDatabase();
    await connection?.close();
  });

  test.each(['dm', 'post'])(
    'merges %s notes and messages into one paginated timeline without gaps',
    async (kind) => {
      if (kind === 'dm') {
        await models.InstagramConversations.create({
          _id: 'provider-conversation',
          erxesApiId: 'inbox',
        });
        await models.InstagramConversationMessages.insertMany(
          [1, 3, 5].map((n) => ({
            _id: `m${n}`,
            conversationId: 'provider-conversation',
            mid: `mid${n}`,
            content: `Message ${n}`,
            createdAt: date(n),
          })),
        );
      } else {
        await models.InstagramCommentConversation.create({
          _id: 'm1',
          erxesApiId: 'inbox',
          comment_id: 'mid1',
          content: 'Root',
          recipientId: 'page',
          createdAt: date(1),
        });
        await models.InstagramCommentConversationReply.insertMany(
          [3, 5].map((n) => ({
            _id: `m${n}`,
            parentId: 'mid1',
            comment_id: `mid${n}`,
            recipientId: 'page',
            content: `Reply ${n}`,
            createdAt: date(n),
          })),
        );
        await models.InstagramCommentConversationReply.create({
          parentId: 'other-root',
          recipientId: 'page',
          content: 'Other conversation',
          createdAt: date(6),
        });
      }
      await models.ConversationMessages.insertMany(
        [2, 4].map((n) => ({
          _id: `n${n}`,
          conversationId: 'inbox',
          internal: true,
          content: `Note ${n}`,
          createdAt: date(n),
        })),
      );
      // Canonical copies of external messages must not duplicate provider history.
      await models.ConversationMessages.create({
        conversationId: 'inbox',
        content: 'Canonical copy',
        createdAt: date(1),
      });
      await models.ConversationMessages.create({
        conversationId: 'other',
        internal: true,
        content: 'Other note',
        createdAt: date(6),
      });
      expect(await countInstagramHistory(models, 'inbox')).toBe(5);
      const latest = await readInstagramHistory(models, {
        conversationId: 'inbox',
        limit: 2,
      });
      const older = await readInstagramHistory(models, {
        conversationId: 'inbox',
        limit: 2,
        skip: 2,
      });
      const oldest = await readInstagramHistory(models, {
        conversationId: 'inbox',
        limit: 2,
        skip: 4,
      });
      expect(
        [...oldest, ...older, ...latest].map((message) => message._id),
      ).toEqual(['m1', 'n2', 'm3', 'n4', 'm5']);
      expect(latest.map((message) => message.conversationId)).toEqual([
        'inbox',
        'inbox',
      ]);
      const first = await readInstagramHistory(models, {
        conversationId: 'inbox',
        limit: 2,
        getFirst: true,
      });
      expect(first.map((message) => message._id)).toEqual(['m1', 'n2']);
      expect(first[0]).toMatchObject({
        mid: 'mid1',
        providerData: { messageId: 'mid1' },
      });
    },
  );

  test.each(['first', 'second'])(
    'removing the %s Post connection preserves shared history until the last Post is removed',
    async (removedId) => {
      const remainingId = removedId === 'first' ? 'second' : 'first';
      await models.InstagramIntegrations.insertMany([
        ...['first', 'second'].map((id) => ({
          _id: id,
          erxesApiId: id,
          accountId: `account-${id}`,
          instagramPageId: 'page',
          facebookPageId: 'fb-page',
          kind: INTEGRATION_KINDS.POST,
        })),
        {
          _id: 'messenger',
          erxesApiId: 'messenger',
          instagramPageId: 'page',
          facebookPageId: 'fb-page',
          kind: INTEGRATION_KINDS.MESSENGER,
        },
        {
          _id: 'other-post',
          erxesApiId: 'other-post',
          instagramPageId: 'other-page',
          facebookPageId: 'other-fb-page',
          kind: INTEGRATION_KINDS.POST,
        },
      ]);
      for (const pageId of ['page', 'other-page']) {
        await models.InstagramPostConversations.create({
          _id: `post-${pageId}`,
          postId: `post-${pageId}`,
          recipientId: pageId,
          integrationId: pageId === 'page' ? remainingId : 'other-post',
        });
        await models.InstagramCommentConversation.create({
          _id: `comment-${pageId}`,
          comment_id: `comment-${pageId}`,
          postId: `post-${pageId}`,
          recipientId: pageId,
          erxesApiId: `inbox-${pageId}`,
          content: 'Root comment',
          createdAt: date(1),
        });
        await models.ConversationMessages.create({
          _id: `note-${pageId}`,
          conversationId: `inbox-${pageId}`,
          internal: true,
          content: 'Internal note',
          createdAt: date(2),
        });
        await models.InstagramCommentConversationReply.create({
          _id: `reply-${pageId}`,
          parentId: `comment-${pageId}`,
          comment_id: `reply-${pageId}`,
          recipientId: pageId,
          content: 'Reply',
          createdAt: date(3),
        });
      }
      await models.InstagramConversations.create({
        _id: 'dm',
        erxesApiId: 'dm-inbox',
      });
      await models.InstagramConversationMessages.create({
        conversationId: 'dm',
        mid: 'dm-mid',
        content: 'Keep Messenger history',
        createdAt: date(1),
      });

      await expect(removeIntegration('test', removedId)).resolves.toBe(
        removedId,
      );

      expect(await models.InstagramIntegrations.findById(removedId)).toBeNull();
      expect(
        await models.InstagramIntegrations.findById(remainingId),
      ).not.toBeNull();
      expect(await models.InstagramPostConversations.countDocuments({})).toBe(2);
      expect(await countInstagramHistory(models, 'inbox-page')).toBe(3);
      expect(
        (await readInstagramHistory(models, { conversationId: 'inbox-page' })).map(
          ({ _id }) => _id,
        ),
      ).toEqual(['comment-page', 'note-page', 'reply-page']);

      await removeIntegration('test', remainingId);

      for (const collection of [
        models.InstagramPostConversations,
        models.InstagramCommentConversation,
        models.InstagramCommentConversationReply,
      ]) {
        expect(await collection.countDocuments({ recipientId: 'page' })).toBe(0);
        expect(
          await collection.countDocuments({ recipientId: 'other-page' }),
        ).toBe(1);
      }
      expect(await countInstagramHistory(models, 'inbox-other-page')).toBe(3);
      expect(await countInstagramHistory(models, 'dm-inbox')).toBe(1);
      expect(await models.InstagramIntegrations.countDocuments({})).toBe(2);
    },
  );

  test('legacy provider messages stay visible even without canonical copies', async () => {
    await models.InstagramConversations.create({
      _id: 'legacy',
      erxesApiId: 'inbox',
    });
    await models.InstagramConversationMessages.create({
      _id: 'old',
      conversationId: 'legacy',
      mid: 'mid-old',
      content: 'Historical',
      createdAt: date(1),
    });
    expect(
      await readInstagramHistory(models, { conversationId: 'inbox' }),
    ).toEqual([
      expect.objectContaining({
        _id: 'old',
        content: 'Historical',
        messageKind: 'text',
      }),
    ]);
  });

  test('outbound parts merge once and retain accepted parts whose provider copy failed', async () => {
    await models.InstagramConversations.create({
      _id: 'provider',
      erxesApiId: 'inbox',
    });
    const delivery = { status: 'sent', textSent: true, sentAttachmentUrls: [] };
    await models.InstagramConversationMessages.insertMany(
      [1, 2].map((n) => ({
        _id: `provider-${n}`,
        conversationId: 'provider',
        mid: `mid-${n}`,
        content: `Part ${n}`,
        createdAt: date(n),
      })),
    );
    await models.ConversationMessages.insertMany(
      [1, 2, 3].map((n) => ({
        _id: `canonical-${n}`,
        conversationId: 'inbox',
        content: `Part ${n}`,
        createdAt: date(n),
        providerData: { messageId: `mid-${n}` },
        extraData: { instagramDelivery: delivery },
      })),
    );
    // The same provider ID in another conversation cannot hide this fallback.
    await models.InstagramConversationMessages.create({
      conversationId: 'other',
      mid: 'mid-3',
      content: 'Other',
      createdAt: date(3),
    });
    expect(await countInstagramHistory(models, 'inbox')).toBe(3);
    const newest = await readInstagramHistory(models, {
      conversationId: 'inbox',
      limit: 2,
    });
    const older = await readInstagramHistory(models, {
      conversationId: 'inbox',
      limit: 2,
      skip: 2,
    });
    expect([...older, ...newest].map(({ _id }) => _id)).toEqual([
      'canonical-1',
      'canonical-2',
      'canonical-3',
    ]);
  });

  test('unknown conversations never return unrelated notes or empty-ID rows', async () => {
    await models.ConversationMessages.create({
      conversationId: 'unknown',
      internal: true,
      content: 'Not an Instagram conversation',
    });
    await models.InstagramConversationMessages.create({
      conversationId: '',
      content: 'Orphan',
    });
    expect(
      await readInstagramHistory(models, { conversationId: 'unknown' }),
    ).toEqual([]);
    expect(await countInstagramHistory(models, 'unknown')).toBe(0);
  });

  test('counting outbound history uses an indexed provider identity lookup', async () => {
    const size = 64;
    await models.InstagramConversationMessages.createIndexes();
    await models.InstagramConversations.create({
      _id: 'provider',
      erxesApiId: 'inbox',
    });
    await models.InstagramConversationMessages.insertMany(
      Array.from({ length: size }, (_, n) => ({
        conversationId: 'provider',
        mid: `mid-${n}`,
        content: `Part ${n}`,
      })),
    );
    await models.ConversationMessages.insertMany(
      Array.from({ length: size }, (_, n) => ({
        conversationId: 'inbox',
        content: `Part ${n}`,
        providerData: { messageId: `mid-${n}` },
        extraData: { instagramDelivery: { status: 'sent' } },
      })),
    );
    const aggregate = jest.spyOn(models.ConversationMessages, 'aggregate');
    let pipeline: PipelineStage[] | undefined;
    try {
      expect(await countInstagramHistory(models, 'inbox')).toBe(size);
      pipeline = aggregate.mock.calls[0][0];
    } finally {
      aggregate.mockRestore();
    }
    const explanation: {
      stages?: Array<{
        $lookup?: unknown;
        indexesUsed?: string[];
        totalDocsExamined?: number;
      }>;
    } = await models.ConversationMessages.aggregate(pipeline).explain(
      'executionStats',
    );
    const lookup = explanation.stages?.find((stage) => stage.$lookup);
    expect(lookup?.indexesUsed).toContain('conversationId_1_mid_1');
    expect(lookup?.totalDocsExamined).toBeLessThanOrEqual(size);
  });
});
