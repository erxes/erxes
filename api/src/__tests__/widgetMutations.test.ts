import * as faker from 'faker';
import * as Random from 'meteor-random';
import * as sinon from 'sinon';
import { MESSAGE_KINDS } from '../data/constants';
import { IntegrationsAPI } from '../data/dataSources';
import * as logUtils from '../data/logUtils';
import widgetMutations, {
  getMessengerData
} from '../data/resolvers/mutations/widgets';
import * as utils from '../data/utils';
import {
  brandFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  engageMessageFactory,
  fieldFactory,
  fieldGroupFactory,
  formFactory,
  integrationFactory,
  knowledgeBaseArticleFactory,
  messengerAppFactory,
  skillFactor,
  userFactory
} from '../db/factories';
import {
  Brands,
  Companies,
  ConversationMessages,
  Conversations,
  Customers,
  FormSubmissions,
  Integrations,
  KnowledgeBaseArticles,
  MessengerApps
} from '../db/models';
import { IBrandDocument } from '../db/models/definitions/brands';
import {
  CONVERSATION_OPERATOR_STATUS,
  CONVERSATION_STATUSES,
  MESSAGE_TYPES,
  METHODS
} from '../db/models/definitions/constants';
import { ICustomerDocument } from '../db/models/definitions/customers';
import { IIntegrationDocument } from '../db/models/definitions/integrations';
import * as elk from '../elasticsearch';
import './setup.ts';

describe('messenger connect', () => {
  let _brand: IBrandDocument;
  let _integration: IIntegrationDocument;
  let _customer: ICustomerDocument;

  beforeEach(async () => {
    // Creating test data
    _brand = await brandFactory();
    _integration = await integrationFactory({
      brandId: _brand._id,
      kind: 'messenger'
    });
    _customer = await customerFactory({
      integrationId: _integration._id,
      primaryEmail: 'test@gmail.com',
      emails: ['test@gmail.com'],
      primaryPhone: '96221050',
      deviceTokens: ['111']
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
    await Customers.deleteMany({});
    await MessengerApps.deleteMany({});
  });

  test('brand not found', async () => {
    try {
      await widgetMutations.widgetsMessengerConnect(
        {},
        { brandCode: 'invalidCode' }
      );
    } catch (e) {
      expect(e.message).toBe('Invalid configuration');
    }
  });

  test('integration not found', async () => {
    const brand = await brandFactory({});

    try {
      await widgetMutations.widgetsMessengerConnect(
        {},
        { brandCode: brand.code || '' }
      );
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }
  });

  test('Test inactive integration', async () => {
    const brand = await brandFactory({});
    const integration = await integrationFactory({
      isActive: false,
      brandId: brand._id
    });

    try {
      await widgetMutations.widgetsMessengerConnect(
        {},
        { brandCode: brand.code || '' }
      );
    } catch (e) {
      expect(e.message).toBe(`Integration "${integration.name}" is not active`);
    }
  });

  test('Company data (Not a valid enum value for path `industry`)', async () => {
    const brand = await brandFactory();
    await integrationFactory({ brandId: brand._id });

    const companyName = faker.name.findName();

    await widgetMutations.widgetsMessengerConnect(
      {},
      {
        brandCode: brand.code || '',
        companyData: { name: companyName, industry: 'үйлчилгээ' }
      }
    );

    // company isn't created because industry is not a valid
    expect(await Companies.findOne({ name: companyName })).toBeNull();
  });

  test('with company error`)', async () => {
    const mock = sinon.stub(Companies, 'createCompany').callsFake(() => {
      throw new Error('fake error');
    });

    const brand = await brandFactory();
    await integrationFactory({ brandId: brand._id });

    const companyName = faker.name.findName();

    await widgetMutations.widgetsMessengerConnect(
      {},
      {
        brandCode: brand.code || '',
        companyData: { name: companyName, industry: 'үйлчилгээ' }
      }
    );

    // company isn't created because industry is not a valid
    expect(await Companies.findOne({ name: companyName })).toBeNull();
    mock.restore();
  });

  test('returns proper integrationId', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    await messengerAppFactory({
      kind: 'knowledgebase',
      name: 'kb',
      credentials: {
        integrationId: _integration._id,
        topicId: 'topicId'
      }
    });

    await messengerAppFactory({
      kind: 'lead',
      name: 'lead',
      credentials: {
        integrationId: _integration._id,
        formCode: 'formCode'
      }
    });

    const {
      integrationId,
      brand,
      messengerData
    } = await widgetMutations.widgetsMessengerConnect(
      {},
      { brandCode: _brand.code || '', email: faker.internet.email() }
    );

    expect(integrationId).toBe(_integration._id);
    expect(brand.code).toBe(_brand.code);
    expect(messengerData.formCode).toBe('formCode');
    expect(messengerData.knowledgeBaseTopicId).toBe('topicId');

    mock.restore();
  });

  test('creates new customer', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });
    const email = 'newCustomer@gmail.com';
    const now = new Date();

    const { customerId } = await widgetMutations.widgetsMessengerConnect(
      {},
      {
        brandCode: _brand.code || '',
        email,
        companyData: { name: 'company' },
        deviceToken: '111'
      }
    );

    expect(customerId).toBeDefined();

    const customer = await Customers.findById(customerId);

    if (!customer) {
      throw new Error('customer not found');
    }

    expect(customer._id).toBeDefined();
    expect(customer.primaryEmail).toBe(email);
    expect(customer.emails).toContain(email);
    expect(customer.integrationId).toBe(_integration._id);
    expect((customer.deviceTokens || []).length).toBe(1);
    expect(customer.deviceTokens).toContain('111');
    expect(customer.createdAt >= now).toBeTruthy();
    expect(customer.sessionCount).toBe(1);
    mock.restore();
  });

  test('creates new visitor log', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const logUtilsMock = sinon
      .stub(logUtils, 'sendToVisitorLog')
      .callsFake(() => {
        return Promise.resolve('ok');
      });

    const response = await widgetMutations.widgetsMessengerConnect(
      {},
      {
        brandCode: _brand.code || '',
        visitorId: '123'
      }
    );

    expect(response.customerId).toBeUndefined();
    expect(response.visitorId).toBe('123');

    logUtilsMock.restore();
    mock.restore();
  });

  test('updates existing customer', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const now = new Date();

    const { customerId } = await widgetMutations.widgetsMessengerConnect(
      {},
      {
        brandCode: _brand.code || '',
        email: _customer.primaryEmail,
        isUser: true,
        deviceToken: '222'
      }
    );

    expect(customerId).toBeDefined();

    const customer = await Customers.findById(customerId);

    if (!customer) {
      throw new Error('customer not found');
    }

    expect(customer).toBeDefined();
    expect(customer.integrationId).toBe(_integration._id);
    expect(customer.createdAt < now).toBeTruthy();

    // must be updated
    expect((customer.deviceTokens || []).length).toBe(2);
    expect(customer.deviceTokens).toContain('111');
    expect(customer.deviceTokens).toContain('222');
    mock.restore();
  });
});

