import './setup.ts';

import * as sinon from 'sinon';

import { isMessengerOnline } from '../data/resolvers/queries/widgets';
import * as utils from '../data/utils';
import { graphqlRequest } from '../db/connection';
import {
  brandFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  integrationFactory,
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
  userFactory
} from '../db/factories';
import { Brands, Conversations, Customers, Integrations } from '../db/models';

describe('widgetQueries', () => {
  const widgetsGetEngageMessageQuery = `query widgetsGetEngageMessage($integrationId: String, $customerId: String!, $browserInfo: JSON!) {
    widgetsGetEngageMessage(integrationId: $integrationId, customerId: $customerId, browserInfo: $browserInfo) {
      _id
      engageData {
        messageId
      }
    }
  }`;

  afterEach(async () => {
    // Clearing test data
    await Conversations.deleteMany({});
    await Customers.deleteMany({});
    await Integrations.deleteMany({});
    await Brands.deleteMany({});
  });

  test('Conversations', async () => {
    // Creating test data
    const integration = await integrationFactory({});
    const customer = await customerFactory({ integrationId: integration._id });

    await conversationFactory({ integrationId: integration._id });
    await conversationFactory({
      customerId: customer._id,
      integrationId: integration._id
    });
    await conversationFactory({
      customerId: customer._id,
      integrationId: integration._id
    });

    const qry = `
      query widgetsConversations($integrationId: String!, $customerId: String!) {
        widgetsConversations(integrationId: $integrationId, customerId: $customerId) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'widgetsConversations', {
      integrationId: integration._id,
      customerId: customer._id
    });

    expect(response.length).toBe(2);
  });

  test('Conversation detail', async () => {
    // Creating test data
    const user = await userFactory({});

    const integration = await integrationFactory({
      kind: 'messenger',
      messengerData: { supporterIds: [user._id] }
    });

    const conversation = await conversationFactory({
      integrationId: integration._id
    });

    const qry = `
      query widgetsConversationDetail($_id: String, $integrationId: String!) {
        widgetsConversationDetail(_id: $_id, integrationId: $integrationId) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'widgetsConversationDetail', {
      _id: '_id',
      integrationId: '_id '
    });
    expect(response).toBe(null);

    response = await graphqlRequest(qry, 'widgetsConversationDetail', {
      _id: conversation._id,
      integrationId: '_id '
    });
    expect(response).toBe(null);

    response = await graphqlRequest(qry, 'widgetsConversationDetail', {
      _id: '_id',
      integrationId: conversation.integrationId
    });
    expect(response).not.toBeNull();

    response = await graphqlRequest(qry, 'widgetsConversationDetail', {
      _id: conversation._id,
      integrationId: conversation.integrationId
    });

    expect(response._id).toBe(conversation._id);
  });

  test('getMessengerIntegration', async () => {
    // Creating test data
    const brand = await brandFactory({});
    const integration = await integrationFactory({
      kind: 'messenger',
      brandId: brand._id
    });

    const qry = `
      query widgetsGetMessengerIntegration($brandCode: String!) {
        widgetsGetMessengerIntegration(brandCode: $brandCode) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(
      qry,
      'widgetsGetMessengerIntegration',
      {
        brandCode: brand.code
      }
    );

    expect(response._id).toBe(integration._id);
  });

  test('widgetsMessengerSupporters', async () => {
    // Creating test data
    const user = await userFactory({});

    const integration = await integrationFactory({
      kind: 'messenger',
      messengerData: { supporterIds: [user._id] }
    });

    const qry = `
      query widgetsMessengerSupporters($integrationId: String!) {
        widgetsMessengerSupporters(integrationId: $integrationId) {
          supporters {
            _id
          }
          isOnline
          serverTime
        }
      }
    `;

    try {
      await graphqlRequest(qry, 'widgetsMessengerSupporters', {
        integrationId: '_id'
      });
    } catch (e) {
      expect(e[0].message).toBe('Integration not found');
    }

    const response = await graphqlRequest(qry, 'widgetsMessengerSupporters', {
      integrationId: integration._id
    });

    expect(response.supporters.length).toBe(1);
  });

  test('widgetsTotalUnreadCount', async () => {
    // Creating test data
    const user = await userFactory({});
    const integration = await integrationFactory({ kind: 'messenger' });
    const customer = await customerFactory({});

    const conv1 = await conversationFactory({
      integrationId: integration._id,
      customerId: customer._id
    });
    await conversationMessageFactory({
      conversationId: conv1._id,
      userId: user._id,
      isCustomerRead: true,
      internal: false
    });

    const conv2 = await conversationFactory({
      integrationId: integration._id,
      customerId: customer._id
    });
    await conversationMessageFactory({
      conversationId: conv2._id,
      userId: user._id,
      isCustomerRead: false,
      internal: false
    });

    const qry = `
      query widgetsTotalUnreadCount($integrationId: String!, $customerId: String) {
        widgetsTotalUnreadCount(integrationId: $integrationId, customerId: $customerId)
      }
    `;

    const response = await graphqlRequest(qry, 'widgetsTotalUnreadCount', {
      integrationId: integration._id,
      customerId: customer._id
    });

    expect(response).toBe(1);
  });

  test('widgetsTotalUnreadCount without customerId', async () => {
    // Creating test data
    const integration = await integrationFactory({ kind: 'messenger' });

    const qry = `
      query widgetsTotalUnreadCount($integrationId: String!, $customerId: String) {
        widgetsTotalUnreadCount(integrationId: $integrationId, customerId: $customerId)
      }
    `;

    const response = await graphqlRequest(qry, 'widgetsTotalUnreadCount', {
      integrationId: integration._id
    });

    expect(response).toBe(0);
  });

  test('widgetsUnreadCount', async () => {
    // Creating test data
    const user = await userFactory({});
    const integration = await integrationFactory({ kind: 'messenger' });
    const customer = await customerFactory({});

    const conv1 = await conversationFactory({
      integrationId: integration._id,
      customerId: customer._id
    });
    await conversationMessageFactory({
      conversationId: conv1._id,
      userId: user._id,
      isCustomerRead: false,
      internal: false
    });

    const qry = `
      query widgetsUnreadCount($conversationId: String!) {
        widgetsUnreadCount(conversationId: $conversationId)
      }
    `;

    const response = await graphqlRequest(qry, 'widgetsUnreadCount', {
      conversationId: conv1._id
    });

    expect(response).toBe(1);
  });

  test('widgetsMessages', async () => {
    // Creating test data
    const conv = await conversationFactory({});
    await conversationMessageFactory({
      conversationId: conv._id,
      internal: false
    });

    const qry = `
      query widgetsMessages($conversationId: String!) {
        widgetsMessages(conversationId: $conversationId) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'widgetsMessages', {
      conversationId: conv._id
    });

    expect(response.length).toBe(1);
  });

  test('widgetsKnowledgeBaseTopicDetail', async () => {
    const user = await userFactory({});
    const topic = await knowledgeBaseTopicFactory({ userId: user._id });

    const qry = `
      query widgetsKnowledgeBaseTopicDetail($_id: String!) {
        widgetsKnowledgeBaseTopicDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(
      qry,
      'widgetsKnowledgeBaseTopicDetail',
      { _id: topic._id }
    );

    expect(response._id).toBe(topic._id);
  });

  test('widgetsKnowledgeBaseArticles', async () => {
    // Creating test data
    const topic = await knowledgeBaseTopicFactory({});
    const category = await knowledgeBaseCategoryFactory({});

    await knowledgeBaseArticleFactory({
      categoryId: category._id,
      topicId: topic._id,
      status: 'publish'
    });

    const qry = `
      query widgetsKnowledgeBaseArticles($topicId: String!, $searchString: String) {
        widgetsKnowledgeBaseArticles(topicId: $topicId, searchString: $searchString) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'widgetsKnowledgeBaseArticles', {
      topicId: '_id'
    });
    expect(response.length).toBe(0);

    response = await graphqlRequest(qry, 'widgetsKnowledgeBaseArticles', {
      topicId: topic._id
    });

    expect(response.length).toBe(1);
  });

  test('isMessengerOnline', async () => {
    const integration = await integrationFactory({});

    const response = await isMessengerOnline(integration);

    expect(response).toBe(false);
  });

  test('widgetsGetEngageMessage', async () => {
    // Creating test data
    const mock = sinon.stub(utils, 'getEnv').callsFake(() => {
      return 'false';
    });

    const brand = await brandFactory({});
    const integration = await integrationFactory({ brandId: brand._id });
    const customer = await customerFactory({ integrationId: integration._id });

    const response = await graphqlRequest(
      widgetsGetEngageMessageQuery,
      'widgetsGetEngageMessage',
      {
        integrationId: integration._id,
        customerId: customer._id,
        browserInfo: {
          url: 'url',
          hostname: 'hostname'
        }
      }
    );

    expect(response).toBe(null);

    mock.restore();
  });

  test('widgetsGetEngageMessage integarion not found', async () => {
    const customer = await customerFactory({});

    try {
      await graphqlRequest(
        widgetsGetEngageMessageQuery,
        'widgetsGetEngageMessage',
        {
          customerId: customer._id,
          browserInfo: {
            url: 'url',
            hostname: 'hostname'
          }
        }
      );
    } catch (e) {
      expect(e[0].message).toBe('Integration not found');
    }
  });

  test('widgetsGetEngageMessage with elksyncer', async () => {
    const customer = await customerFactory({});

    const envMock = sinon.stub(utils, 'getEnv').callsFake(() => {
      return 'true';
    });

    try {
      await graphqlRequest(
        widgetsGetEngageMessageQuery,
        'widgetsGetEngageMessage',
        {
          customerId: customer._id,
          browserInfo: {
            url: 'url',
            hostname: 'hostname'
          }
        }
      );
    } catch (e) {
      expect(e[0].message).toBe('Integration not found');
    }

    envMock.restore();
  });
});
