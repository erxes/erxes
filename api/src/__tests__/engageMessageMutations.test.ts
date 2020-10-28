import * as faker from 'faker';
import * as sinon from 'sinon';
import { MESSAGE_KINDS } from '../data/constants';
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
  userFactory
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
  Users
} from '../db/models';
import messageBroker from '../messageBroker';

import { EngagesAPI } from '../data/dataSources';
import { handleUnsubscription } from '../data/utils';
import { KIND_CHOICES, METHODS } from '../db/models/definitions/constants';
import './setup.ts';

// to prevent duplicate expect checks
const checkEngageMessage = (src, result) => {
  expect(result.kind).toBe(src.kind);
  expect(new Date(result.stopDate)).toEqual(src.stopDate);
  expect(result.tagIds).toEqual(src.tagIds);
  expect(result.brandIds).toEqual(src.brandIds);
  expect(result.customerIds).toEqual(src.customerIds);
  expect(result.title).toBe(src.title);
  expect(result.fromUserId).toBe(src.fromUserId);
  expect(result.method).toBe(src.method);
  expect(result.isDraft).toBe(src.isDraft);
  expect(result.isLive).toBe(src.isLive);
};

describe('engage message mutation tests', () => {
  let _message;
  let _user;
  let _tag;
  let _brand;
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
    $shortMessage: EngageMessageSmsInput
  `;

  const commonParams = `
    title: $title,
    kind: $kind,
    method: $method,
    fromUserId: $fromUserId,
    isDraft: $isDraft,
    isLive: $isLive,
    stopDate: $stopDate,
    segmentIds: $segmentIds,
    brandIds: $brandIds,
    tagIds: $tagIds,
    customerIds: $customerIds,
    email: $email,
    scheduleDate: $scheduleDate,
    messenger: $messenger,
    shortMessage: $shortMessage
  `;

  const commonFields = `
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
    messengerReceivedCustomerIds
    email
    messenger
    shortMessage {
      from
      fromIntegrationId
      content
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
    fromIntegration {
      _id
    }
  `;

  let dataSources;

  beforeEach(async () => {
    dataSources = { EngagesAPI: new EngagesAPI() };

    // Creating test data
    _user = await userFactory({});
    _tag = await tagsFactory({});
    _brand = await brandFactory({});
    _integration = await integrationFactory({ brandId: _brand._id });

    _customer = await customerFactory({
      integrationId: _integration._id,
      emailValidationStatus: 'valid',
      phoneValidationStatus: 'valid',
      status: 'Active',
      profileScore: 1,
      primaryEmail: faker.internet.email(),
      firstName: faker.random.word(),
      lastName: faker.random.word()
    });

    _message = await engageMessageFactory({
      kind: MESSAGE_KINDS.AUTO,
      userId: _user._id,
      messenger: {
        content: 'content',
        brandId: _brand.id
      },
      customerIds: [_customer._id],
      brandIds: [_brand._id],
      tagIds: [_tag._id]
    });

    _doc = {
      title: 'Message test',
      kind: MESSAGE_KINDS.AUTO,
      method: METHODS.EMAIL,
      fromUserId: _user._id,
      isDraft: true,
      isLive: true,
      stopDate: new Date(),
      brandIds: [_brand._id],
      tagIds: [_tag._id],
      customerIds: [_customer._id],
      email: {
        subject: faker.random.word(),
        content: faker.random.word()
      },
      scheduleDate: {
        type: 'year',
        month: '2',
        day: '14'
      },
      messenger: {
        brandId: _brand._id,
        kind: 'chat',
        sentAs: 'badge',
        content: faker.random.word(),
        rules: [
          {
            _id: _message._id,
            kind: MESSAGE_KINDS.MANUAL,
            text: faker.random.word(),
            condition: faker.random.word(),
            value: faker.random.word()
          }
        ]
      }
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

  test('generateCustomerSelector', async () => {
    const segment = await segmentFactory({});
    const brand = await brandFactory({});
    await integrationFactory({ brandId: brand._id });

    await engageUtils.generateCustomerSelector({
      segmentIds: [segment._id],
      brandIds: [brand._id]
    });
  });

  test('Engage utils send via messenger', async () => {
    const brand = await brandFactory();
    const emessage = await engageMessageFactory({
      method: METHODS.MESSENGER,
      title: 'Send via messenger',
      userId: _user._id,
      customerIds: [_customer._id],
      isLive: true,
      messenger: {
        brandId: brand._id,
        content: 'content'
      }
    });

    try {
      await engageUtils.send(emessage);
    } catch (e) {
      expect(e.message).toEqual('Integration not found');
    }

    const emessageWithoutUser = await engageMessageFactory({
      method: METHODS.MESSENGER,
      title: 'Send via messenger',
      userId: 'fromUserId',
      customerIds: [_customer._id],
      isLive: true,
      messenger: {
        brandId: brand._id,
        content: 'content'
      }
    });

    try {
      await engageUtils.send(emessageWithoutUser);
    } catch (e) {
      expect(e.message).toEqual('User not found');
    }

    const integration = await integrationFactory({
      brandId: brand._id,
      kind: KIND_CHOICES.MESSENGER
    });

    const emessageWithBrand = await engageMessageFactory({
      method: METHODS.MESSENGER,
      title: 'Send via messenger',
      userId: _user._id,
      isLive: true,
      customerIds: [_customer._id],
      messenger: {
        brandId: brand._id,
        content: 'content'
      }
    });

    await engageUtils.send(emessageWithBrand);

    // setCustomerIds
    const setCustomer = await EngageMessages.findOne({
      _id: _message._id,
      customerIds: _customer._id
    });
    expect(setCustomer).toBeDefined();

    // create conversation
    const newConversation = await Conversations.findOne({
      userId: _user._id,
      customerId: _customer._id,
      integrationId: integration._id,
      content: 'content'
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
      content: 'content'
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
      method: 'messenger'
    });

    await engageUtils.send(emessageNoMessenger);
  }); // end engage utils send via messenger

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
      kind: KIND_CHOICES.MESSENGER
    });

    const emessage = await engageMessageFactory({
      method: METHODS.MESSENGER,
      customerIds: [_customer._id],
      userId: user._id,
      isLive: true,
      messenger: {
        brandId: brand._id,
        content: 'content'
      }
    });

    await engageUtils.send(emessage);
  });

  test('Engage utils send via email & sms', async () => {
    const mock = sinon.stub(messageBroker(), 'sendMessage').callsFake(() => {
      return Promise.resolve('success');
    });

    process.env.AWS_SES_ACCESS_KEY_ID = '123';
    process.env.AWS_SES_SECRET_ACCESS_KEY = '123';
    process.env.AWS_SES_CONFIG_SET = 'aws-ses';
    process.env.AWS_ENDPOINT = '123';
    process.env.MAIL_PORT = '123';
    process.env.AWS_REGION = 'us-west-2';
    process.env.ENGAGE_ADMINS =
      '[{"_id":"WkjhEfjJ4QW9EEW9F","name":"engageAdmin","email":"mrbatamar@gmail.com"}]';

    const emessage = await engageMessageFactory({
      method: METHODS.EMAIL,
      title: 'Send via email',
      userId: 'fromUserId',
      customerIds: [_customer],
      email: {
        subject: 'subject',
        content: 'content',
        attachments: []
      }
    });

    try {
      await engageUtils.send(emessage);
    } catch (e) {
      expect(e.message).toBe('User not found');
    }

    const emessageWithUser = await engageMessageFactory({
      method: METHODS.EMAIL,
      title: 'Send via email',
      userId: _user._id,
      customerIds: [_customer._id],
      isLive: true,
      email: {
        subject: 'subject',
        content: 'content',
        attachments: []
      }
    });

    await engageUtils.send(emessageWithUser);

    _customer.firstName = undefined;
    _customer.lastName = undefined;

    _customer.save();

    const emessageNoInitial = await engageMessageFactory({
      method: METHODS.EMAIL,
      title: 'Send via email',
      userId: _user._id,
      isLive: true,
      customerIds: [_customer._id],
      email: {
        subject: 'subject',
        content: 'content',
        attachments: []
      }
    });

    await engageUtils.send(emessageNoInitial);

    const emessageNotLive = await engageMessageFactory({
      isLive: false,
      userId: _user._id
    });

    await engageUtils.send(emessageNotLive);

    // sms engage msg
    const msg = await engageMessageFactory({
      method: METHODS.SMS,
      title: 'Send via sms',
      userId: _user._id,
      customerIds: [_customer._id],
      isLive: true
    });

    await engageUtils.send(msg);

    mock.restore();
  });

  const engageMessageAddMutation = `
    mutation engageMessageAdd(${commonParamDefs}) {
      engageMessageAdd(${commonParams}) {
        ${commonFields}

        scheduleDate {
          type
          day
          month
        }
      }
    }
  `;

  test('Add engage message', async () => {
    const mock = sinon.stub(messageBroker(), 'sendMessage').callsFake(() => {
      return Promise.resolve('success');
    });

    process.env.AWS_SES_ACCESS_KEY_ID = '123';
    process.env.AWS_SES_SECRET_ACCESS_KEY = '123';
    process.env.AWS_SES_CONFIG_SET = 'aws-ses';
    process.env.AWS_ENDPOINT = '123';

    const user = await Users.findOne({ _id: _doc.fromUserId });

    if (!user) {
      throw new Error('User not found');
    }

    try {
      await graphqlRequest(engageMessageAddMutation, 'engageMessageAdd', {
        ..._doc,
        kind: MESSAGE_KINDS.MANUAL,
        brandIds: ['_id']
      });
    } catch (e) {
      expect(e[0].message).toBe('No customers found');
    }

    const engageMessage = await graphqlRequest(
      engageMessageAddMutation,
      'engageMessageAdd',
      _doc
    );

    const tags = engageMessage.getTags.map(tag => tag._id);

    expect(engageMessage.messengerReceivedCustomerIds).toEqual([]);
    expect(tags).toEqual(_doc.tagIds);
    expect(engageMessage.scheduleDate.type).toEqual('year');
    expect(engageMessage.scheduleDate.month).toEqual('2');
    expect(engageMessage.scheduleDate.day).toEqual('14');

    checkEngageMessage(engageMessage, _doc);

    mock.restore();
  });

  test('Edit engage message', async () => {
    const mutation = `
      mutation engageMessageEdit($_id: String! ${commonParamDefs}) {
        engageMessageEdit(_id: $_id ${commonParams}) {
          _id
          ${commonFields}
        }
      }
    `;

    const editedUser = await userFactory();
    const args = { ..._doc, _id: _message._id, fromUserId: editedUser._id };

    const engageMessage = await graphqlRequest(
      mutation,
      'engageMessageEdit',
      args
    );

    const tags = engageMessage.getTags.map(tag => tag._id);

    expect(engageMessage.messenger.brandId).toBe(_doc.messenger.brandId);
    expect(engageMessage.messenger.kind).toBe(_doc.messenger.kind);
    expect(engageMessage.messenger.sentAs).toBe(_doc.messenger.sentAs);
    expect(engageMessage.messenger.content).toBe(_doc.messenger.content);
    expect(engageMessage.messenger.rules.kind).toBe(_doc.messenger.rules.kind);
    expect(engageMessage.messenger.rules.text).toBe(_doc.messenger.rules.text);
    expect(engageMessage.messenger.rules.condition).toBe(
      _doc.messenger.rules.condition
    );
    expect(engageMessage.messenger.rules.value).toBe(
      _doc.messenger.rules.value
    );
    expect(engageMessage.messengerReceivedCustomerIds).toEqual([]);
    expect(tags).toEqual(_doc.tagIds);

    checkEngageMessage(engageMessage, args);
  });

  test('Remove engage message', async () => {
    const mutation = `
      mutation engageMessageRemove($_id: String!) {
        engageMessageRemove(_id: $_id) {
          _id
        }
      }
    `;

    _message = await engageMessageFactory({ kind: MESSAGE_KINDS.AUTO });

    await graphqlRequest(mutation, 'engageMessageRemove', {
      _id: _message._id
    });

    expect(await EngageMessages.findOne({ _id: _message._id })).toBe(null);
  });

  test('Set live engage message', async () => {
    const mutation = `
      mutation engageMessageSetLive($_id: String!) {
        engageMessageSetLive(_id: $_id) {
          isLive
        }
      }
    `;

    let response = await graphqlRequest(mutation, 'engageMessageSetLive', {
      _id: _message._id
    });

    expect(response.isLive).toBe(true);

    const manualMessage = await engageMessageFactory({
      kind: MESSAGE_KINDS.MANUAL
    });

    response = await graphqlRequest(mutation, 'engageMessageSetLive', {
      _id: manualMessage._id
    });

    expect(response.isLive).toBe(true);

    await graphqlRequest(mutation, 'engageMessageSetLive', {
      _id: _message._id
    });
  });

  test('Set pause engage message', async () => {
    const mutation = `
      mutation engageMessageSetPause($_id: String!) {
        engageMessageSetPause(_id: $_id) {
          isLive
        }
      }
    `;

    const engageMessage = await graphqlRequest(
      mutation,
      'engageMessageSetPause',
      { _id: _message._id }
    );

    expect(engageMessage.isLive).toBe(false);
  });

  test('Set live manual engage message', async () => {
    const conversationObj = {
      userId: _user._id,
      customerId: _customer._id,
      integrationId: _integration._id,
      content: _message.messenger.content
    };

    const conversationMessageObj = {
      engageData: {
        messageId: _message._id,
        fromUserId: _user._id,
        brandId: 'brandId',
        rules: [],
        content: _message.messenger.content
      },
      conversationId: 'convId',
      userId: _user._id,
      customerId: _customer._id,
      content: _message.messenger.content
    };

    const conversation = await conversationFactory(conversationObj);
    const conversationMessage = await conversationMessageFactory(
      conversationMessageObj
    );

    _message.customerIds = [_customer._id];
    _message.messenger.brandId = _integration.brandId;

    await _message.save();

    const mutation = `
      mutation engageMessageSetLiveManual($_id: String!) {
        engageMessageSetLiveManual(_id: $_id) {
          isLive
        }
      }
    `;

    const engageMessage = await graphqlRequest(
      mutation,
      'engageMessageSetLiveManual',
      { _id: _message._id }
    );

    if (!conversationMessage.engageData) {
      throw new Error('Conversation engageData not found');
    }

    expect(engageMessage.isLive).toBe(true);
    expect(conversation.userId).toBe(conversationObj.userId);
    expect(conversation.customerId).toBe(conversationObj.customerId);
    expect(conversation.integrationId).toBe(conversationObj.integrationId);
    expect(conversation.content).toBe(conversationObj.content);
    expect(conversationMessage.engageData.toJSON()).toEqual(
      conversationMessageObj.engageData
    );
    expect(conversationMessage.conversationId).toBe(
      conversationMessageObj.conversationId
    );
    expect(conversationMessage.userId).toBe(conversationMessageObj.userId);
    expect(conversationMessage.customerId).toBe(
      conversationMessageObj.customerId
    );
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

  test('configSave', async () => {
    const mutation = `
      mutation engagesUpdateConfigs($configsMap: JSON!) {
        engagesUpdateConfigs(configsMap: $configsMap)
      }
    `;

    const mock = sinon
      .stub(dataSources.EngagesAPI, 'engagesUpdateConfigs')
      .callsFake(() => {
        return Promise.resolve([]);
      });

    await graphqlRequest(
      mutation,
      'engagesUpdateConfigs',
      { configsMap: { accessKeyId: 'accessKeyId' } },
      { dataSources }
    );

    mock.restore();
  });

  test('dataSources', async () => {
    const check = async (mutation, name, args) => {
      await graphqlRequest(mutation, name, args, { dataSources });
    };

    const api = dataSources.EngagesAPI;

    let mock = sinon.stub(api, 'engagesVerifyEmail').callsFake(() => {
      return Promise.resolve('true');
    });

    await check(
      `
      mutation engageMessageVerifyEmail($email: String!) {
        engageMessageVerifyEmail(email: $email)
      }
    `,
      'engageMessageVerifyEmail',
      { email: 'email@yahoo.com' }
    );

    mock = sinon.stub(api, 'engagesRemoveVerifiedEmail').callsFake(() => {
      return Promise.resolve('true');
    });

    await check(
      `
      mutation engageMessageRemoveVerifiedEmail($email: String!) {
        engageMessageRemoveVerifiedEmail(email: $email)
      }
    `,
      'engageMessageRemoveVerifiedEmail',
      { email: 'email@yahoo.com' }
    );

    mock = sinon.stub(api, 'engagesSendTestEmail').callsFake(() => {
      return Promise.resolve('true');
    });

    await check(
      `
      mutation engageMessageSendTestEmail($from: String!, $to: String!, $content: String!) {
        engageMessageSendTestEmail(from: $from, to: $to, content: $content)
      }
    `,
      'engageMessageSendTestEmail',
      { from: 'from@yahoo.com', to: 'to@yahoo.com', content: 'content' }
    );

    mock.restore();
  });

  test('Test auto engage with type SMS', async () => {
    try {
      await graphqlRequest(engageMessageAddMutation, 'engageMessageAdd', {
        ..._doc,
        kind: MESSAGE_KINDS.AUTO,
        method: METHODS.SMS,
        brandIds: ['_id']
      });
    } catch (e) {
      expect(e[0].message).toBe(
        `SMS engage message of kind ${MESSAGE_KINDS.AUTO} is not supported`
      );
    }
  });

  test('Test sms engage message with integration chosen', async () => {
    const integration = await integrationFactory({ kind: 'telnyx' });

    const response = await graphqlRequest(
      engageMessageAddMutation,
      'engageMessageAdd',
      {
        ..._doc,
        fromUserId: '',
        kind: MESSAGE_KINDS.MANUAL,
        method: METHODS.SMS,
        shortMessage: {
          content: 'sms test',
          fromIntegrationId: integration._id
        },
        title: 'Message test'
      }
    );

    expect(response.fromIntegration._id).toBe(integration._id);
  });
});