describe('insertMessage()', () => {
  let _integration: IIntegrationDocument;
  let _customer: ICustomerDocument;
  let _integrationBot: IIntegrationDocument;
  let context;

  beforeEach(async () => {
    // Creating test data
    _integration = await integrationFactory({
      brandId: Random.id(),
      kind: 'messenger'
    });
    _integrationBot = await integrationFactory({
      brandId: Random.id(),
      kind: 'messenger',
      messengerData: {
        botEndpointUrl: 'botEndpointUrl'
      }
    });
    _customer = await customerFactory({ integrationId: _integration._id });

    context = {
      dataSources: {
        IntegrationsAPI: new IntegrationsAPI()
      }
    };
  });

  afterEach(async () => {
    // Clearing test data
    await Integrations.deleteMany({});
    await Customers.deleteMany({});
  });

  test('without conversationId', async () => {
    const now = new Date();

    const message = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.TEXT,
        integrationId: _integration._id,
        customerId: _customer._id,
        message: faker.lorem.sentence()
      },
      context
    );

    // check message ==========
    expect(message).toBeDefined();
    expect(message.createdAt >= now).toBeTruthy();

    // check conversation =========
    const conversation = await Conversations.findById(message.conversationId);

    if (!conversation) {
      throw new Error('conversation is not found');
    }

    expect(conversation.status).toBe(CONVERSATION_STATUSES.OPEN);
    expect((conversation.readUserIds || []).length).toBe(0);

    // check customer =========
    const customer = await Customers.findOne({ _id: _customer._id });

    if (!customer) {
      throw new Error('customer is not found');
    }

    expect(customer.isOnline).toBeTruthy();

    const user = await userFactory({ code: '123 ' });
    const skill = await skillFactor({ memberIds: [user._id] });

    const message2 = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.TEXT,
        integrationId: _integration._id,
        customerId: _customer._id,
        message: faker.lorem.sentence(),
        skillId: skill._id
      },
      context
    );

    const conversation2 = await Conversations.findById(
      message2.conversationId
    ).lean();

    if (conversation2) {
      expect(conversation2.userRelevance).toBe(`${user.code}SS`);
    }
  });

  test('with conversationId', async () => {
    const conversation = await conversationFactory({});

    const message = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.TEXT,
        integrationId: _integration._id,
        customerId: _customer._id,
        message: 'withConversationId',
        conversationId: conversation._id
      },
      context
    );

    expect(message.content).toBe('withConversationId');
  });

  test('with visitorId', async () => {
    const logUtilsMock = sinon
      .stub(logUtils, 'sendToVisitorLog')
      .callsFake(() => {
        return Promise.resolve('ok');
      });

    const mock = sinon.stub(logUtils, 'getVisitorLog').callsFake(() => {
      return Promise.resolve({
        visitorId: '123',
        _id: '1245'
      });
    });
    const conversation = await conversationFactory({});

    const message = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.TEXT,
        integrationId: _integration._id,
        visitorId: '123',
        message: 'withConversationId',
        conversationId: conversation._id
      },
      context
    );

    expect(message.content).toBe('withConversationId');

    mock.restore();
    logUtilsMock.restore();
  });

  test('Widget bot message with conversationId', async () => {
    const conversation = await conversationFactory({
      operatorStatus: CONVERSATION_OPERATOR_STATUS.BOT
    });

    const conversation2 = await conversationFactory({
      operatorStatus: CONVERSATION_OPERATOR_STATUS.OPERATOR
    });

    const sendRequestMock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve({
        responses: [
          {
            type: 'text',
            text: 'Bot message'
          }
        ]
      });
    });

    const message = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.TEXT,
        integrationId: _integrationBot._id,
        message: 'User message',
        customerId: _customer._id,
        conversationId: conversation._id
      },
      context
    );

    expect(message.content).toBe('User message');

    const botMessage = await ConversationMessages.findOne({
      conversationId: conversation._id,
      botData: { $exists: true }
    });

    if (botMessage) {
      expect(botMessage.botData).toEqual([
        {
          type: 'text',
          text: 'Bot message'
        }
      ]);
    } else {
      fail('Bot message not found');
    }

    const message2 = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.TEXT,
        integrationId: _integrationBot._id,
        message: 'User message 2',
        customerId: _customer._id,
        conversationId: conversation2._id
      },
      context
    );

    expect(message2.content).toBe('User message 2');

    sendRequestMock.restore();
  });

  test('Bot message without conversationId', async () => {
    const sendRequestMock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve({
        responses: [
          {
            type: 'text',
            text: 'Bot message'
          }
        ]
      });
    });

    const message = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.TEXT,
        integrationId: _integrationBot._id,
        message: 'User message',
        customerId: _customer._id
      },
      context
    );

    expect(message.content).toBe('User message');

    const botMessage = await ConversationMessages.findOne({
      conversationId: message.conversationId,
      botData: { $exists: true }
    });

    if (botMessage) {
      expect(botMessage.botData).toEqual([
        {
          type: 'text',
          text: 'Bot message'
        }
      ]);
    } else {
      fail('Bot message not found');
    }

    sendRequestMock.restore();
  });

  test('Bot show initial message', async () => {
    const mock = sinon.stub(utils, 'sendRequest').returns(
      Promise.resolve({
        responses: [
          {
            type: 'text',
            text: 'Greeting bot message'
          }
        ]
      })
    );

    const message = await widgetMutations.widgetGetBotInitialMessage(
      {},
      {
        integrationId: _integrationBot._id
      }
    );

    expect(message.botData[0].text).toBe('Greeting bot message');

    mock.restore();
  });

  test('Bot widget post request', async () => {
    const conversation1 = await conversationFactory({
      operatorStatus: CONVERSATION_OPERATOR_STATUS.BOT
    });
    const conversation2 = await conversationFactory({
      operatorStatus: CONVERSATION_OPERATOR_STATUS.BOT
    });

    const sendRequestMock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve({
        responses: [
          {
            type: 'text',
            text: 'Response of quick reply'
          }
        ]
      });
    });

    const botMessage1 = await widgetMutations.widgetBotRequest(
      {},
      {
        integrationId: _integrationBot._id,
        conversationId: conversation1._id,
        customerId: _customer._id,
        message: 'Reply message',
        payload: 'Response of reply',
        type: 'postback'
      }
    );

    const message1 = await ConversationMessages.findOne({
      conversationId: conversation1._id,
      botData: { $exists: false }
    });

    if (message1) {
      expect(message1.content).toBe('Reply message');
    } else {
      fail('Message not found');
    }

    expect(botMessage1.botData).toEqual([
      {
        type: 'text',
        text: 'Response of quick reply'
      }
    ]);

    const botMessage2 = await widgetMutations.widgetBotRequest(
      {},
      {
        integrationId: _integrationBot._id,
        conversationId: conversation2._id,
        customerId: _customer._id,
        message: 'Reply message 2',
        payload: 'Response of reply',
        type: 'say_something'
      }
    );

    const message2 = await ConversationMessages.findOne({
      conversationId: conversation2._id,
      botData: { $exists: false }
    });

    if (message2) {
      expect(message2.content).toBe('Reply message 2');
    } else {
      fail('Message not found');
    }

    expect(botMessage2.botData).toEqual([
      {
        type: 'text',
        text: 'Response of reply'
      }
    ]);

    const sendToVisitorLogMock = sinon
      .stub(logUtils, 'sendToVisitorLog')
      .callsFake(() => {
        return Promise.resolve({
          visitorId: '123',
          integrationId: _integration._id
        });
      });

    const visitorMock = sinon.stub(logUtils, 'getVisitorLog').callsFake(() => {
      return Promise.resolve({
        visitorId: '123',
        integrationId: _integration._id
      });
    });

    const botMessage3 = await widgetMutations.widgetBotRequest(
      {},
      {
        integrationId: _integrationBot._id,
        visitorId: '123',
        message: 'Reply message',
        payload: 'Response of reply',
        type: 'postback'
      }
    );

    expect(botMessage3.botData).toEqual([
      {
        type: 'text',
        text: 'Response of quick reply'
      }
    ]);

    visitorMock.restore();
    sendToVisitorLogMock.restore();

    sendRequestMock.restore();
  });

  test('Video call request', async () => {
    const conversation = await conversationFactory();

    // When first video call request
    const vcrMessage = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.VIDEO_CALL_REQUEST,
        integrationId: _integration._id,
        customerId: _customer._id,
        conversationId: conversation._id,
        message: ''
      },
      context
    );

    expect(vcrMessage).toBeDefined();

    // When not connected with Integration API
    const vcrMessage2 = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.VIDEO_CALL_REQUEST,
        integrationId: _integration._id,
        customerId: _customer._id,
        conversationId: conversation._id,
        message: ''
      },
      context
    );

    expect(vcrMessage2).toBeDefined();

    // When occured error
    const spy = jest.spyOn(context.dataSources.IntegrationsAPI, 'fetchApi');

    spy.mockImplementation(() =>
      Promise.resolve([
        { code: 'VIDEO_CALL_TIME_DELAY_BETWEEN_REQUESTS', value: 10 },
        {
          code: 'VIDEO_CALL_MESSAGE_FOR_TIME_DELAY',
          value: 'Video call request has already sent'
        }
      ])
    );

    try {
      await widgetMutations.widgetsInsertMessage(
        {},
        {
          contentType: MESSAGE_TYPES.VIDEO_CALL_REQUEST,
          integrationId: _integration._id,
          customerId: _customer._id,
          conversationId: conversation._id,
          message: ''
        },
        context
      );
    } catch (e) {
      expect(e.message).toBe('Video call request has already sent');
    }
  });

  test('Failed to send notification to mobile', async () => {
    const spy = jest.spyOn(utils, 'sendMobileNotification');
    spy.mockImplementation(() => {
      throw new Error('error');
    });

    const conversation = await conversationFactory();

    const message = await widgetMutations.widgetsInsertMessage(
      {},
      {
        contentType: MESSAGE_TYPES.TEXT,
        integrationId: _integration._id,
        customerId: _customer._id,
        conversationId: conversation._id,
        message: 'message'
      },
      context
    );

    expect(message.content).toBe('message');

    spy.mockRestore();
  });
});

