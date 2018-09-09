import { CONVERSATION_STATUSES } from '../../data/constants';
import { connect, disconnect } from '../../db/connection';
import { conversationFactory, integrationFactory } from '../../db/factories';
import { ActivityLogs, ConversationMessages, Conversations, Customers, Integrations } from '../../db/models';
import { receiveDirectMessageInformation } from '../../trackers/twitter';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('receive direct message response', () => {
  let _integration;

  const twitterUser = {
    id: 2442424242,
    id_str: '2442424242',
    name: 'username',
    profile_image_url: 'profile_image_url',
  };

  beforeEach(async () => {
    _integration = await integrationFactory({});
  });

  afterEach(async () => {
    await Integrations.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Customers.remove({});
    await ActivityLogs.remove({});
  });

  test('reopen', async () => {
    const senderId = 2424424242;
    const recipientId = 92442424424242;

    // create conversation
    await conversationFactory({
      integrationId: _integration._id,
      twitterData: {
        isDirectMessage: true,
        sender_id: senderId,
        sender_id_str: senderId.toString(),
        recipient_id: recipientId,
        recipient_id_str: recipientId.toString(),
      },
    });

    // direct message
    await receiveDirectMessageInformation(
      {
        id: 42242242,
        id_str: '42242242',
        sender_id: senderId,
        sender_id_str: senderId.toString(),
        recipient_id: recipientId,
        recipient_id_str: recipientId.toString(),
        sender: twitterUser,
      },
      _integration,
    );

    // must not created new conversation
    expect(await Conversations.find().count()).toBe(1);

    const conversation = await Conversations.findOne({});

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // status must updated as open
    expect(conversation.status).toBe(CONVERSATION_STATUSES.OPEN);
  });

  test('main action', async () => {
    const integration = await integrationFactory({});
    await Integrations.remove({ _id: integration._id });
    // try using non existing integration
    expect(await receiveDirectMessageInformation({}, integration)).toBe(null);

    // direct message
    const data = {
      id: 968686272498708500,
      id_str: '968686272498708484',
      text: 'rrrr https://t.co/o3O2wAeYaB',
      sender: {
        id: 169431359,
        id_str: '169431359',
        name: 'BatAmar Battulga',
        screen_name: 'b_batamar',
        profile_image_url: '79Dob1zF_normal.jpg',
      },
      sender_id: 169431359,
      sender_id_str: '169431359',
      sender_screen_name: 'b_batamar',
      recipient: {
        id: 800236126610935800,
        id_str: '800236126610935808',
        name: 'dombo123',
        screen_name: 'Dombo84986356',
        profile_image_url: 'default_profile_normal.png',
      },
      recipient_id: 800236126610935800,
      recipient_id_str: '800236126610935808',
      recipient_screen_name: 'Dombo84986356',
      created_at: 'Wed Feb 28 03:16:19 +0000 2018',
      entities: {
        hashtags: [],
        symbols: [],
        user_mentions: [],
        urls: [[Object]],
        media: [[Object]],
      },
    };

    // call action
    await receiveDirectMessageInformation(data, _integration);

    expect(await Conversations.find().count()).toBe(1); // 1 conversation
    expect(await Customers.find().count()).toBe(1); // 1 customer
    expect(await ConversationMessages.find().count()).toBe(1); // 1 message

    let conv = await Conversations.findOne();
    const customer = await Customers.findOne();
    const message = await ConversationMessages.findOne();

    if (!conv || !customer || !message) {
      throw new Error('Data not found');
    }

    if (!conv.twitterData || !message.twitterData) {
      throw new Error('Conversation twitter data is null');
    }

    if (!customer.twitterData) {
      throw new Error('Customer twitter data is null');
    }

    if (!customer.links) {
      throw new Error('Customer links is null');
    }

    // check conv field values
    expect(conv.createdAt).toBeDefined();
    expect(conv.integrationId).toBe(_integration._id);
    expect(conv.customerId).toBe(customer._id);
    expect(conv.status).toBe(CONVERSATION_STATUSES.NEW);
    expect(conv.content).toBe(data.text);
    expect(conv.twitterData.id).toBe(data.id);
    expect(conv.twitterData.id_str).toBe(data.id_str);
    expect(conv.twitterData.isDirectMessage).toBe(true);
    expect(conv.twitterData.entities).toBeDefined();
    expect(conv.twitterData.sender_id).toBe(data.sender_id);
    expect(conv.twitterData.sender_id_str).toBe(data.sender_id_str);
    expect(conv.twitterData.recipient_id).toBe(data.recipient_id);
    expect(conv.twitterData.recipient_id_str).toBe(data.recipient_id_str);

    // check customer field values
    expect(customer.createdAt).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.avatar).toBe(data.sender.profile_image_url);
    expect(customer.links.twitter).toBe(`https://twitter.com/${data.sender.screen_name}`);
    expect(customer.twitterData.id).toBe(data.sender_id);
    expect(customer.twitterData.id_str).toBe(data.sender_id_str);

    // 1 log
    expect(await ActivityLogs.find().count()).toBe(1);

    // check message field values
    expect(message.createdAt).toBeDefined();
    expect(message.conversationId).toBe(conv._id);
    expect(message.customerId).toBe(customer._id);
    expect(message.internal).toBe(false);
    expect(message.content).toBe(data.text);
    expect(message.twitterData.entities).toBeDefined();
    expect(message.twitterData.sender_id).toBe(data.sender_id);
    expect(message.twitterData.sender_id_str).toBe(data.sender_id_str);
    expect(message.twitterData.recipient_id).toBe(data.recipient_id);
    expect(message.twitterData.recipient_id_str).toBe(data.recipient_id_str);

    // tweet reply ===============
    data.text = 'reply';
    data.id = 3434343434;

    // call action
    await receiveDirectMessageInformation(data, _integration);

    // must not be created new conversation ==============
    expect(await Conversations.find().count()).toBe(1);

    // check conversation field updates
    conv = await Conversations.findOne();

    if (!conv) {
      throw new Error('conv not found');
    }

    expect((conv.readUserIds || []).length).toBe(0);
    expect(conv.createdAt).not.toEqual(conv.updatedAt);

    // must not be created new customer ================
    expect(await Customers.find().count()).toBe(1);

    // must be created new message ================
    expect(await ConversationMessages.find().count()).toBe(2);

    const newMessage = await ConversationMessages.findOne({
      _id: { $ne: message._id },
    });

    if (!newMessage) {
      throw new Error('newMessage is null');
    }

    // check message fields
    expect(newMessage.content).toBe(data.text);

    // close converstaion
    await Conversations.update({}, { $set: { status: CONVERSATION_STATUSES.CLOSED } });

    // direct message
    data.text = 'hi';

    let conversation = await receiveDirectMessageInformation(data, _integration);

    if (!conversation) {
      throw new Error('conversation is null');
    }

    // must be created new conversation ==============
    expect(await Conversations.find({}).count()).toBe(2);
    expect(await ConversationMessages.find({}).count()).toBe(3);
    expect(conv._id).not.toBe(conversation._id);

    data.text = 'test';

    conversation = await receiveDirectMessageInformation(data, _integration);

    if (!conversation) {
      throw new Error('conversation is null');
    }

    const { _id } = conversation;

    // must not be created new conversation ==============
    expect(await Conversations.find({}).count()).toBe(2);
    expect(await ConversationMessages.find({}).count()).toBe(4);
    expect(conv._id).not.toBe(_id);
    expect(conversation._id).toBe(_id);
  });
});
