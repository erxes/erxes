import * as sinon from 'sinon';
import {
  ConversationMessages,
  Conversations,
  Customers
} from '../facebook/models';
import {
  accountFactory,
  facebookConversationFactory,
  facebookConversationMessagFactory,
  facebookCustomerFactory,
  integrationFactory,
  nylasGmailConversationFactory,
  nylasGmailConversationMessageFactory,
  nylasGmailCustomerFactory
} from '../factories';
import * as gmailApi from '../gmail/api';
import { removeAccount, removeIntegration } from '../helpers';
import { Accounts, Integrations } from '../models';
import * as nylasApi from '../nylas/api';
import {
  NylasGmailConversationMessages,
  NylasGmailConversations,
  NylasGmailCustomers
} from '../nylas/models';
import './setup.ts';

describe('Facebook remove integration test', async () => {
  let integrationId1: string;
  let erxesApiId1: string;
  let erxesApiId2: string;
  let accountId: string;

  beforeEach(async () => {
    const account = await accountFactory({ kind: 'facebook' });

    const integration1 = await integrationFactory({
      kind: 'facebook',
      accountId: account._id,
      erxesApiId: 'jaskjda'
    });

    const integration2 = await integrationFactory({
      kind: 'facebook',
      accountId: account._id,
      erxesApiId: 'asljkdas'
    });

    accountId = account._id;
    erxesApiId1 = integration1.erxesApiId;
    erxesApiId2 = integration2.erxesApiId;
    integrationId1 = integration1._id;
  });

  afterEach(async () => {
    await Integrations.remove({});
    await Accounts.remove({});

    // entries
    await Conversations.remove({});
    await ConversationMessages.remove({});
    await Customers.remove({});
  });

  const entryFactory = async userId => {
    const customer = await facebookCustomerFactory({ userId });
    const conversation = await facebookConversationFactory({
      senderId: '_id',
      recipientId: 'pageId'
    });
    const message = await facebookConversationMessagFactory({
      conversationId: conversation._id
    });

    return {
      customerId: customer._id,
      conversationId: conversation._id,
      messageId: message._id
    };
  };

  test('Remove facebook by accountId', async () => {
    const { customerId, conversationId, messageId } = await entryFactory(
      'asdkalsjd'
    );

    const erxesApiIds = await removeAccount(accountId);

    // Remove integration
    expect(erxesApiIds).toEqual({ erxesApiIds: [erxesApiId1, erxesApiId2] });

    expect(await Integrations.find({ kind: 'facebook' })).toEqual([]);

    // Remove entries
    expect(await Conversations.findOne({ _id: customerId })).toBe(null);
    expect(await ConversationMessages.findOne({ _id: conversationId })).toBe(
      null
    );
    expect(await Customers.findOne({ _id: messageId })).toBe(null);
  });

  test('Remove facebook integartion by integartionId', async () => {
    const { customerId, conversationId, messageId } = await entryFactory(
      'wejlk123j'
    );

    expect(
      await Conversations.findOne({ _id: conversationId }).count()
    ).toEqual(1);
    expect(
      await ConversationMessages.findOne({ _id: messageId }).count()
    ).toEqual(1);
    expect(await Customers.findOne({ _id: customerId }).count()).toEqual(1);

    const erxesApiId = await removeIntegration(erxesApiId1);

    // Remove integration
    expect(erxesApiId).toEqual(erxesApiId1);
    expect(await Integrations.findOne({ _id: integrationId1 })).toBe(null);

    // Remove entries
    expect(await Conversations.findOne({ _id: customerId })).toBe(null);
    expect(await ConversationMessages.findOne({ _id: conversationId })).toBe(
      null
    );
    expect(await Customers.findOne({ _id: messageId })).toBe(null);
  });
});

describe('Nylas remove integration test', () => {
  let integrationId: string;
  let erxesApiId: string;

  beforeEach(async () => {
    const doc = { kind: 'gmail', email: 'user@mail.com' };

    const integration = await integrationFactory({
      ...doc,
      googleAccessToken: 'googleAccessToken',
      nylasAccountId: 'nylasAccountId',
      nylasToken: 'nylasToken',
      erxesApiId: 'alkjdlkj'
    });

    integrationId = integration._id;
    erxesApiId = integration.erxesApiId;
  });

  afterEach(async () => {
    await Integrations.remove({});

    // Entries
    await NylasGmailCustomers.remove({});
    await NylasGmailConversations.remove({});
    await NylasGmailConversationMessages.remove({});
  });

  const entryFactory = async email => {
    const customer = await nylasGmailCustomerFactory({
      email,
      integrationId
    });

    const conversation = await nylasGmailConversationFactory({
      customerId: customer._id,
      integrationId
    });

    const message = await nylasGmailConversationMessageFactory({
      conversationId: conversation._id,
      messageId: '123'
    });

    return {
      customerId: customer._id,
      conversationId: conversation._id,
      messageId: message._id
    };
  };

  test('Remove nylas-gmail integration by [erxesApiId]', async () => {
    const { customerId, conversationId, messageId } = await entryFactory(
      'foo@mail.com'
    );

    const mock1 = sinon.stub(nylasApi, 'enableOrDisableAccount').callsFake();
    const mock2 = sinon.stub(gmailApi, 'revokeToken').callsFake();

    const integrationErxesApiId = await removeIntegration(erxesApiId);

    // Remove integration
    expect(integrationErxesApiId).toEqual(erxesApiId);
    expect(await Integrations.findOne({ kind: 'gmail' })).toBe(null);

    // Remove entries
    expect(await NylasGmailCustomers.findOne({ _id: customerId })).toBe(null);
    expect(await NylasGmailConversations.findOne({ _id: conversationId })).toBe(
      null
    );
    expect(
      await NylasGmailConversationMessages.findOne({ _id: messageId })
    ).toBe(null);

    mock1.restore();
    mock2.restore();
  });
});