describe('saveBrowserInfo()', () => {
  const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
    return Promise.resolve('success');
  });

  afterEach(async () => {
    // Clearing test data
    await Integrations.deleteMany({});
    await Customers.deleteMany({});
    await Brands.deleteMany({});
  });

  test('not found', async () => {
    let customer = await customerFactory({});

    // integration not found
    try {
      await widgetMutations.widgetsSaveBrowserInfo(
        {},
        {
          customerId: customer._id,
          browserInfo: {}
        }
      );
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    const integration = await integrationFactory({});
    customer = await customerFactory({ integrationId: integration._id });

    try {
      await widgetMutations.widgetsSaveBrowserInfo(
        {},
        {
          customerId: customer._id,
          browserInfo: {}
        }
      );
    } catch (e) {
      expect(e.message).toBe('Brand not found');
    }
  });

  test('success', async () => {
    const user = await userFactory({});
    const brand = await brandFactory({});
    const integration = await integrationFactory({ brandId: brand._id });

    const customer = await customerFactory({ integrationId: integration._id });

    await engageMessageFactory({
      userId: user._id,
      messenger: {
        brandId: brand._id,
        content: 'engageMessage',
        rules: [
          {
            text: 'text',
            kind: 'currentPageUrl',
            condition: 'is',
            value: '/page'
          }
        ]
      },
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      method: 'messenger',
      isLive: true
    });

    const response = await widgetMutations.widgetsSaveBrowserInfo(
      {},
      {
        customerId: customer._id,
        browserInfo: { url: '/page' }
      }
    );

    expect(response).toBe(null);
  });

  test('with visitorId', async () => {
    const user = await userFactory({});
    const brand = await brandFactory({});
    const integration = await integrationFactory({ brandId: brand._id });

    const sendToVisitorLogMock = sinon
      .stub(logUtils, 'sendToVisitorLog')
      .callsFake(() => {
        return Promise.resolve({
          visitorId: '1234',
          integrationId: integration._id
        });
      });

    const getVisitorLogMock = sinon
      .stub(logUtils, 'getVisitorLog')
      .callsFake(() => {
        return Promise.resolve({
          visitorId: '1234',
          integrationId: integration._id
        });
      });

    await engageMessageFactory({
      userId: user._id,
      messenger: {
        brandId: brand._id,
        content: 'engageMessage',
        rules: [
          {
            text: 'text',
            kind: 'currentPageUrl',
            condition: 'is',
            value: '/page'
          }
        ]
      },
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      method: METHODS.MESSENGER,
      isLive: true
    });

    const response = await widgetMutations.widgetsSaveBrowserInfo(
      {},
      {
        visitorId: '1234',
        browserInfo: { url: '/page' }
      }
    );

    expect(response).toBe(null);
    getVisitorLogMock.restore();
    sendToVisitorLogMock.restore();
  });

  mock.restore();
});

