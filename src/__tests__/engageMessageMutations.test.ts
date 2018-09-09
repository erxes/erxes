import * as faker from 'faker';
import * as moment from 'moment';
import * as sinon from 'sinon';
import * as engageUtils from '../data/resolvers/mutations/engageUtils';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import {
  brandFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  emailTemplateFactory,
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
import { awsRequests } from '../trackers/engageTracker';

beforeAll(() => connect());

afterAll(() => disconnect());

const toJSON = value => {
  return JSON.stringify(value);
};

describe('engage message mutation tests', () => {
  let _message;
  let _user;
  let _tag;
  let _brand;
  let _segment;
  let _customer;
  let _integration;
  let _emailTemplate;
  let _doc;
  let context;

  const commonParamDefs = `
    $title: String!,
    $kind: String!,
    $method: String!,
    $fromUserId: String!,
    $isDraft: Boolean,
    $isLive: Boolean,
    $stopDate: Date,
    $segmentId: String,
    $customerIds: [String],
    $tagIds: [String],
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
    segmentId: $segmentId
    customerIds: $customerIds
    tagIds: $tagIds
    email: $email
    scheduleDate: $scheduleDate
    messenger: $messenger
  `;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _tag = await tagsFactory({});
    _brand = await brandFactory({});
    _segment = await segmentFactory({});
    _message = await engageMessageFactory({ kind: 'auto', userId: _user._id });
    _emailTemplate = await emailTemplateFactory({});
    _customer = await customerFactory({});
    _integration = await integrationFactory({ brandId: 'brandId' });

    _doc = {
      title: 'Message test',
      kind: 'manual',
      method: 'email',
      fromUserId: _user._id,
      isDraft: true,
      isLive: true,
      stopDate: new Date(),
      segmentId: _segment._id,
      customerIds: [_customer._id],
      tagIds: [_tag._id],
      email: {
        templateId: _emailTemplate._id,
        subject: faker.random.word(),
        content: faker.random.word(),
        attachments: [{ name: 'document', url: 'documentPath' }, { name: 'image', url: 'imagePath' }],
      },
      scheduleDate: {
        type: 'year',
        month: 2,
        day: 14,
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

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    _doc = null;
    await Users.remove({});
    await Tags.remove({});
    await Brands.remove({});
    await Segments.remove({});
    await EngageMessages.remove({});
    await EmailTemplates.remove({});
    await Customers.remove({});
    await Integrations.remove({});
    await Conversations.remove({});
    await ConversationMessages.remove({});
  });

  test('Engage utils send via messenger: integration not found', async () => {
    expect.assertions(1);

    try {
      await engageUtils.send({
        _id: _message._id,
        method: 'messenger',
        title: 'Send via messenger',
        fromUserId: _user._id,
        segmentId: _segment._id,
        isLive: true,
        messenger: {
          brandId: '',
          content: 'content',
        },
      });
    } catch (e) {
      expect(e.message).toEqual('Integration not found');
    }
  });

  const engageMessageAddMutation = `
    mutation engageMessageAdd(${commonParamDefs}) {
      engageMessageAdd(${commonParams}) {
        kind
        segmentId
        customerIds
        title
        fromUserId
        method
        isDraft
        stopDate
        isLive
        stopDate
        messengerReceivedCustomerIds
        tagIds
        email
        messenger
        deliveryReports
        scheduleDate {
          type
          day
          month
          time
        }
        segment {
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
    process.env.AWS_SES_CONFIG_SET = 'aws-ses';
    process.env.AWS_ENDPOINT = '123';

    const user = await Users.findOne({ _id: _doc.fromUserId });

    if (!user) {
      throw new Error('User not found');
    }

    const sandbox = sinon.sandbox.create();

    sandbox.stub(awsRequests, 'getVerifiedEmails').callsFake(() => {
      return new Promise(resolve => {
        return resolve({ VerifiedEmailAddresses: [user.email] });
      });
    });

    const sendSpy = jest.spyOn(engageUtils, 'send');
    const awsSpy = jest.spyOn(awsRequests, 'getVerifiedEmails');

    const engageMessage = await graphqlRequest(engageMessageAddMutation, 'engageMessageAdd', _doc, context);

    const tags = engageMessage.getTags.map(tag => tag._id);

    expect(engageUtils.send).toHaveBeenCalled();
    expect(engageMessage.kind).toBe(_doc.kind);
    expect(new Date(engageMessage.stopDate)).toEqual(_doc.stopDate);
    expect(engageMessage.segmentId).toBe(_doc.segmentId);
    expect(engageMessage.customerIds).toEqual(_doc.customerIds);
    expect(engageMessage.title).toBe(_doc.title);
    expect(engageMessage.fromUserId).toBe(_doc.fromUserId);
    expect(engageMessage.method).toBe(_doc.method);
    expect(engageMessage.isDraft).toBe(_doc.isDraft);
    expect(engageMessage.isLive).toBe(_doc.isLive);
    expect(engageMessage.messengerReceivedCustomerIds).toEqual([]);
    expect(tags).toEqual(_doc.tagIds);
    expect(engageMessage.email.toJSON()).toEqual(_doc.email);
    expect(toJSON(engageMessage.messenger)).toEqual(toJSON(_doc.messenger));
    expect(engageMessage.deliveryReports).toEqual({});
    expect(engageMessage.scheduleDate.type).toEqual('year');
    expect(engageMessage.scheduleDate.month).toEqual('2');
    expect(engageMessage.scheduleDate.day).toEqual('14');
    expect(engageMessage.segment._id).toBe(_doc.segmentId);
    expect(engageMessage.fromUser._id).toBe(_doc.fromUserId);
    expect(engageMessage.tagIds).toEqual(_doc.tagIds);
    awsSpy.mockRestore();
    sendSpy.mockRestore();
  });

  test('Engage add without aws config', async () => {
    expect.assertions(1);

    try {
      // mock settings
      process.env.AWS_SES_CONFIG_SET = '';
      await graphqlRequest(engageMessageAddMutation, 'engageMessageAdd', _doc, context);
    } catch (e) {
      expect(e.toString()).toBe('GraphQLError: Could not locate configs on AWS SES');
    }
  });

  test('Engage add with unverified email', async () => {
    expect.assertions(1);

    process.env.AWS_SES_CONFIG_SET = 'aws-ses';
    process.env.AWS_ENDPOINT = '123';

    const sandbox = sinon.sandbox.create();
    const awsSpy = jest.spyOn(awsRequests, 'getVerifiedEmails');

    sandbox.stub(awsRequests, 'getVerifiedEmails').callsFake(() => {
      return new Promise(resolve => {
        return resolve({ VerifiedEmailAddresses: [] });
      });
    });

    try {
      await graphqlRequest(engageMessageAddMutation, 'engageMessageAdd', _doc, context);
    } catch (e) {
      expect(e.toString()).toBe('GraphQLError: Email not verified');
    }

    awsSpy.mockRestore();
  });

  test('Edit engage message', async () => {
    const mutation = `
      mutation engageMessageEdit($_id: String! ${commonParamDefs}) {
        engageMessageEdit(_id: $_id ${commonParams}) {
          _id
          kind
          segmentId
          customerIds
          title
          fromUserId
          method
          isDraft
          isLive
          stopDate
          messengerReceivedCustomerIds
          tagIds
          email
          messenger
          segment {
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

    const engageMessage = await graphqlRequest(mutation, 'engageMessageEdit', { ..._doc, _id: _message._id }, context);

    const tags = engageMessage.getTags.map(tag => tag._id);

    expect(engageMessage.kind).toBe(_doc.kind);
    expect(engageMessage.segmentId).toBe(_doc.segmentId);
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
    expect(engageMessage.segment._id).toBe(_doc.segmentId);
    expect(engageMessage.fromUser._id).toBe(_doc.fromUserId);
    expect(engageMessage.tagIds).toEqual(_doc.tagIds);
  });

  test('Remove engage message', async () => {
    const mutation = `
      mutation engageMessageRemove($_id: String!) {
        engageMessageRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'engageMessageRemove', { _id: _message._id }, context);

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

    const engageMessage = await graphqlRequest(mutation, 'engageMessageSetLive', { _id: _message._id }, context);

    expect(engageMessage.isLive).toBe(true);
  });

  test('Set pause engage message', async () => {
    const mutation = `
      mutation engageMessageSetPause($_id: String!) {
        engageMessageSetPause(_id: $_id) {
          isLive
        }
      }
    `;

    const engageMessage = await graphqlRequest(mutation, 'engageMessageSetPause', { _id: _message._id }, context);

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

    _message.segmentId = _segment._id;
    _message.messenger.brandId = _integration.brandId;

    await _message.save();

    const mutation = `
      mutation engageMessageSetLiveManual($_id: String!) {
        engageMessageSetLiveManual(_id: $_id) {
          isLive
        }
      }
    `;

    const sendSpy = jest.spyOn(engageUtils, 'send');

    const engageMessage = await graphqlRequest(mutation, 'engageMessageSetLiveManual', { _id: _message._id }, context);

    if (!conversationMessage.engageData) {
      throw new Error('Conversation engageData not found');
    }

    expect(engageUtils.send).toHaveBeenCalled();
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
    sendSpy.mockRestore();
  });
});
