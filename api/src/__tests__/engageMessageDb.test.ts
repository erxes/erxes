import * as faker from 'faker';
import * as sinon from 'sinon';
import { MESSAGE_KINDS } from '../data/constants';
import * as utils from '../data/utils';
import {
  brandFactory,
  conversationMessageFactory,
  customerFactory,
  engageDataFactory,
  engageMessageFactory,
  integrationFactory,
  segmentFactory,
  tagsFactory,
  userFactory
} from '../db/factories';
import {
  Brands,
  Conversations,
  Customers,
  EngageMessages,
  Integrations,
  Segments,
  Tags,
  Users
} from '../db/models';
import Messages from '../db/models/ConversationMessages';
import { IBrandDocument } from '../db/models/definitions/brands';
import { MESSENGER_KINDS, METHODS } from '../db/models/definitions/constants';
import { ICustomerDocument } from '../db/models/definitions/customers';
import { IIntegrationDocument } from '../db/models/definitions/integrations';
import { IUserDocument } from '../db/models/definitions/users';
import * as elk from '../elasticsearch';
import * as events from '../events';
import './setup.ts';

const getEnvMock = value => {
  return sinon.stub(utils, 'getEnv').callsFake(() => {
    return value;
  });
};

describe('engage messages model tests', () => {
  let _user;
  let _segment;
  let _brand;
  let _tag;
  let _message;

  beforeEach(async () => {
    _user = await userFactory({});
    _segment = await segmentFactory({});
    _brand = await brandFactory({});
    _tag = await tagsFactory({});
    _message = await engageMessageFactory({ kind: MESSAGE_KINDS.AUTO });
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Segments.deleteMany({});
    await EngageMessages.deleteMany({});
    await Brands.deleteMany({});
    await Tags.deleteMany({});
    await Customers.deleteMany({});
  });

  test('Get engage message', async () => {
    try {
      await EngageMessages.getEngageMessage('fakeId');
    } catch (e) {
      expect(e.message).toBe('Campaign not found');
    }

    const response = await EngageMessages.getEngageMessage(_message._id);

    expect(response).toBeDefined();
  });

  test('create messages', async () => {
    const doc = {
      kind: MESSAGE_KINDS.MANUAL,
      title: 'Message test',
      fromUserId: _user._id,
      segmentIds: [_segment._id],
      brandIds: [_brand._id],
      tagIds: [_tag._id],
      isLive: true,
      isDraft: false,
      createdBy: _user._id
    };

    const message = await EngageMessages.createEngageMessage({
      ...doc,
      method: METHODS.EMAIL
    });

    expect(message.kind).toEqual(doc.kind);
    expect(message.title).toEqual(doc.title);
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentIds).toEqual(expect.arrayContaining(doc.segmentIds));
    expect(message.brandIds).toEqual(expect.arrayContaining(doc.brandIds));
    expect(message.tagIds).toEqual(expect.arrayContaining(doc.tagIds));
    expect(message.isLive).toEqual(doc.isLive);
    expect(message.isDraft).toEqual(doc.isDraft);
    expect(message.createdBy).toBe(doc.createdBy);
  });

  test('update messages', async () => {
    const message = await EngageMessages.updateEngageMessage(_message._id, {
      title: 'Message test updated',
      fromUserId: _user._id,
      segmentIds: [_segment._id],
      brandIds: [_brand._id],
      tagIds: [_tag._id],
      method: _message.method,
      kind: _message.kind
    });

    expect(message.title).toEqual('Message test updated');
    expect(message.fromUserId).toEqual(_user._id);
    expect(message.segmentIds).toEqual(expect.arrayContaining([_segment._id]));
    expect(message.brandIds).toEqual(expect.arrayContaining([_brand._id]));
    expect(message.tagIds).toEqual(expect.arrayContaining([_tag._id]));
  });

  test('update messages: can not update manual live campaign', async () => {
    expect.assertions(1);

    const manualMessage = await engageMessageFactory({
      kind: MESSAGE_KINDS.MANUAL,
      isLive: true
    });

    try {
      await EngageMessages.updateEngageMessage(manualMessage._id, {
        title: 'Message test updated',
        method: manualMessage.method,
        kind: manualMessage.kind
      });
    } catch (e) {
      expect(e.message).toBe('Can not update manual live campaign');
    }
  });

  test('remove a message', async () => {
    await EngageMessages.removeEngageMessage(_message._id);

    const messagesCounts = await EngageMessages.find({}).countDocuments();

    expect(messagesCounts).toBe(0);
  });

  test('Engage message set live', async () => {
    await EngageMessages.engageMessageSetLive(_message._id);
    const message = await EngageMessages.findOne({ _id: _message._id });

    if (!message) {
      throw new Error('Campaign not found');
    }

    expect(message.isLive).toEqual(true);
    expect(message.isDraft).toEqual(false);
  });

  test('Engage message set pause', async () => {
    await EngageMessages.engageMessageSetPause(_message._id);
    const message = await EngageMessages.findOne({ _id: _message._id });

    if (!message) {
      throw new Error('Campaign not found');
    }

    expect(message.isLive).toEqual(false);
  });

  test('Campaign remove that throws not found exception', async () => {
    expect.assertions(1);

    try {
      await EngageMessages.removeEngageMessage(_segment._id);
    } catch (e) {
      expect(e.message).toEqual(`Campaign not found with id ${_segment._id}`);
    }
  });

  test('save matched customer ids', async () => {
    const message = await EngageMessages.setCustomersCount(
      _message._id,
      'totalCustomersCount',
      2
    );

    expect(message.totalCustomersCount).toBe(2);
  });

  test('changeCustomer', async () => {
    const customer = await customerFactory({});
    const newCustomer = await customerFactory({});

    await EngageMessages.changeCustomer(newCustomer._id, [customer._id]);

    expect(
      await EngageMessages.find({
        customerIds: { $in: [newCustomer._id] }
      })
    ).toHaveLength(0);

    expect(
      await EngageMessages.find({
        messengerReceivedCustomerIds: { $in: [newCustomer._id] }
      })
    ).toHaveLength(0);
  });

  test('removeCustomerEngages', async () => {
    const customer = await customerFactory({});

    await engageMessageFactory({
      customerIds: [customer._id]
    });

    await engageMessageFactory({
      customerIds: [customer._id]
    });

    await EngageMessages.removeCustomersEngages([customer._id]);

    const engageMessages = await EngageMessages.find({
      customerIds: { $in: [customer._id] }
    });

    const messengerReceivedCustomerIds = await EngageMessages.find({
      messengerReceivedCustomerIds: { $in: [customer._id] }
    });

    expect(engageMessages).toHaveLength(2);
    expect(messengerReceivedCustomerIds).toHaveLength(0);
  });
});