describe('rest', () => {
  test('widgetsSaveCustomerGetNotified', async () => {
    let customer = await customerFactory({});

    customer = await widgetMutations.widgetsSaveCustomerGetNotified(
      {},
      {
        customerId: customer._id,
        type: 'email',
        value: 'email'
      }
    );

    expect(
      customer.visitorContactInfo && customer.visitorContactInfo.email
    ).toBe('email');
  });

  test('widgetsSaveCustomerGetNotified without customerId', async () => {
    const mock = sinon.stub(logUtils, 'getVisitorLog').callsFake(() => {
      return Promise.resolve({
        visitorId: '123',
        _id: '1245'
      });
    });

    const logUtilsMock = sinon
      .stub(logUtils, 'sendToVisitorLog')
      .callsFake(() => {
        return Promise.resolve('ok');
      });

    const customer = await widgetMutations.widgetsSaveCustomerGetNotified(
      {},
      {
        visitorId: '123',
        customerId: '',
        type: 'email',
        value: 'email'
      }
    );

    expect(
      customer.visitorContactInfo && customer.visitorContactInfo.email
    ).toBe('email');

    logUtilsMock.restore();
    mock.restore();
  });

  test('widgetsSendTypingInfo', async () => {
    const conversation = await conversationFactory({});

    const response = await widgetMutations.widgetsSendTypingInfo(
      {},
      {
        conversationId: conversation._id
      }
    );

    expect(response).toBe('ok');
  });

  test('widgetsReadConversationMessages', async () => {
    const user = await userFactory({});
    const conversation = await conversationFactory({});

    const message = await conversationMessageFactory({
      conversationId: conversation._id,
      userId: user._id,
      isCustomerRead: false
    });

    expect(message.isCustomerRead).toBe(false);

    await widgetMutations.widgetsReadConversationMessages(
      {},
      {
        conversationId: conversation._id
      }
    );

    const updatedMessage = await ConversationMessages.findOne({
      _id: message._id
    });

    expect(updatedMessage && updatedMessage.isCustomerRead).toBe(true);
  });

  test('getMessengerData', async () => {
    const integration = await integrationFactory({
      languageCode: 'en',
      messengerData: {
        messages: {
          en: {
            welcome: 'welcome'
          }
        }
      }
    });

    const response = await getMessengerData(integration);

    expect(response.messages && response.messages.welcome).toBe('welcome');
  });
});

