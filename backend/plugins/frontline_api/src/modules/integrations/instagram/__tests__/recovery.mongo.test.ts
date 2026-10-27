import { createHmac, randomUUID } from 'node:crypto';
import mongoose, { Schema, type Connection } from 'mongoose';
import { generateModels, type IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { messageSchema } from '@/inbox/db/definitions/conversationMessages';
import { instagramWebhook } from '../controller/controller';
import { INTEGRATION_KINDS } from '../constants';
import { getInstagramUser } from '../utils';
import { triggerInstagramAutomation } from '../meta/automation/utils/messageUtils';
import { customerSchema } from '../db/definitions/customers';
import { conversationSchema } from '../db/definitions/conversations';
import { conversationMessageSchema } from '../db/definitions/conversationMessages';
import { commentConversationSchema } from '../db/definitions/comment_conversations';
import { commentConversationReplySchema } from '../db/definitions/comment_conversations_reply';
import type { IInstagramCustomerDocument } from '../@types/customers';
import type { IInstagramConversationDocument } from '../@types/conversations';
import type { IInstagramConversationMessageDocument } from '../@types/conversationMessages';
import type { IInstagramCommentConversationDocument } from '../@types/comment_conversations';
import type { IInstagramCommentConversationReplyDocument } from '../@types/comment_conversations_reply';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  getSubdomain: () => 'test',
  isDev: false,
  schemaWrapper: (schema: unknown) => schema,
  mongooseStringRandomId: {
    type: String,
    default: () =>
      jest
        .requireActual<typeof import('node:crypto')>('node:crypto')
        .randomUUID(),
  },
  sendTRPCMessage: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  attachmentSchema: new (jest.requireActual<typeof import('mongoose')>(
    'mongoose',
  ).Schema)({ url: String, name: String, type: String }, { _id: false }),
}));
jest.mock('@/inbox/receiveMessage', () => ({ receiveInboxMessage: jest.fn() }));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));
jest.mock('../commonUtils', () => ({ getConfig: () => 'test-secret' }));
jest.mock('../debuggers', () => ({
  debugError: jest.fn(),
  debugInstagram: jest.fn(),
}));
jest.mock('../utils', () => ({ getInstagramUser: jest.fn() }));
jest.mock('../meta/automation/utils/messageUtils', () => ({
  checkIsBot: jest.fn().mockResolvedValue(null),
  triggerInstagramAutomation: jest.fn(),
}));
jest.mock('../services/messageEvents', () => ({
  publishInstagramMessage: jest.fn(),
  replaceSenderReaction: jest.fn(),
}));

type WebhookBody = Parameters<typeof instagramWebhook>[0]['body'];
type TestContact = { _id: string; firstName?: string };
type TestConversation = {
  _id: string;
  integrationId: string;
  content?: string;
};
type Failure =
  | 'core-before'
  | 'core-after'
  | 'conversation'
  | 'inbox-before'
  | 'inbox-after'
  | 'metadata'
  | 'publish';
const mongoSuite =
  process.env.INSTAGRAM_MONGO_TESTS === '1' ? describe : describe.skip;

