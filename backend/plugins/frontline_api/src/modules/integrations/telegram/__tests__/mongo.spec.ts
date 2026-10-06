import { randomUUID } from 'node:crypto';
import type { ITelegramConversationMessageDocument } from '../@types/conversationMessages';
import type { ITelegramConversationDocument } from '../@types/conversations';
import type { ITelegramCustomerDocument } from '../@types/customers';
import type { ITelegramReactionDocument } from '../@types/reactions';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import mongoose, { Schema, type Connection } from 'mongoose';
import { generateModels, type IModels } from '~/connectionResolvers';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { messageSchema } from '@/inbox/db/definitions/conversationMessages';
import { loadTelegramConversationMessageClass } from '../db/models/ConversationMessages';
import { loadTelegramConversationClass } from '../db/models/Conversations';
import { loadTelegramCustomerClass } from '../db/models/Customers';
import { loadTelegramReactionClass } from '../db/models/Reactions';
import { getOrCreateMessage, getOrCreateCustomer } from '../controller/store';
import { receiveTelegramReaction } from '../controller/reactions';
import { receiveTelegramPoll } from '../controller/polls';
import { telegramMessageSchema } from '../utils/message';
import { storeTelegramAttachment } from '../utils/attachments';

// This suite uses real Telegram and inbox Mongoose schemas and real indexes in
// its own throwaway database. Only platform transport, files and publication
// are replaced; generateModels('test') cannot point at the developer's data.
jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  mongooseStringRandomId: {
    type: String,
    default: () => require('node:crypto').randomUUID(),
  },
  graphqlPubsub: { publish: jest.fn() },
  sendTRPCMessage: jest.fn(),
}));
jest.mock('erxes-api-shared/core-modules', () => ({
  attachmentSchema: new (require('mongoose').Schema)(
    { url: String, name: String, type: String, size: Number },
    { _id: false },
  ),
}));
jest.mock('@/inbox/receiveMessage', () => ({ receiveInboxMessage: jest.fn() }));
jest.mock('@/inbox/graphql/resolvers/mutations/widget', () => ({
  pConversationClientMessageInserted: jest.fn(),
}));
jest.mock('../utils/attachments', () => ({
  storeTelegramAttachment: jest.fn(),
}));

const mongoSuite =
  process.env.TELEGRAM_MONGO_TESTS === '1' ? describe : describe.skip;
