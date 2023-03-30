import * as sinon from 'sinon';

import {
  integrationFactory,
  nylasGmailConversationFactory,
  nylasGmailConversationMessageFactory,
  nylasGmailCustomerFactory
} from '../factories';
import * as gmailApi from '../gmail/api';
import { removeIntegration } from '../helpers';
import { Integrations } from '../models';
import * as nylasApi from '../nylas/api';
import {
  NylasGmailConversationMessages,
  NylasGmailConversations,
  NylasGmailCustomers
} from '../nylas/models';
import './setup.ts';

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