mongoSuite('Instagram delivery recovery against isolated local MongoDB', () => {
  let connection: Connection;
  let models: IModels;
  let contacts: mongoose.Model<TestContact>;
  let conversations: mongoose.Model<TestConversation>;
  let failure: Failure | undefined;
  const databaseName = `erxes_instagram_test_${randomUUID().replace(/-/g, '')}`;
  const failAt = (stage: Failure) => {
    if (failure === stage) {
      failure = undefined;
      throw new Error(`Simulated ${stage} failure`);
    }
  };

  beforeAll(async () => {
    connection = await mongoose
      .createConnection(`mongodb://127.0.0.1:27017/${databaseName}`, {
        serverSelectionTimeoutMS: 3000,
      })
      .asPromise();
    // Narrow platform fixture, following Telegram's isolated Mongo suite.
    // Provider persistence uses the production schemas and indexes.
    models = {} as IModels;
    models.InstagramCustomers = connection.model<
      IInstagramCustomerDocument,
      IModels['InstagramCustomers']
    >('customers_instagram', customerSchema);
    models.InstagramConversations = connection.model<
      IInstagramConversationDocument,
      IModels['InstagramConversations']
    >('conversations_instagram', conversationSchema);
    models.InstagramConversationMessages = connection.model<
      IInstagramConversationMessageDocument,
      IModels['InstagramConversationMessages']
    >('messages_instagram', conversationMessageSchema);
    models.InstagramCommentConversation = connection.model<
      IInstagramCommentConversationDocument,
      IModels['InstagramCommentConversation']
    >('comments_instagram', commentConversationSchema);
    models.InstagramCommentConversationReply = connection.model<
      IInstagramCommentConversationReplyDocument,
      IModels['InstagramCommentConversationReply']
    >('replies_instagram', commentConversationReplySchema);
    models.ConversationMessages = connection.model<
      IMessageDocument,
      IModels['ConversationMessages']
    >('inbox_messages', messageSchema);
    contacts = connection.model(
      'core_contacts',
      new Schema<TestContact>({
        _id: { type: String, required: true },
        firstName: String,
      }),
    );
    conversations = connection.model(
      'inbox_conversations',
      new Schema<TestConversation>(
        {
          _id: { type: String, required: true },
          integrationId: String,
          content: String,
        },
        { strict: false },
      ),
    );
    models.Conversations = {
      updateConversation: async (id: string, doc: Record<string, unknown>) => {
        failAt('metadata');
        return conversations.findByIdAndUpdate(id, doc, { new: true }).exec();
      },
    } as unknown as IModels['Conversations'];
    models.InstagramIntegrations = {
      findOne: async (query: Record<string, unknown>) => {
        const selector = query.$and
          ? Object.assign({}, ...(query.$and as object[]))
          : query;
        const kind = selector.kind || INTEGRATION_KINDS.POST;
        return {
          _id: `provider-${kind}`,
          erxesApiId: kind,
          kind,
          instagramPageId: 'page',
          facebookPageId: 'fb-page',
          facebookPageTokensMap: { 'fb-page': 'test-token' },
        };
      },
    } as unknown as IModels['InstagramIntegrations'];
    models.InstagramPostConversations = {
      findOne: async () => ({ postId: 'media' }),
    } as unknown as IModels['InstagramPostConversations'];
    jest.mocked(generateModels).mockImplementation(async (tenant) => {
      if (tenant !== 'test')
        throw new Error('Only the isolated test tenant is allowed');
      return models;
    });
    await Promise.all(
      Object.values(connection.models).map((model) => model.init()),
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    failure = undefined;
    jest
      .mocked(getInstagramUser)
      .mockRejectedValue(new Error('User consent is required'));
    jest
      .mocked(pConversationClientMessageInserted)
      .mockImplementation(async () => {
        failAt('publish');
      });
    jest.mocked(sendTRPCMessage).mockImplementation((request) => {
      const input = request.input as { query: { _id: string } };
      return contacts.findById(input.query._id).lean().exec();
    });
    jest
      .mocked(receiveInboxMessage)
      .mockImplementation(async (_tenant, event) => {
        const data: {
          _id: string;
          firstName?: string;
          conversationId: string;
          integrationId: string;
          content: string;
        } = JSON.parse(event.payload);
        if (event.action === 'get-create-update-customer') {
          failAt('core-before');
          const customer = await contacts.create(data);
          failAt('core-after');
          return { status: 'success', data: { _id: customer._id } };
        }
        failAt('conversation');
        const conversation = await conversations.findByIdAndUpdate(
          data.conversationId,
          {
            integrationId: data.integrationId,
            content: data.content,
          },
          { upsert: true, new: true },
        );
        return { status: 'success', data: { _id: conversation._id } };
      });
    models.ConversationMessages.createMessage = async (doc) => {
      failAt('inbox-before');
      const message = await models.ConversationMessages.create(doc);
      failAt('inbox-after');
      return message;
    };
  });

  afterEach(async () => {
    if (connection)
      await Promise.all(
        Object.values(connection.models).map((model) => model.deleteMany({})),
      );
  });
  afterAll(async () => {
    if (!connection) return;
    if (
      connection.name !== databaseName ||
      !databaseName.startsWith('erxes_instagram_test_')
    ) {
      throw new Error('Refusing to clean an unexpected database');
    }
    await connection.dropDatabase();
    await connection.close();
  });

  const bodyFor = (
    kind: 'DM' | 'comment',
    id = 'event-1',
    parentId?: string,
  ): WebhookBody => ({
    object: 'instagram',
    entry: [
      {
        id: 'page',
        ...(kind === 'DM'
          ? {
              messaging: [
                {
                  sender: { id: 'sender' },
                  recipient: { id: 'page' },
                  timestamp: 1_000,
                  message: { mid: id, text: id },
                },
              ],
            }
          : {
              changes: [
                {
                  field: 'comments',
                  value: {
                    id,
                    from: { id: 'sender', username: 'comment_author' },
                    media: { id: 'media' },
                    text: id,
                    parent_id: parentId,
                  },
                },
              ],
            }),
      },
    ],
  });
  const deliver = async (body: WebhookBody) => {
    const rawBody = Buffer.from(JSON.stringify(body));
    const signature = `sha256=${createHmac('sha256', 'test-secret')
      .update(rawBody)
      .digest('hex')}`;
    let status = 200;
    const response = {
      status: (code: number) => {
        status = code;
        return response;
      },
      send: () => response,
    };
    await instagramWebhook(
      { body, rawBody, get: () => signature } as unknown as Parameters<
        typeof instagramWebhook
      >[0],
      response as unknown as Parameters<typeof instagramWebhook>[1],
    );
    return status;
  };

  test.each(['DM', 'comment'] as const)(
    'accepts a new %s sender without a profile and routes it correctly',
    async (kind) => {
      const scoped = await generateModels('test');
      expect(await deliver(bodyFor(kind))).toBe(200);
      expect(await scoped.ConversationMessages.countDocuments({})).toBe(1);
      expect(await contacts.countDocuments({})).toBe(1);
      expect((await conversations.findOne({}))?.integrationId).toBe(
        kind === 'DM' ? INTEGRATION_KINDS.MESSENGER : INTEGRATION_KINDS.POST,
      );
      if (kind === 'comment')
        expect((await contacts.findOne({}))?.firstName).toBe('comment_author');
    },
  );

  describe.each(['DM', 'comment'] as const)('%s retries', (kind) => {
    test.each<Failure>([
      'core-before',
      'core-after',
      'conversation',
      'inbox-before',
      'inbox-after',
      'metadata',
      'publish',
    ])('recovers a %s failure exactly once in the inbox', async (stage) => {
      failure = stage;
      const body = bodyFor(kind);
      expect(await deliver(body)).toBe(500);
      expect(await deliver(body)).toBe(200);
      expect(await deliver(body)).toBe(200);
      expect(await contacts.countDocuments({})).toBe(1);
      expect(await conversations.countDocuments({})).toBe(1);
      expect(await models.ConversationMessages.countDocuments({})).toBe(1);
      const provider =
        kind === 'DM'
          ? await models.InstagramConversationMessages.findOne({})
          : await models.InstagramCommentConversation.findOne({});
      expect(provider?.inboxSyncPending).toBe(false);
    });
  });

  test('resumes a failed comment reply in its original thread', async () => {
    expect(await deliver(bodyFor('comment', 'parent'))).toBe(200);
    failure = 'inbox-after';
    const reply = bodyFor('comment', 'reply', 'parent');
    expect(await deliver(reply)).toBe(500);
    expect(await deliver(reply)).toBe(200);
    expect(await conversations.countDocuments({})).toBe(1);
    expect(
      await models.InstagramCommentConversationReply.countDocuments({}),
    ).toBe(1);
    expect(await models.ConversationMessages.countDocuments({})).toBe(2);
  });

  test('concurrent redeliveries converge on one message and one automation dispatch', async () => {
    const body = bodyFor('DM');
    await Promise.all([deliver(body), deliver(body)]);
    expect(await deliver(body)).toBe(200);
    expect(await contacts.countDocuments({})).toBe(1);
    expect(await conversations.countDocuments({})).toBe(1);
    expect(await models.ConversationMessages.countDocuments({})).toBe(1);
    expect(triggerInstagramAutomation).toHaveBeenCalledTimes(1);
  });

  test('retrying a completed DM does not replace a newer conversation preview', async () => {
    const first = bodyFor('DM', 'first');
    expect(await deliver(first)).toBe(200);
    expect(await deliver(bodyFor('DM', 'second'))).toBe(200);
    expect(await deliver(first)).toBe(200);
    expect((await conversations.findOne({}))?.content).toBe('second');
    expect(await models.ConversationMessages.countDocuments({})).toBe(2);
  });

  test('a whole batch retry skips its completed event and resumes its failed event', async () => {
    const first = bodyFor('DM', 'first');
    expect(await deliver(first)).toBe(200);
    const batch: WebhookBody = {
      object: 'instagram',
      entry: [
        ...(first.entry || []),
        ...(bodyFor('comment', 'second').entry || []),
      ],
    };
    failure = 'inbox-before';
    expect(await deliver(batch)).toBe(500);
    expect(await deliver(batch)).toBe(200);
    expect(await models.ConversationMessages.countDocuments({})).toBe(2);
    expect(await conversations.countDocuments({})).toBe(2);
  });

  test('a crashed processing lease expires and allows recovery', async () => {
    failure = 'inbox-before';
    const body = bodyFor('comment');
    expect(await deliver(body)).toBe(500);
    await models.InstagramCommentConversation.updateOne(
      {},
      {
        $set: {
          processingToken: 'dead-worker',
          processingUntil: new Date(Date.now() + 60_000),
        },
      },
    );
    expect(await deliver(body)).toBe(500);
    await models.InstagramCommentConversation.updateOne(
      {},
      { $set: { processingUntil: new Date(0) } },
    );
    expect(await deliver(body)).toBe(200);
    expect(await models.ConversationMessages.countDocuments({})).toBe(1);
  });
});
