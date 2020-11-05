import * as faker from 'faker';
import * as Random from 'meteor-random';
import * as sinon from 'sinon';
import widgetMutations, {
  getMessengerData
} from '../data/resolvers/mutations/widgets';
import * as utils from '../data/utils';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  engageMessageFactory,
  fieldFactory,
  formFactory,
  integrationFactory,
  knowledgeBaseArticleFactory,
  messengerAppFactory,
  userFactory
} from '../db/factories';
import {
  Brands,
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
  MESSAGE_TYPES
} from '../db/models/definitions/constants';
import { ICustomerDocument } from '../db/models/definitions/customers';
import { IIntegrationDocument } from '../db/models/definitions/integrations';
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
      expect(e.message).toBe('Brand not found');
    }
  });

  test('brand not found', async () => {
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
      }
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
      }
    );

    expect(message.content).toBe('withConversationId');
  });

  test('Widget bot message with conversationId', async () => {
    const conversation = await conversationFactory({
      operatorStatus: CONVERSATION_OPERATOR_STATUS.BOT
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
      }
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
      }
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
    const mock = sinon.stub(utils, 'sendRequest').returns(Promise.resolve({
      responses: [
        {
          type: 'text',
          text: 'Greeting bot message'
        }
      ]
    }));

    const conversationId = await widgetMutations.widgetGetBotInitialMessage(
      {},
      {
        integrationId: _integrationBot._id,
        customerId: _customer._id,
      }
    );

    const message = await ConversationMessages.findOne({ conversationId });

    if (message) {
      expect(message.botData[0].text).toBe('Greeting bot message');
    } else {
      fail('Failed to create bot initial message');
    }

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

    sendRequestMock.restore();
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
      kind: 'visitorAuto',
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

    expect(response && response.content).toBe('engageMessage');
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

  test('saveLead: success', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const form = await formFactory({});

    const emailField = await fieldFactory({
      type: 'email',
      contentTypeId: form._id,
      validation: 'text',
      isRequired: true
    });

    const firstNameField = await fieldFactory({
      type: 'firstName',
      contentTypeId: form._id,
      validation: 'text',
      isRequired: true
    });

    const lastNameField = await fieldFactory({
      type: 'lastName',
      contentTypeId: form._id,
      validation: 'text',
      isRequired: true
    });

    const phoneField = await fieldFactory({
      type: 'phone',
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

    const integration = await integrationFactory({ formId: form._id });

    const response = await widgetMutations.widgetsSaveLead(
      {},
      {
        integrationId: integration._id,
        formId: form._id,
        submissions: [
          { _id: emailField._id, type: 'email', value: 'email@yahoo.com' },
          { _id: firstNameField._id, type: 'firstName', value: 'firstName' },
          { _id: lastNameField._id, type: 'lastName', value: 'lastName' },
          { _id: phoneField._id, type: 'phone', value: '+88998833' },
          { _id: radioField._id, type: 'radio', value: 'radio2' },
          { _id: checkField._id, type: 'check', value: 'check1, check2' }
        ],
        browserInfo: {
          currentPageUrl: '/page'
        }
      }
    );

    expect(response && response.status).toBe('ok');

    expect(await Conversations.find().countDocuments()).toBe(1);
    expect(await ConversationMessages.find().countDocuments()).toBe(1);
    expect(await Customers.find().countDocuments()).toBe(1);
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
    const emailParams = {
      toEmails: ['test-mail@gmail.com'],
      fromEmail: 'admin@erxes.io',
      title: 'Thank you for submitting.',
      content: 'We have received your request'
    };

    const spyEmail = jest.spyOn(widgetMutations, 'widgetsSendEmail');

    const mutation = `
      mutation widgetsSendEmail($toEmails: [String], $fromEmail: String, $title: String, $content: String) {
        widgetsSendEmail(toEmails: $toEmails, fromEmail: $fromEmail, title: $title, content: $content)
      }
    `;

    spyEmail.mockImplementation(() => Promise.resolve());

    const response = await graphqlRequest(
      mutation,
      'widgetsSendEmail',
      emailParams
    );

    expect(response).toBe(null);

    spyEmail.mockRestore();
  });
});