describe('createConversation', () => {
  let _customer: ICustomerDocument;
  let _integration: IIntegrationDocument;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory();
    _integration = await integrationFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.deleteMany({});
    await Integrations.deleteMany({});
    await Conversations.deleteMany({});
    await Messages.deleteMany({});
  });

  test('createOrUpdateConversationAndMessages', async () => {
    const elkSyncerEnvMock = getEnvMock('false');
    const user = await userFactory({ fullName: 'Full name' });

    const replacedContent = 'hi Full name';

    const kwargs = {
      customerId: _customer._id,
      integrationId: _integration._id,
      user,
      replacedContent,
      engageData: engageDataFactory({
        content: replacedContent,
        messageId: '_id'
      })
    };

    // create ==========================
    const message = await EngageMessages.createOrUpdateConversationAndMessages(
      kwargs
    );

    if (!message) {
      throw new Error('message is null');
    }

    const conversation = await Conversations.findOne({
      _id: message.conversationId
    });

    if (!conversation) {
      throw new Error('conversation not found');
    }

    expect(await Conversations.find().countDocuments()).toBe(1);
    expect(await Messages.find().countDocuments()).toBe(1);

    // check message fields
    expect(message._id).toBeDefined();
    expect(message.content).toBe(replacedContent);
    expect(message.engageData && message.engageData.content).toBe(
      replacedContent
    );
    expect(message.userId).toBe(user._id);
    expect(message.customerId).toBe(_customer._id);

    // check conversation fields
    expect(conversation._id).toBeDefined();
    expect(conversation.content).toBe(replacedContent);
    expect(conversation.integrationId).toBe(_integration._id);

    // second time ==========================
    // must not create new conversation & messages update
    await Messages.updateMany(
      { conversationId: conversation._id },
      { $set: { isCustomerRead: true } }
    );

    let response = await EngageMessages.createOrUpdateConversationAndMessages(
      kwargs
    );

    expect(response).toBe(null);

    expect(await Conversations.find().countDocuments()).toBe(1);
    expect(await Messages.find().countDocuments()).toBe(1);

    const updatedMessage = await Messages.findOne({
      conversationId: conversation._id
    });

    if (!updatedMessage) {
      throw new Error('message not found');
    }

    expect(updatedMessage.isCustomerRead).toBe(false);

    // do not mark as unread for conversations that
    // have more than one messages =====================
    await Messages.updateMany(
      { conversationId: conversation._id },
      { $set: { isCustomerRead: true } }
    );

    await conversationMessageFactory({
      conversationId: conversation._id,
      isCustomerRead: true
    });

    response = await EngageMessages.createOrUpdateConversationAndMessages(
      kwargs
    );

    expect(response).toBe(null);

    expect(await Conversations.find().countDocuments()).toBe(1);
    expect(await Messages.find().countDocuments()).toBe(2);

    const [message1, message2] = await Messages.find({
      conversationId: conversation._id
    });

    expect(message1.isCustomerRead).toBe(true);
    expect(message2.isCustomerRead).toBe(true);

    elkSyncerEnvMock.restore();

    // message is equal with previous one =====================
    const engageMessage = await engageMessageFactory({
      messenger: {
        brandId: 'brandId',
        kind: 'chat',
        sentAs: 'snippet',
        content: 'content'
      },
      customerIds: [_customer._id],
      fromUserId: user._id
    });

    await conversationMessageFactory({
      conversationId: conversation._id,
      engageData: engageDataFactory({
        messageId: engageMessage._id,
        brandId: 'brandId',
        kind: 'chat',
        sentAs: 'snippet',
        content: 'content',
        fromUserId: user._id
      }),
      userId: user._id,
      customerId: _customer._id
    });

    const envMock = getEnvMock('true');

    const elkMock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        hits: {
          hits: [
            {
              _id: 'conversationMessageId',
              _source: {
                mentionedUserIds: [],
                contentType: 'text',
                internal: false,
                engageData: {
                  rules: [],
                  messageId: engageMessage._id,
                  brandId: 'brandId',
                  content: 'content',
                  fromUserId: user._id,
                  kind: MESSENGER_KINDS.CHAT,
                  sentAs: 'snippet'
                },
                conversationId: 'conversationId',
                userId: user._id,
                visitorId: 'visitorId',
                content: 'content'
              }
            }
          ]
        }
      });
    });

    response = await EngageMessages.createOrUpdateConversationAndMessages({
      customerId: _customer._id,
      integrationId: _integration._id,
      user,
      replacedContent,
      engageData: {
        rules: [],
        messageId: engageMessage._id,
        brandId: 'brandId',
        content: 'content',
        fromUserId: user._id,
        kind: 'chat',
        sentAs: 'snippet'
      }
    });

    expect(response).toBe(null);

    elkMock.restore();
    envMock.restore();
  });
});