mongoSuite('Telegram persistence against isolated local MongoDB', () => {
  let connection: Connection;
  let models: IModels;
  let coreContacts: mongoose.Model<{ _id: string; firstName?: string }>;
  const databaseName = `erxes_telegram_test_${randomUUID().replace(/-/g, '')}`;
  beforeAll(async () => {
    connection = await mongoose
      .createConnection(`mongodb://127.0.0.1:27017/${databaseName}`, {
        serverSelectionTimeoutMS: 3000,
      })
      .asPromise();
    // The cast is the boundary for the narrow platform fixture. All Telegram
    // persistence methods below are the production model classes.
    models = {
      TelegramBots: {
        findOne: () => ({ select: async () => ({ token: '123:fake' }) }),
      },
      Conversations: { updateConversation: jest.fn() },
    } as unknown as IModels;
    models.TelegramConversationMessages = connection.model<
      ITelegramConversationMessageDocument,
      IModels['TelegramConversationMessages']
    >(
      'conversation_messages_telegram',
      loadTelegramConversationMessageClass(models),
    );
    models.TelegramConversations = connection.model<
      ITelegramConversationDocument,
      IModels['TelegramConversations']
    >('conversations_telegram', loadTelegramConversationClass(models));
    models.TelegramCustomers = connection.model<
      ITelegramCustomerDocument,
      IModels['TelegramCustomers']
    >('customers_telegram', loadTelegramCustomerClass(models));
    models.TelegramReactions = connection.model<
      ITelegramReactionDocument,
      IModels['TelegramReactions']
    >('telegram_reactions', loadTelegramReactionClass());
    models.ConversationMessages = connection.model<
      IMessageDocument,
      IModels['ConversationMessages']
    >('conversation_messages', messageSchema);
    coreContacts = connection.model(
      'test_core_contacts',
      new Schema<{ _id: string; firstName?: string }>({
        _id: { type: String, required: true },
        firstName: String,
      }),
    );
    jest.mocked(generateModels).mockImplementation(async (tenant) => {
      if (tenant !== 'test')
        throw new Error('Only the isolated test tenant is allowed');
      return models;
    });
    await Promise.all(
      Object.values(connection.models).map((model) => model.init()),
    );
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
      !databaseName.startsWith('erxes_telegram_test_')
    )
      throw new Error('Refusing to clean an unexpected database');
    await connection.dropDatabase();
    await connection.close();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(graphqlPubsub.publish).mockResolvedValue(undefined);
    jest.mocked(storeTelegramAttachment).mockResolvedValue({
      url: 'key',
      name: 'file.pdf',
      type: 'application/pdf',
      size: 3,
    });
    jest.mocked(sendTRPCMessage).mockImplementation(async (request) => {
      const input = request.input as { query: { _id: string } };
      return coreContacts.findById(input.query._id).lean();
    });
    jest
      .mocked(receiveInboxMessage)
      .mockImplementation(async (_tenant, event) => {
        const data = JSON.parse(event.payload);
        if (event.action === 'get-create-update-customer') {
          try {
            return { status: 'success', data: await coreContacts.create(data) };
          } catch {
            return { status: 'error', errorMessage: 'duplicate contact' };
          }
        }
        const doc = await models.ConversationMessages.findOneAndUpdate(
          { _id: data._id },
          { $setOnInsert: data },
          { upsert: true, new: true },
        );
        return { status: 'success', data: { _id: doc?._id } };
      });
  });
  const payload = (extra: Record<string, unknown> = {}) =>
    telegramMessageSchema.parse({
      message_id: 7,
      date: 1700000000,
      chat: { id: -123, type: 'supergroup', title: 'Team' },
      from: { id: 10, is_bot: false, first_name: 'Alice' },
      text: 'original',
      ...extra,
    });
  const chat = async () =>
    models.TelegramConversations.create({
      _id: 'local-chat',
      integrationId: 'integration',
      erxesApiId: 'inbox-chat',
      chatId: '-123',
      chatType: 'supergroup',
      messageThreadId: 0,
      timestamp: new Date(),
      content: '',
    });

  test('concurrent delivery inserts once; retries repair losers; edits replace in place and reject stale versions', async () => {
    const scoped = await generateModels('test');
    const conversation = await chat();
    await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        getOrCreateMessage(
          scoped,
          'test',
          conversation,
          payload(),
          undefined,
          10,
        ),
      ),
    );
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      payload(),
      undefined,
      10,
    );
    expect(await scoped.ConversationMessages.countDocuments()).toBe(1);
    expect(await scoped.TelegramConversationMessages.countDocuments()).toBe(1);
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      payload({ text: 'newer', edit_date: 1700000030 }),
      undefined,
      31,
    );
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      payload({ text: 'older', edit_date: 1700000020 }),
      undefined,
      20,
    );
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      payload({ text: 'same second, later update', edit_date: 1700000030 }),
      undefined,
      32,
    );
    const canonical = await scoped.ConversationMessages.findOne({
      conversationId: 'inbox-chat',
    }).lean();
    expect(canonical?.content).toBe('same second, later update');
    expect(canonical).toMatchObject({
      extraData: { telegram: { senderName: 'Alice' } },
    });
    expect(await scoped.ConversationMessages.countDocuments()).toBe(1);
    expect(graphqlPubsub.publish).toHaveBeenCalledWith(
      'conversationMessageInserted:inbox-chat',
      expect.objectContaining({ subdomain: 'test' }),
    );
  });
  test('caption edits reuse the file and media replacement downloads the new file', async () => {
    const scoped = await generateModels('test');
    const conversation = await chat();
    const first = payload({
      text: undefined,
      caption: 'one',
      document: { file_id: 'first', file_unique_id: '1' },
    });
    await getOrCreateMessage(scoped, 'test', conversation, first);
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      { ...first, caption: 'two', edit_date: 1700000040 },
      undefined,
      40,
    );
    expect(storeTelegramAttachment).toHaveBeenCalledTimes(1);
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      {
        ...first,
        document: { file_id: 'second', file_unique_id: '2' },
        edit_date: 1700000050,
      },
      undefined,
      50,
    );
    expect(storeTelegramAttachment).toHaveBeenCalledTimes(2);
    expect(await scoped.ConversationMessages.countDocuments()).toBe(1);
  });
  test('poll tallies and observed reactions survive duplicates, retractions and stale delivery', async () => {
    const scoped = await generateModels('test');
    const conversation = await chat();
    const poll = {
      id: 'p',
      question: 'Choose',
      options: [
        { text: 'A', voter_count: 0 },
        { text: 'B', voter_count: 0 },
      ],
      is_anonymous: true,
      is_closed: false,
      type: 'regular',
      allows_multiple_answers: true,
      total_voter_count: 0,
    };
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      payload({ text: undefined, poll }),
    );
    const update = {
      models: scoped,
      subdomain: 'test',
      integrationId: 'integration',
    };
    await receiveTelegramPoll({
      ...update,
      updateId: 12,
      payload: {
        ...poll,
        total_voter_count: 1,
        options: [
          { text: 'A', voter_count: 1 },
          { text: 'B', voter_count: 1 },
        ],
      },
    });
    await receiveTelegramPoll({ ...update, updateId: 11, payload: poll });
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      payload({ text: undefined, poll, edit_date: 1700000001 }),
      undefined,
      10,
    );
    const reaction = {
      chat: { id: -123, type: 'supergroup' },
      message_id: 7,
      date: 1700000020,
      user: { id: 10, is_bot: false, first_name: 'A' },
      new_reaction: [{ type: 'emoji', emoji: '👍' }],
    };
    await receiveTelegramReaction({
      ...update,
      updateId: 20,
      anonymous: false,
      payload: reaction,
    });
    await receiveTelegramReaction({
      ...update,
      updateId: 20,
      anonymous: false,
      payload: reaction,
    });
    let canonical = await scoped.ConversationMessages.findOne({
      conversationId: 'inbox-chat',
    }).lean();
    expect(canonical).toMatchObject({
      extraData: { poll: { results: { totalVoters: 1 } } },
    });
    expect(canonical).toMatchObject({
      extraData: {
        telegram: { reactions: [{ key: 'emoji:👍', label: '👍', count: 1 }] },
      },
    });
    await receiveTelegramReaction({
      ...update,
      updateId: 21,
      anonymous: false,
      payload: { ...reaction, date: 1700000021, new_reaction: [] },
    });
    await receiveTelegramReaction({
      ...update,
      updateId: 20,
      anonymous: false,
      payload: reaction,
    });
    canonical = await scoped.ConversationMessages.findOne({
      conversationId: 'inbox-chat',
    }).lean();
    expect(canonical).toMatchObject({
      extraData: { telegram: { reactions: [] } },
    });
    expect(await scoped.ConversationMessages.countDocuments()).toBe(1);
  });
  test('updates one outgoing album without dropping its other parts or reaction counts', async () => {
    const scoped = await generateModels('test');
    const conversation = await chat();
    await scoped.TelegramConversationMessages.create(
      [7, 8].map((id) => ({
        integrationId: 'integration',
        chatId: '-123',
        messageId: String(id),
        conversationId: conversation._id,
        content: id === 7 ? 'original' : '',
        createdAt: new Date(),
        userId: 'staff',
        attachments: [],
      })),
    );
    await scoped.ConversationMessages.create({
      _id: 'outgoing-album',
      conversationId: 'inbox-chat',
      content: 'original',
      extraData: { telegram: { messageIds: ['7', '8'] } },
    });
    await getOrCreateMessage(
      scoped,
      'test',
      conversation,
      payload({ text: 'edited', edit_date: 1700000040 }),
      undefined,
      40,
    );
    const update = {
      models: scoped,
      subdomain: 'test',
      integrationId: 'integration',
    };
    const reaction = {
      chat: { id: -123, type: 'supergroup' },
      message_id: 7,
      date: 1700000050,
      user: { id: 10, is_bot: false, first_name: 'Alice' },
      new_reaction: [{ type: 'emoji', emoji: '👍' }],
    };
    await receiveTelegramReaction({
      ...update,
      updateId: 50,
      anonymous: false,
      payload: reaction,
    });
    await receiveTelegramReaction({
      ...update,
      updateId: 51,
      anonymous: true,
      payload: {
        ...reaction,
        message_id: 8,
        date: 1700000051,
        reactions: [{ type: { type: 'emoji', emoji: '👍' }, total_count: 2 }],
      },
    });
    const canonical = await scoped.ConversationMessages.findById(
      'outgoing-album',
    ).lean();
    expect(canonical).toMatchObject({
      content: 'edited',
      extraData: {
        telegram: {
          messageIds: ['7', '8'],
          reactions: [{ key: 'emoji:👍', label: '👍', count: 3 }],
        },
      },
    });
    expect(await scoped.ConversationMessages.countDocuments()).toBe(1);
  });
  test('concurrent contact creation converges on one Core ID even before its local link exists', async () => {
    const scoped = await generateModels('test');
    const sender = { id: 1234, is_bot: false, first_name: 'Alice' };
    const contacts = await Promise.all(
      Array.from({ length: 8 }, () =>
        getOrCreateCustomer(scoped, 'test', 'integration', sender),
      ),
    );
    expect(new Set(contacts.map((customer) => customer.erxesApiId)).size).toBe(
      1,
    );
    expect(await coreContacts.countDocuments()).toBe(1);
    expect(await scoped.TelegramCustomers.countDocuments()).toBe(1);
  });
});
