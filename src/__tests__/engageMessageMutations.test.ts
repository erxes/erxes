import * as faker from 'faker';
import * as moment from 'moment';
import { INTEGRATION_KIND_CHOICES, MESSAGE_KINDS } from '../data/constants';
import * as engageUtils from '../data/resolvers/mutations/engageUtils';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  engageMessageFactory,
  integrationFactory,
  segmentFactory,
  tagsFactory,
  userFactory,
} from '../db/factories';
import {
  Brands,
  ConversationMessages,
  Conversations,
  Customers,
  EmailTemplates,
  EngageMessages,
  Integrations,
  Segments,
  Tags,
  Users,
} from '../db/models';

import utils, { handleUnsubscription } from '../data/utils';
import { STATUSES } from '../db/models/definitions/constants';
import './setup.ts';

describe('engage message mutation tests', () => {
  let _message;
  let _user;
  let _tag;
  let _brand;
  let _segment;
  let _customer;
  let _integration;
  let _doc;
  let spy;

  const commonParamDefs = `
    $title: String!,
    $kind: String!,
    $method: String!,
    $fromUserId: String!,
    $isDraft: Boolean,
    $isLive: Boolean,
    $stopDate: Date,
    $segmentIds: [String],
    $brandIds: [String],
    $tagIds: [String],
    $customerIds: [String],
    $email: EngageMessageEmail,
    $scheduleDate: EngageScheduleDateInput,
    $messenger: EngageMessageMessenger,
  `;

  const commonParams = `
    title: $title
    kind: $kind
    method: $method
    fromUserId: $fromUserId
    isDraft: $isDraft
    isLive: $isLive
    stopDate: $stopDate
    segmentIds: $segmentIds
    brandIds: $brandIds
    tagIds: $tagIds
    customerIds: $customerIds
    email: $email
    scheduleDate: $scheduleDate
    messenger: $messenger
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _tag = await tagsFactory({});
    _brand = await brandFactory({});
    _segment = await segmentFactory({
      connector: 'any',
      conditions: [{ field: 'primaryEmail', operator: 'c', value: '@', type: 'string' }],
    });
    _message = await engageMessageFactory({
      kind: 'auto',
      userId: _user._id,
      messenger: {
        content: 'content',
        brandId: _brand.id,
      },
    });
    _customer = await customerFactory({
      hasValidEmail: true,
      status: STATUSES.ACTIVE,
      profileScore: 1,
      primaryEmail: faker.internet.email(),
      firstName: faker.random.word(),
      lastName: faker.random.word(),
    });
    _integration = await integrationFactory({ brandId: 'brandId' });

    _doc = {
      title: 'Message test',
      kind: 'chat',
      method: 'email',
      fromUserId: _user._id,
      isDraft: true,
      isLive: true,
      stopDate: new Date(),
      segmentIds: [_segment._id],
      brandIds: [_brand._id],
      tagIds: [_tag._id],
      customerIds: [_customer._id],
      email: {
        subject: faker.random.word(),
        content: faker.random.word(),
      },
      scheduleDate: {
        type: 'year',
        month: '2',
        day: '14',
        time: moment('2018-08-24T12:45:00'),
      },
      messenger: {
        brandId: _brand._id,
        kind: 'chat',
        sentAs: 'badge',
        content: faker.random.word(),
        rules: [
          {
            _id: _message._id,
            kind: 'manual',
            text: faker.random.word(),
            condition: faker.random.word(),
            value: faker.random.word(),
          },
        ],
      },
    };
    spy = jest.spyOn(engageUtils, 'send');
  });

  afterEach(async () => {
    spy.mockRestore();
    // Clearing test data
    _doc = null;
    await Users.deleteMany({});
    await Tags.deleteMany({});
    await Brands.deleteMany({});
    await Segments.deleteMany({});
    await EngageMessages.deleteMany({});
    await EmailTemplates.deleteMany({});
    await Customers.deleteMany({});
    await Integrations.deleteMany({});
    await Conversations.deleteMany({});
    await ConversationMessages.deleteMany({});
  });

  test('Engage utils send via messenger', async () => {
    const brand = await brandFactory();
    const emessage = await engageMessageFactory({
      method: 'messenger',
      title: 'Send via messenger',
      userId: _user._id,
      segmentIds: [_segment._id],
      customerIds: [_customer._id],
      isLive: true,
      messenger: {
        brandId: brand._id,
        content: 'content',
      },
    });

    try {
      await engageUtils.send(emessage);
    } catch (e) {
      expect(e.message).toEqual('Integration not found');
    }

    const emessageWithoutUser = await engageMessageFactory({
      method: 'messenger',
      title: 'Send via messenger',
      userId: 'fromUserId',
      segmentIds: [_segment._id],
      isLive: true,
      messenger: {
        brandId: brand._id,
        content: 'content',
      },
    });

    try {
      await engageUtils.send(emessageWithoutUser);
    } catch (e) {
      expect(e.message).toEqual('User not found');
    }

    const integration = await integrationFactory({
      brandId: brand._id,
      kind: INTEGRATION_KIND_CHOICES.MESSENGER,
    });

    const emessageWithBrand = await engageMessageFactory({
      method: 'messenger',
      title: 'Send via messenger',
      userId: _user._id,
      segmentIds: [_segment._id],
      isLive: true,
      customerIds: [_customer._id],
      messenger: {
        brandId: brand._id,
        content: 'content',
      },
    });

    await engageUtils.send(emessageWithBrand);

    // setCustomerIds
    const setCustomer = await EngageMessages.findOne({ _id: _message._id, customerIds: _customer._id });
    expect(setCustomer).toBeDefined();

    // create conversation
    const newConversation = await Conversations.findOne({
      userId: _user._id,
      customerId: _customer._id,
      integrationId: integration._id,
      content: 'content',
    });

    if (!newConversation) {
      throw new Error('Conversation not found');
    }

    expect(newConversation).toBeDefined();

    // create message
    const newMessage = await ConversationMessages.findOne({
      conversationId: newConversation._id,
      customerId: _customer._id,
      userId: _user._id,
      content: 'content',
    });

    if (!newMessage || !newMessage.engageData) {
      throw new Error('Message not found');
    }

    expect(newMessage).toBeDefined();
    expect(newMessage.engageData.messageId).toBe(emessageWithBrand._id);
    expect(newMessage.engageData.fromUserId).toBe(_user._id);
    expect(newMessage.engageData.brandId).toBe(brand._id);

    const emessageNoMessenger = await engageMessageFactory({
      isLive: true,
      userId: _user._id,
      method: 'messenger',
    });

    await engageUtils.send(emessageNoMessenger);
  });

  test('Engage utils send via messenger without initial values', async () => {
    _customer.firstName = undefined;
    _customer.lastName = undefined;
    _customer.primaryEmail = undefined;

    _customer.save();

    const user = await userFactory();

    user.email = undefined;
    user.details = undefined;
    user.save();

    const brand = await brandFactory();

    await integrationFactory({
      brandId: brand._id,
      kind: INTEGRATION_KIND_CHOICES.MESSENGER,
    });

    const emessage = await engageMessageFactory({
      method: 'messenger',
      customerIds: [_customer._id],
      userId: user._id,
      isLive: true,
      messenger: {
        brandId: brand._id,
        content: 'content',
      },
    });

    await engageUtils.send(emessage);
  });

  test('Engage utils send via email', async () => {
    process.env.AWS_SES_ACCESS_KEY_ID = '123';
    process.env.AWS_SES_SECRET_ACCESS_KEY = '123';
    process.env.AWS_SES_CONFIG_SET = 'aws-ses';
    process.env.AWS_ENDPOINT = '123';
    process.env.MAIL_PORT = '123';
    process.env.AWS_REGION = 'us-west-2';

    const emessage = await engageMessageFactory({
      method: 'email',
      title: 'Send via email',
      userId: 'fromUserId',
      segmentIds: [_segment._id],
      email: {
        subject: 'subject',
        content: 'content',
        attachments: [],
      },
    });

    try {
      await engageUtils.send(emessage);
    } catch (e) {
      expect(e.message).toBe('User not found');
    }

    const emessageWithUser = await engageMessageFactory({
      method: 'email',
      title: 'Send via email',
      userId: _user._id,
      segmentIds: [_segment._id],
      isLive: true,
      email: {
        subject: 'subject',
        content: 'content',
        attachments: [],
      },
    });

    await engageUtils.send(emessageWithUser);

    _customer.firstName = undefined;
    _customer.lastName = undefined;

    _customer.save();

    const emessageNoInitial = await engageMessageFactory({
      method: 'email',
      title: 'Send via email',
      userId: _user._id,
      isLive: true,
      customerIds: [_customer._id],
      segmentIds: [_segment._id],
      email: {
        subject: 'subject',
        content: 'content',
        attachments: [],
      },
    });

    await engageUtils.send(emessageNoInitial);

    const emessageNotLive = await engageMessageFactory({
      isLive: false,
      userId: _user._id,
    });

    await engageUtils.send(emessageNotLive);
  });

  const engageMessageAddMutation = `
    mutation engageMessageAdd(${commonParamDefs}) {
      engageMessageAdd(${commonParams}) {
        kind
        segmentIds
        brandIds
        tagIds
        customerIds
        title
        fromUserId
        method
        isDraft
        stopDate
        isLive
        stopDate
        messengerReceivedCustomerIds
        email
        messenger
        scheduleDate {
          type
          day
          month
          time
        }
        segments {
          _id
        }
        fromUser {
          _id
        }
        getTags {
          _id
        }
      }
    }
  `;

  test('Add engage message', async () => {
    process.env.AWS_SES_ACCESS_KEY_ID = '123';
    process.env.AWS_SES_SECRET_ACCESS_KEY = '123';
    process.env.AWS_SES_CONFIG_SET = 'aws-ses';
    process.env.AWS_ENDPOINT = '123';

    const user = await Users.findOne({ _id: _doc.fromUserId });

    if (!user) {
      throw new Error('User not found');
    }

    const engageMessage = await graphqlRequest(engageMessageAddMutation, 'engageMessageAdd', _doc);

    const tags = engageMessage.getTags.map(tag => tag._id);

    expect(engageMessage.kind).toBe(_doc.kind);
    expect(new Date(engageMessage.stopDate)).toEqual(_doc.stopDate);
    expect(engageMessage.segmentIds).toEqual(_doc.segmentIds);
    expect(engageMessage.segments[0]._id).toContain(_doc.segmentIds);
    expect(engageMessage.tagIds).toEqual(_doc.tagIds);
    expect(engageMessage.brandIds).toEqual(_doc.brandIds);
    expect(engageMessage.customerIds).toEqual(_doc.customerIds);
    expect(engageMessage.title).toBe(_doc.title);
    expect(engageMessage.fromUserId).toBe(_doc.fromUserId);
    expect(engageMessage.method).toBe(_doc.method);
    expect(engageMessage.isDraft).toBe(_doc.isDraft);
    expect(engageMessage.isLive).toBe(_doc.isLive);
    expect(engageMessage.messengerReceivedCustomerIds).toEqual([]);
    expect(tags).toEqual(_doc.tagIds);
    expect(engageMessage.email.toJSON()).toEqual(_doc.email);
    expect(engageMessage.messenger.toJSON()).toMatchObject(_doc.messenger);
    expect(engageMessage.scheduleDate.type).toEqual('year');
    expect(engageMessage.scheduleDate.month).toEqual('2');
    expect(engageMessage.scheduleDate.day).toEqual('14');
    expect(engageMessage.fromUser._id).toBe(_doc.fromUserId);
  });

  test('Edit engage message', async () => {
    const mutation = `
      mutation engageMessageEdit($_id: String! ${commonParamDefs}) {
        engageMessageEdit(_id: $_id ${commonParams}) {
          _id
          kind
          segmentIds
          brandIds
          tagIds
          customerIds
          title
          fromUserId
          method
          isDraft
          isLive
          stopDate
          messengerReceivedCustomerIds
          email
          messenger
          segments {
            _id
          }
          fromUser {
            _id
          }
          getTags {
            _id
          }
        }
      }
    `;
    const fetchSpy = jest.spyOn(utils, 'fetchCronsApi');
    fetchSpy.mockImplementation(() => Promise.resolve('ok'));

    const engageMessage = await graphqlRequest(mutation, 'engageMessageEdit', { ..._doc, _id: _message._id });

    fetchSpy.mockRestore();

    const tags = engageMessage.getTags.map(tag => tag._id);

    expect(engageMessage.kind).toBe(_doc.kind);
    expect(engageMessage.segmentIds).toEqual(_doc.segmentIds);
    expect(engageMessage.segments[0]._id).toContain(_doc.segmentIds);
    expect(engageMessage.brandIds).toEqual(_doc.brandIds);
    expect(engageMessage.tagIds).toEqual(_doc.tagIds);
    expect(engageMessage.customerIds).toEqual(_doc.customerIds);
    expect(engageMessage.title).toBe(_doc.title);
    expect(engageMessage.fromUserId).toBe(_doc.fromUserId);
    expect(engageMessage.messenger.brandId).toBe(_doc.messenger.brandId);
    expect(engageMessage.messenger.kind).toBe(_doc.messenger.kind);
    expect(engageMessage.messenger.sentAs).toBe(_doc.messenger.sentAs);
    expect(engageMessage.messenger.content).toBe(_doc.messenger.content);
    expect(engageMessage.messenger.rules.kind).toBe(_doc.messenger.rules.kind);
    expect(engageMessage.messenger.rules.text).toBe(_doc.messenger.rules.text);
    expect(engageMessage.messenger.rules.condition).toBe(_doc.messenger.rules.condition);
    expect(engageMessage.messenger.rules.value).toBe(_doc.messenger.rules.value);
    expect(engageMessage.method).toBe(_doc.method);
    expect(engageMessage.isDraft).toBe(_doc.isDraft);
    expect(engageMessage.isLive).toBe(_doc.isLive);
    expect(engageMessage.messengerReceivedCustomerIds).toEqual([]);
    expect(tags).toEqual(_doc.tagIds);
    expect(engageMessage.email.toJSON()).toEqual(_doc.email);
    expect(engageMessage.fromUser._id).toBe(_doc.fromUserId);

    process.env.CRONS_API_DOMAIN = 'http://fake.erxes.io';

    try {
      await graphqlRequest(mutation, 'engageMessageEdit', { ..._doc, _id: _message._id });
    } catch (e) {
      expect(e[0].message).toBe(
        'Error: Failed to connect crons api. Check CRONS_API_DOMAIN env or crons api is not running',
      );
    }
  });

  test('Remove engage message', async () => {
    const mutation = `
      mutation engageMessageRemove($_id: String!) {
        engageMessageRemove(_id: $_id) {
          _id
        }
      }
    `;

    const fetchSpy = jest.spyOn(utils, 'fetchCronsApi');
    fetchSpy.mockImplementation(() => Promise.resolve('ok'));

    await graphqlRequest(mutation, 'engageMessageRemove', { _id: _message._id });

    expect(await EngageMessages.findOne({ _id: _message._id })).toBe(null);

    fetchSpy.mockRestore();

    process.env.CRONS_API_DOMAIN = 'http://fake.erxes.io';

    _message = await engageMessageFactory({ kind: 'post' });

    try {
      await graphqlRequest(mutation, 'engageMessageRemove', { _id: _message._id });
    } catch (e) {
      expect(e[0].message).toBe(
        'Error: Failed to connect crons api. Check CRONS_API_DOMAIN env or crons api is not running',
      );
    }
  });

  test('Set live engage message', async () => {
    const mutation = `
      mutation engageMessageSetLive($_id: String!) {
        engageMessageSetLive(_id: $_id) {
          isLive
        }
      }
    `;

    const fetchSpy = jest.spyOn(utils, 'fetchCronsApi');
    fetchSpy.mockImplementation(() => Promise.resolve('ok'));

    let response = await graphqlRequest(mutation, 'engageMessageSetLive', { _id: _message._id });

    expect(response.isLive).toBe(true);

    fetchSpy.mockRestore();

    const manualMessage = await engageMessageFactory({ kind: MESSAGE_KINDS.MANUAL });

    response = await graphqlRequest(mutation, 'engageMessageSetLive', { _id: manualMessage._id });

    expect(response.isLive).toBe(true);

    process.env.CRONS_API_DOMAIN = 'http://fake.erxes.io';

    try {
      await graphqlRequest(mutation, 'engageMessageSetLive', { _id: _message._id });
    } catch (e) {
      expect(e[0].message).toBe(
        'Error: Failed to connect crons api. Check CRONS_API_DOMAIN env or crons api is not running',
      );
    }
  });

  test('Set pause engage message', async () => {
    const mutation = `
      mutation engageMessageSetPause($_id: String!) {
        engageMessageSetPause(_id: $_id) {
          isLive
        }
      }
    `;

    const engageMessage = await graphqlRequest(mutation, 'engageMessageSetPause', { _id: _message._id });

    expect(engageMessage.isLive).toBe(false);
  });

  test('Set live manual engage message', async () => {
    const conversationObj = {
      userId: _user._id,
      customerId: _customer._id,
      integrationId: _integration._id,
      content: _message.messenger.content,
    };

    const conversationMessageObj = {
      engageData: {
        messageId: _message._id,
        fromUserId: _user._id,
        brandId: 'brandId',
        rules: [],
        content: _message.messenger.content,
      },
      conversationId: 'convId',
      userId: _user._id,
      customerId: _customer._id,
      content: _message.messenger.content,
    };

    const conversation = await conversationFactory(conversationObj);
    const conversationMessage = await conversationMessageFactory(conversationMessageObj);

    _message.segmentIds = [_segment._id];
    _message.messenger.brandId = _integration.brandId;

    await _message.save();

    const mutation = `
      mutation engageMessageSetLiveManual($_id: String!) {
        engageMessageSetLiveManual(_id: $_id) {
          isLive
        }
      }
    `;

    const engageMessage = await graphqlRequest(mutation, 'engageMessageSetLiveManual', { _id: _message._id });

    if (!conversationMessage.engageData) {
      throw new Error('Conversation engageData not found');
    }

    expect(engageMessage.isLive).toBe(true);
    expect(conversation.userId).toBe(conversationObj.userId);
    expect(conversation.customerId).toBe(conversationObj.customerId);
    expect(conversation.integrationId).toBe(conversationObj.integrationId);
    expect(conversation.content).toBe(conversationObj.content);
    expect(conversationMessage.engageData.toJSON()).toEqual(conversationMessageObj.engageData);
    expect(conversationMessage.conversationId).toBe(conversationMessageObj.conversationId);
    expect(conversationMessage.userId).toBe(conversationMessageObj.userId);
    expect(conversationMessage.customerId).toBe(conversationMessageObj.customerId);
    expect(conversationMessage.content).toBe(conversationMessageObj.content);
  });

  test('Handle engage unsubscribe', async () => {
    const customer = await customerFactory({ doNotDisturb: 'No' });
    const user = await userFactory({ doNotDisturb: 'No' });

    await handleUnsubscription({ cid: customer._id, uid: user._id });

    const updatedCustomer = await Customers.getCustomer(customer._id);

    expect(updatedCustomer.doNotDisturb).toBe('Yes');

    const updatedUser = await Users.getUser(user._id);

    expect(updatedUser.doNotDisturb).toBe('Yes');
  });
});