describe('createVisitorOrCustomerMessages', () => {
  let _user: IUserDocument;
  let _brand: IBrandDocument;
  let _customer: ICustomerDocument;
  let _integration: IIntegrationDocument;
  let _visitor: ICustomerDocument;
  let mock;
  let envMock;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory({
      firstName: 'firstName',
      lastName: 'lastName',
      state: 'customer'
    });

    _visitor = await customerFactory({
      state: 'visitor'
    });

    envMock = getEnvMock('false');

    mock = sinon.stub(events, 'getNumberOfVisits').callsFake(() => {
      return Promise.resolve(11);
    });

    _brand = await brandFactory({});
    _integration = await integrationFactory({ brandId: _brand._id });
    _user = await userFactory({});

    const message = new EngageMessages({
      title: 'Visitor',
      fromUserId: _user._id,
      kind: 'visitorAuto',
      method: 'messenger',
      isLive: true,
      messenger: {
        brandId: _brand._id,
        rules: [
          {
            kind: 'currentPageUrl',
            condition: 'is',
            value: '/page'
          },
          {
            kind: 'numberOfVisits',
            condition: 'greaterThan',
            value: 10
          }
        ],
        content: 'hi,{{ customer.name }}'
      }
    });

    // invalid from user id
    await engageMessageFactory({
      kind: 'auto',
      userId: 'invalid',
      isLive: true,
      messenger: {
        brandId: _brand._id,
        content: 'hi,{{ customer.firstName }} {{ customer.lastName }}'
      }
    });

    await engageMessageFactory({
      kind: 'visitorAuto',
      userId: _user._id,
      isLive: true,
      customerIds: [_visitor.id],
      messenger: {
        brandId: _brand._id,
        content: 'hi,{{ customer.firstName }} {{ customer.lastName }}'
      }
    });

    await engageMessageFactory({
      kind: 'manual',
      userId: _user._id,
      isLive: true,
      customerIds: [_customer.id],
      messenger: {
        brandId: _brand._id,
        content: 'hi,{{ customer.firstName }} {{ customer.lastName }}'
      }
    });

    return message.save();
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.deleteMany({});
    await Integrations.deleteMany({});
    await Conversations.deleteMany({});
    await EngageMessages.deleteMany({});
    await Messages.deleteMany({});
    await Brands.deleteMany({});

    mock.restore();
    envMock.restore();
  });

  test('must create conversation & message object', async () => {
    // previous unread conversation messages created by engage
    await conversationMessageFactory({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: engageDataFactory({
        messageId: '_id2'
      })
    });

    await conversationMessageFactory({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: engageDataFactory({
        messageId: '_id2'
      })
    });

    const fromUser = await userFactory({});

    const eng = await engageMessageFactory({
      messenger: {
        brandId: _brand._id,
        kind: 'chat',
        sentAs: 'snippet',
        content: 'content',
        rules: [
          {
            kind: 'currentPageUrl',
            text: 'Current page url',
            condition: 'contains',
            value: 'index'
          }
        ]
      },
      customerIds: [_customer._id],
      isLive: true,
      method: 'messenger',
      kind: 'auto',
      userId: fromUser._id
    });

    await conversationMessageFactory({
      customerId: _customer._id,
      isCustomerRead: false,
      engageData: engageDataFactory({
        messageId: eng._id,
        fromUserId: eng.fromUserId
      })
    });
    // main call
    const msgs = await EngageMessages.createVisitorOrCustomerMessages({
      brandId: _brand._id,
      customer: _customer,
      integrationId: _integration._id,
      browserInfo: {
        url: '/index'
      }
    });

    const conversation = await Conversations.findOne({
      _id: { $in: msgs.map(m => m.conversationId) }
    });

    if (!conversation) {
      throw new Error('conversation not found');
    }

    const content = `hi,${_customer.firstName || ''} ${_customer.lastName ||
      ''}`;

    expect(conversation._id).toBeDefined();
    expect(conversation.content).toBe(content);
    expect(conversation.customerId).toBe(_customer._id);
    expect(conversation.integrationId).toBe(_integration._id);

    const message = await Messages.findOne({
      conversationId: conversation._id
    });

    if (!message) {
      throw new Error('message not found');
    }

    expect(message._id).toBeDefined();
    expect(message.content).toBe(content);
  });

  test('manual message test', async () => {
    const customer1 = await customerFactory({
      state: 'customer',
      firstName: 'firstName',
      lastName: 'lastName'
    });
    const customer2 = await customerFactory({ state: 'customer' });

    const engageMessage = await engageMessageFactory({
      kind: 'manual',
      userId: _user._id,
      isLive: true,
      customerIds: [customer1.id],
      messenger: {
        brandId: _brand._id,
        content: 'hi,{{ customer.firstName }} {{ customer.lastName }}'
      }
    });

    await EngageMessages.createVisitorOrCustomerMessages({
      brandId: _brand._id,
      customer: customer2,
      integrationId: _integration._id,
      browserInfo: {
        url: '/index'
      }
    });

    await EngageMessages.createVisitorOrCustomerMessages({
      brandId: _brand._id,
      customer: customer1,
      integrationId: _integration._id,
      browserInfo: {
        url: '/index'
      }
    });

    const conversation1 = await Conversations.findOne({
      customerId: customer1._id
    });

    const conversation2 = await Conversations.findOne({
      customerId: customer2._id
    });

    if (!conversation1) {
      throw new Error('conversation not found');
    }

    const content = `hi,${_customer.firstName || ''} ${_customer.lastName ||
      ''}`;

    expect(conversation1?._id).toBeDefined();
    expect(conversation2).toBeNull();
    expect(conversation1?.content).toBe(content);
    expect(conversation1?.customerId).toBe(customer1._id);
    // expect(conversation.integrationId).toBe(_integration._id);

    const message = await Messages.findOne({
      conversationId: conversation1?._id
    });

    if (!message) {
      throw new Error('message not found');
    }

    expect(message._id).toBeDefined();
    expect(message.content).toBe(content);
    expect(message.engageData).toBeDefined();
    expect(message.engageData?.messageId).toBe(engageMessage._id);
  });

  test('manual or auto message: customer does not exist test', async () => {
    const customer = await customerFactory({ state: 'customer' });

    await engageMessageFactory({
      kind: MESSAGE_KINDS.MANUAL,
      userId: _user._id,
      isLive: true,
      customerTagIds: [(await tagsFactory({}))._id],
      messenger: {
        brandId: _brand._id,
        content: 'hi,{{ customer.firstName }} {{ customer.lastName }}'
      }
    });

    await EngageMessages.createVisitorOrCustomerMessages({
      brandId: _brand._id,
      customer,
      integrationId: _integration._id,
      browserInfo: {
        url: '/index'
      }
    });

    const conversation = await Conversations.findOne({
      customerId: customer._id
    });

    expect(conversation).toBeNull();
  });

  const browserLanguageRule = {
    kind: 'browserLanguage',
    condition: 'is',
    value: 'en'
  };

  describe('checkRules', () => {
    test('browserLanguage: not matched', async () => {
      const response = await EngageMessages.checkRules({
        rules: [browserLanguageRule],
        browserInfo: { language: 'mn' }
      });

      expect(response).toBe(false);
    });

    test('browserLanguage: not all rules matched', async () => {
      const response = await EngageMessages.checkRules({
        rules: [
          browserLanguageRule,
          {
            kind: 'browserLanguage',
            condition: 'is',
            value: 'mn'
          }
        ],

        browserInfo: { language: 'en' }
      });

      expect(response).toBe(false);
    });

    test('browserLanguage: all rules matched', async () => {
      const response = await EngageMessages.checkRules({
        rules: [browserLanguageRule, browserLanguageRule],
        browserInfo: { language: 'en' }
      });

      expect(response).toBe(true);
    });
  });

  describe('checkIndividualRule', () => {
    // is
    test('is: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: browserLanguageRule,
        browserInfo: { language: 'mn' }
      });

      expect(response).toBe(false);
    });

    test('is: matching', () => {
      const response = EngageMessages.checkRule({
        rule: browserLanguageRule,
        browserInfo: { language: 'en' }
      });

      expect(response).toBe(true);
    });

    // isNot
    const isNotRule = {
      kind: 'currentPageUrl',
      condition: 'isNot',
      value: '/page'
    };

    test('isNot: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: isNotRule,
        browserInfo: { url: '/page' }
      });

      expect(response).toBe(false);
    });

    test('isNot: matching', () => {
      const response = EngageMessages.checkRule({
        rule: isNotRule,
        browserInfo: { url: '/category' }
      });

      expect(response).toBe(true);
    });

    // isUnknown
    const isUnknownRule = {
      kind: 'city',
      condition: 'isUnknown'
    };

    test('isUnknown: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: isUnknownRule,
        browserInfo: { city: 'Ulaanbaatar' }
      });

      expect(response).toBe(false);
    });

    test('isUnknown: matching', () => {
      const response = EngageMessages.checkRule({
        rule: isUnknownRule,
        browserInfo: {}
      });

      expect(response).toBe(true);
    });

    // hasAnyValue
    const hasAnyValueRule = {
      kind: 'country',
      condition: 'hasAnyValue'
    };

    test('hasAnyValue: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: hasAnyValueRule,
        browserInfo: {}
      });

      expect(response).toBe(false);
    });

    test('hasAnyValue: matching', () => {
      const response = EngageMessages.checkRule({
        rule: hasAnyValueRule,
        browserInfo: { countryCode: 'MN' }
      });

      expect(response).toBe(true);
    });

    // startsWith
    const startsWithRule = {
      kind: 'browserLanguage',
      condition: 'startsWith',
      value: 'en'
    };

    test('startsWith: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: startsWithRule,
        browserInfo: { language: 'mongolian' }
      });

      expect(response).toBe(false);
    });

    test('startsWith: matching', () => {
      const response = EngageMessages.checkRule({
        rule: startsWithRule,
        browserInfo: { language: 'english' }
      });

      expect(response).toBe(true);
    });

    // endsWith
    const endsWithRule = {
      kind: 'browserLanguage',
      condition: 'endsWith',
      value: 'ian'
    };

    test('endsWith: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: endsWithRule,
        browserInfo: { language: 'english' }
      });

      expect(response).toBe(false);
    });

    test('endsWith: matching', () => {
      const response = EngageMessages.checkRule({
        rule: endsWithRule,
        browserInfo: { language: 'mongolian' }
      });

      expect(response).toBe(true);
    });

    // greaterThan
    const greaterThanRule = {
      kind: 'numberOfVisits',
      condition: 'greaterThan',
      value: '1'
    };

    test('greaterThan: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: greaterThanRule,
        browserInfo: {},
        numberOfVisits: 0
      });

      expect(response).toBe(false);
    });

    test('greaterThan: matching', () => {
      const response = EngageMessages.checkRule({
        rule: greaterThanRule,
        browserInfo: {},
        numberOfVisits: 2
      });

      expect(response).toBe(true);
    });

    // lessThan
    const lessThanRule = {
      kind: 'numberOfVisits',
      condition: 'lessThan',
      value: '1'
    };

    test('lessThan: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: lessThanRule,
        browserInfo: {},
        numberOfVisits: 2
      });

      expect(response).toBe(false);
    });

    test('lessThan: matching', () => {
      const response = EngageMessages.checkRule({
        rule: lessThanRule,
        browserInfo: {},
        numberOfVisits: 0
      });

      expect(response).toBe(true);
    });

    // contains ======
    const containsRule = {
      kind: 'currentPageUrl',
      condition: 'contains',
      value: 'page'
    };

    test('contains: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: containsRule,
        browserInfo: { url: '/test' }
      });

      expect(response).toBe(false);
    });

    test('contains: matching', () => {
      const response = EngageMessages.checkRule({
        rule: containsRule,
        browserInfo: { url: '/page' }
      });

      expect(response).toBe(true);
    });

    // does not contain ======
    const doesNotContainsRule = {
      kind: 'currentPageUrl',
      condition: 'doesNotContain',
      value: 'page'
    };

    test('does not contains: not matching', () => {
      const response = EngageMessages.checkRule({
        rule: doesNotContainsRule,
        browserInfo: { url: '/page' }
      });

      expect(response).toBe(false);
    });

    test('does not contains: matching', () => {
      const response = EngageMessages.checkRule({
        rule: doesNotContainsRule,
        browserInfo: { url: '/test' }
      });

      expect(response).toBe(true);
    });
  });
});