describe('knowledgebase', () => {
  test('widgetsKnowledgebaseIncReactionCount', async () => {
    const article = await knowledgeBaseArticleFactory({
      reactionChoices: ['wow']
    });

    await widgetMutations.widgetsKnowledgebaseIncReactionCount(
      {},
      {
        articleId: article._id,
        reactionChoice: 'wow'
      }
    );

    const updatedArticle = await KnowledgeBaseArticles.findOne({
      _id: article._id
    });

    expect(
      updatedArticle &&
        updatedArticle.reactionCounts &&
        updatedArticle.reactionCounts.wow
    ).toBe(1);
  });
});

describe('lead', () => {
  afterEach(async () => {
    // Clearing test data
    await Integrations.deleteMany({});
    await Customers.deleteMany({});
    await Conversations.deleteMany({});
    await ConversationMessages.deleteMany({});
    await FormSubmissions.deleteMany({});
  });

  test('widgetsLeadIncreaseViewCount', async () => {
    const form = await formFactory({});
    const integration = await integrationFactory({ formId: form._id });

    await widgetMutations.widgetsLeadIncreaseViewCount(
      {},
      {
        formId: form._id
      }
    );

    const updatedInteg = await Integrations.findOne({ _id: integration._id });

    expect(
      updatedInteg && updatedInteg.leadData && updatedInteg.leadData.viewCount
    ).toBe(1);
  });

  test('leadConnect: not found', async () => {
    // invalid configuration
    try {
      await widgetMutations.widgetsLeadConnect(
        {},
        {
          brandCode: 'code',
          formCode: 'code'
        }
      );
    } catch (e) {
      expect(e.message).toBe('Invalid configuration');
    }

    const brand = await brandFactory({});
    const form = await formFactory({});

    try {
      await widgetMutations.widgetsLeadConnect(
        {},
        {
          brandCode: brand.code || '',
          formCode: form.code || ''
        }
      );
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }
  });

  test('leadConnect: success', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const brand = await brandFactory({});
    const form = await formFactory({});

    const integration = await integrationFactory({
      brandId: brand._id,
      formId: form._id,
      leadData: {
        loadType: 'embedded'
      }
    });

    const response1 = await widgetMutations.widgetsLeadConnect(
      {},
      {
        brandCode: brand.code || '',
        formCode: form.code || ''
      }
    );

    expect(response1 && response1.integration._id).toBe(integration._id);
    expect(response1 && response1.form._id).toBe(form._id);

    const response = await widgetMutations.widgetsLeadConnect(
      {},
      {
        brandCode: brand.code || '',
        formCode: form.code || ''
      }
    );

    expect(response && response.integration._id).toBe(integration._id);
    expect(response && response.form._id).toBe(form._id);

    mock.restore();
  });

  test('leadConnect: Already filled', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const brand = await brandFactory({});
    const form = await formFactory({});

    const integration = await integrationFactory({
      brandId: brand._id,
      formId: form._id,
      leadData: {
        loadType: 'embedded',
        isRequireOnce: true
      }
    });

    const conversation = await conversationFactory({
      customerId: '123123',
      integrationId: integration._id
    });

    const response = await widgetMutations.widgetsLeadConnect(
      {},
      {
        brandCode: brand.code || '',
        formCode: form.code || '',
        cachedCustomerId: '123123'
      }
    );

    expect(conversation).toBeDefined();
    expect(response).toBeNull();

    mock.restore();
  });

  test('saveLead: form not found', async () => {
    try {
      await widgetMutations.widgetsSaveLead(
        {},
        {
          integrationId: '_id',
          formId: '_id',
          submissions: [{ _id: 'id', value: null }],
          browserInfo: {}
        }
      );
    } catch (e) {
      expect(e.message).toBe('Form not found');
    }
  });

  test('saveLead: invalid', async () => {
    const form = await formFactory({});

    const requiredField = await fieldFactory({
      contentTypeId: form._id,
      isRequired: true
    });

    const integration = await integrationFactory({ formId: form._id });

    const response = await widgetMutations.widgetsSaveLead(
      {},
      {
        integrationId: integration._id,
        formId: form._id,
        submissions: [{ _id: requiredField._id, value: null }],
        browserInfo: {
          currentPageUrl: '/page'
        }
      }
    );

    expect(response && response.status).toBe('error');
  });

  test('saveLead: without company', async () => {
    const form = await formFactory({});
    const fieldsGroup = await fieldGroupFactory({ contentType: 'company' });
    if (!fieldsGroup) {
      fail('fieldsGroup not found');
    }

    const firstNameField = await fieldFactory({
      type: 'firstName',
      contentTypeId: form._id,
      validation: 'text',
      isRequired: true
    });

    const customProperty = await fieldFactory({
      type: 'input',
      validation: 'number',
      isVisible: true,
      contentType: 'company',
      groupId: fieldsGroup._id
    });

    const inputField = await fieldFactory({
      type: customProperty.type,
      validation: customProperty.validation,
      contentTypeId: form._id,
      contentType: 'form',
      associatedFieldId: customProperty._id
    });

    const pronounField = await fieldFactory({
      type: 'pronoun'
    });

    const integration = await integrationFactory({ formId: form._id });

    const response = await widgetMutations.widgetsSaveLead(
      {},
      {
        integrationId: integration._id,
        formId: form._id,
        submissions: [
          { _id: firstNameField._id, value: 'name' },
          {
            _id: inputField._id,
            type: 'input',
            value: 1,
            associatedFieldId: inputField.associatedFieldId
          },
          {
            _id: inputField._id,
            type: 'input',
            value: 1,
            associatedFieldId: 'fake'
          },
          { _id: pronounField._id, type: 'pronoun', value: '' }
        ],
        browserInfo: {
          currentPageUrl: '/page'
        }
      }
    );

    expect(response && response.status).toBe('ok');
  });

  test('saveLead: success', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const form = await formFactory({});

    const group = await fieldGroupFactory({ contentType: 'form' });

    const params = {
      validation: 'text',
      isRequired: true,
      contentTypeId: form._id
    };

    const emailField = await fieldFactory({
      ...params,
      type: 'email',
      groupId: (group && group._id) || ''
    });

    const companyEmailField = await fieldFactory({
      ...params,
      type: 'companyEmail',
      groupId: (group && group._id) || ''
    });

    const firstNameField = await fieldFactory({
      ...params,
      type: 'firstName',
      groupId: (group && group._id) || ''
    });

    const lastNameField = await fieldFactory({
      ...params,
      type: 'lastName'
    });

    const phoneField = await fieldFactory({
      type: 'phone',
      contentTypeId: form._id,
      isRequired: true
    });

    const companyPhoneField = await fieldFactory({
      type: 'companyPhone',
      contentTypeId: form._id,
      isRequired: true
    });

    const checkField = await fieldFactory({
      type: 'check',
      contentTypeId: form._id,
      validation: 'text',
      options: ['check1', 'check2']
    });

    const radioField = await fieldFactory({
      type: 'radio',
      contentTypeId: form._id,
      validation: 'text',
      options: ['radio1', 'radio2']
    });

    const customProperty = await fieldFactory({
      type: 'input',
      validation: 'number',
      isVisible: true,
      contentType: 'customer'
    });

    const inputField = await fieldFactory({
      type: customProperty.type,
      validation: customProperty.validation,
      contentTypeId: form._id,
      contentType: 'form',
      associatedFieldId: customProperty._id
    });

    const companyNameField = await fieldFactory({
      ...params,
      type: 'companyName'
    });

    const companyNameField2 = await fieldFactory({
      ...params,
      type: 'companyName',
      groupId: (group && group._id) || ''
    });

    const avatarField = await fieldFactory({
      ...params,
      type: 'avatar'
    });

    const companyAvatarField = await fieldFactory({
      ...params,
      type: 'companyAvatar'
    });

    const industryField = await fieldFactory({
      ...params,
      type: 'industry'
    });

    const sizeField = await fieldFactory({
      type: 'size',
      contentTypeId: form._id,
      isRequired: true
    });

    const businessTypeField = await fieldFactory({
      ...params,
      type: 'businessType'
    });

    const pronounField = await fieldFactory({
      ...params,
      type: 'pronoun'
    });

    const pronounField1 = await fieldFactory({
      ...params,
      type: 'pronoun'
    });

    const pronounField2 = await fieldFactory({
      ...params,
      type: 'pronoun'
    });

    const doNotDisturbField = await fieldFactory({
      ...params,
      type: 'doNotDisturb'
    });

    const hasAuthorityField = await fieldFactory({
      ...params,
      type: 'hasAuthority'
    });

    const birthDateField = await fieldFactory({
      ...params,
      type: 'birthDate'
    });

    const descriptionField = await fieldFactory({
      ...params,
      type: 'description'
    });

    const departmentField = await fieldFactory({
      ...params,
      type: 'department'
    });

    const positionField = await fieldFactory({
      ...params,
      type: 'position'
    });

    const companyDescriptionField = await fieldFactory({
      ...params,
      type: 'companyDescription'
    });

    const companyDoNotDisturbField = await fieldFactory({
      ...params,
      type: 'companyDoNotDisturb'
    });

    const integration = await integrationFactory({ formId: form._id });

    const response = await widgetMutations.widgetsSaveLead(
      {},
      {
        integrationId: integration._id,
        formId: form._id,
        submissions: [
          {
            _id: emailField._id,
            type: 'email',
            value: 'email@yahoo.com',
            groupId: (group && group._id) || ''
          },
          {
            _id: firstNameField._id,
            type: 'firstName',
            value: 'firstName',
            groupId: (group && group._id) || ''
          },
          { _id: lastNameField._id, type: 'lastName', value: 'lastName' },
          { _id: phoneField._id, type: 'phone', value: '+88998833' },
          { _id: radioField._id, type: 'radio', value: 'radio2' },
          { _id: checkField._id, type: 'check', value: 'check1, check2' },
          {
            _id: inputField._id,
            type: 'input',
            value: 1,
            associatedFieldId: inputField.associatedFieldId
          },
          { _id: companyNameField._id, type: 'companyName', value: 'company' },
          {
            _id: companyNameField2._id,
            type: 'companyName',
            value: 'com',
            groupId: (group && group._id) || ''
          },
          {
            _id: companyEmailField._id,
            type: 'companyEmail',
            value: 'info@company.com'
          },
          {
            _id: companyPhoneField._id,
            type: 'companyPhone',
            value: '+99112233'
          },
          {
            _id: avatarField._id,
            type: 'avatar',
            value: [{ url: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' }]
          },
          {
            _id: companyAvatarField._id,
            type: 'companyAvatar',
            value: [{ url: 'https://i.pravatar.cc/150?img=63' }]
          },
          { _id: industryField._id, type: 'industry', value: 'Banks' },
          { _id: sizeField._id, type: 'size', value: '10' },
          {
            _id: businessTypeField._id,
            type: 'businessType',
            value: 'Investor'
          },
          { _id: pronounField._id, type: 'pronoun', value: 'Male' },
          { _id: pronounField1._id, type: 'pronoun', value: 'Female' },
          { _id: pronounField2._id, type: 'pronoun', value: 'Not applicable' },
          { _id: doNotDisturbField._id, type: 'doNotDisturb', value: 'No' },
          { _id: hasAuthorityField._id, type: 'hasAuthority', value: 'No' },
          {
            _id: birthDateField._id,
            type: 'birthDate',
            value: 'Fri Mar 26 2021 18:01:50 GMT+0800'
          },
          {
            _id: descriptionField._id,
            type: 'description',
            value: 'description'
          },
          { _id: departmentField._id, type: 'department', value: 'department' },
          { _id: positionField._id, type: 'position', value: 'position' },
          {
            _id: companyDescriptionField._id,
            type: 'companyDescription',
            value: 'companyDescription'
          },
          {
            _id: companyDoNotDisturbField._id,
            type: 'companyDoNotDisturb',
            value: 'Yes'
          }
        ],
        browserInfo: {
          currentPageUrl: '/page'
        }
      }
    );

    expect(response && response.status).toBe('ok');

    expect(await Conversations.find().countDocuments()).toBe(1);
    expect(await ConversationMessages.find().countDocuments()).toBe(1);
    expect(await Customers.find().countDocuments()).toBe(2);
    expect(await FormSubmissions.find().countDocuments()).toBe(1);

    const message = await ConversationMessages.findOne();
    const formData = message ? message.formWidgetData : {};

    if (!message || !formData) {
      throw new Error('Message not found');
    }

    expect(formData[0].value).toBe('email@yahoo.com');
    expect(formData[1].value).toBe('firstName');
    expect(formData[2].value).toBe('lastName');
    expect(formData[3].value).toBe('+88998833');
    expect(formData[4].value).toBe('radio2');
    expect(formData[5].value).toBe('check1, check2');
    mock.restore();
  });

  test('widgetsSendEmail', async () => {
    const customer = await customerFactory({});
    const form = await formFactory({});
    const integration = await integrationFactory({});

    const mock = sinon.stub(elk, 'fetchElk').callsFake(() => {
      return Promise.resolve({
        hits: {
          hits: [{ _id: integration._id, _source: { name: integration.name } }]
        }
      });
    });

    const emailParams = {
      toEmails: ['test-mail@gmail.com'],
      fromEmail: 'admin@erxes.io',
      title: 'Thank you for submitting.',
      content: 'We have received your request',
      customerId: customer._id,
      formId: form._id
    };

    const response = await widgetMutations.widgetsSendEmail(
      {},
      { ...emailParams }
    );

    expect(response).toBe(undefined);
    mock.restore();
  });
});