describe('createVisitorOrCustomerMessages with elk', () => {
  let _user: IUserDocument;
  let _brand: IBrandDocument;
  let _customer: ICustomerDocument;
  let _integration: IIntegrationDocument;
  let _visitor: ICustomerDocument;
  let envMock;
  let elkMock;
  let _segment;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory({
      firstName: 'firstName',
      lastName: 'lastName',
      state: 'customer'
    });

    _segment = await segmentFactory({});

    _visitor = await customerFactory({
      state: 'visitor'
    });

    envMock = getEnvMock('true');

    elkMock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        hits: {
          hits: [
            {
              _id: faker.random.uuid(),
              _source: {
                kind: MESSAGE_KINDS.VISITOR_AUTO,
                method: METHODS.MESSENGER,
                fromUserId: _user._id,
                isDraft: false,
                isLive: true,
                messenger: {
                  brandId: _brand._id,
                  sentAs: 'snippet',
                  content: '',
                  rules: []
                },
                createdBy: _user._id
              }
            },
            {
              _id: faker.random.uuid(),
              _source: {
                kind: MESSAGE_KINDS.AUTO,
                method: METHODS.MESSENGER,
                fromUserId: _user._id,
                isDraft: false,
                isLive: true,
                customerIds: [_customer._id],
                customerTagIds: ['tagid'],
                segmentIds: [_segment._id],
                brandIds: [_brand._id],
                messenger: {
                  brandId: _brand._id,
                  sentAs: 'snippet',
                  content: '',
                  rules: []
                },
                createdBy: _user._id
              }
            },
            {
              _id: faker.random.uuid(),
              _source: {
                kind: MESSAGE_KINDS.AUTO,
                method: METHODS.MESSENGER,
                fromUserId: _user._id,
                isDraft: false,
                isLive: true,
                brandIds: [_brand._id],
                messenger: {
                  brandId: _brand._id,
                  sentAs: 'snippet',
                  content: '',
                  rules: []
                },
                createdBy: _user._id
              }
            }
          ]
        }
      });
    });

    _brand = await brandFactory({});
    _integration = await integrationFactory({ brandId: _brand._id });
    _user = await userFactory({});

    const message = new EngageMessages({
      title: 'Visitor',
      fromUserId: _user._id,
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      method: METHODS.MESSENGER,
      isLive: true,
      messenger: {
        brandId: _brand._id,
        rules: [
          {
            kind: 'currentPageUrl',
            condition: 'is',
            value: '/page'
          },
          {
            kind: 'numberOfVisits',
            condition: 'greaterThan',
            value: 10
          }
        ],
        content: 'hi,{{ customer.name }}'
      }
    });

    // invalid from user id
    await engageMessageFactory({
      kind: MESSAGE_KINDS.AUTO,
      userId: 'invalid',
      isLive: true,
      messenger: {
        brandId: _brand._id,
        content: 'hi,{{ customer.firstName }} {{ customer.lastName }}'
      }
    });

    await engageMessageFactory({
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      userId: _user._id,
      isLive: true,
      customerIds: [_visitor.id],
      messenger: {
        brandId: _brand._id,
        content: 'hi,{{ customer.firstName }} {{ customer.lastName }}'
      }
    });

    await engageMessageFactory({
      kind: MESSAGE_KINDS.MANUAL,
      userId: _user._id,
      isLive: true,
      customerIds: [_customer.id],
      messenger: {
        brandId: _brand._id,
        content: 'hi,{{ customer.firstName }} {{ customer.lastName }}'
      }
    });

    return message.save();
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.deleteMany({});
    await Integrations.deleteMany({});
    await Conversations.deleteMany({});
    await EngageMessages.deleteMany({});
    await Messages.deleteMany({});
    await Brands.deleteMany({});
    await Segments.deleteMany({});

    elkMock.restore();
    envMock.restore();
  });

  test('visitorAuto with visitor', async () => {
    const visitor = {
      _id: '123456',
      integrationId: _integration._id,
      visitorId: faker.random.uuid()
    };

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve([
        {
          _id: _integration._id,
          name: _integration.name
        }
      ]);
    });

    await EngageMessages.createVisitorOrCustomerMessages({
      brandId: _brand._id,
      visitor,
      integrationId: _integration._id,
      browserInfo: {
        url: '/index'
      }
    });

    const conv = await Conversations.findOne({
      visitorId: visitor.visitorId,
      integrationId: _integration._id
    });

    expect(conv).toBeNull();
    mock.restore();
  });

  test('engageMessage with elkSyncer', async () => {
    const customer = await customerFactory({
      state: 'visitor',
      firstName: 'john',
      lastName: 'doe'
    });

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve([
        {
          _id: _integration._id,
          name: _integration.name
        }
      ]);
    });

    await EngageMessages.createVisitorOrCustomerMessages({
      brandId: _brand._id,
      customer,
      integrationId: _integration._id,
      browserInfo: {
        url: '/index'
      }
    });

    const conversation = await Conversations.findOne({
      customerId: customer._id
    });

    expect(conversation).toBeNull();
    mock.restore();
  });
});
