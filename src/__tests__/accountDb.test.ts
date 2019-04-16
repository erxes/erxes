import {
  accountFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  integrationFactory,
} from '../db/factories';
import { Accounts, ConversationMessages, Conversations, Integrations } from '../db/models';

describe('Account db test', () => {
  let _account;
  let _customer;
  let _integration;

  beforeEach(async () => {
    // Creating test data
    _account = await accountFactory({
      kind: 'gmail',
    });
    _integration = await integrationFactory({
      kind: 'gmail',
      gmailData: {
        accountId: _account._id,
        email: 'erkhet@nmma.co',
        expiration: '1547701961664',
        historyId: '11055',
      },
    });
    _customer = await customerFactory({
      integrationId: _integration._id,
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Accounts.deleteMany({});
  });

  test('Delete account', async () => {
    const conv = await conversationFactory({
      integrationId: _integration._id,
      customerId: _customer._id,
      content: 'content',
      gmailData: {
        messageId: `1683d006f6d5521e`,
      },
      messageCount: 1,
      number: 1,
    });

    await conversationMessageFactory({
      conversationId: conv._id,
      customerId: _customer._id,
      content: 'content',
      gmailData: {
        labelIds: ['IMPORTANT', 'TRASH', 'CATEGORY_PERSONAL'],
        messageId: `1683d006f6d5521e`,
        subject: 'subject',
        from: 'munkhbold dembel <munkhbold.de@gmail.com>',
        to: 'munkhbold.d@nmtec.co',
        headerId: '<D09CE1A0-3610-4A2E-8270-C86F5126115A@gmail.com>',
        threadId: '1683d006f6d5521e',
        textPlain: 'this is a test\r\n',
        attachments: [],
      },
    });

    await Accounts.removeAccount(_account.id);

    expect(await Accounts.findOne({ _id: _account.id }).countDocuments()).toBe(0);
    expect(await ConversationMessages.find({}).countDocuments()).toBe(0);
    expect(await Conversations.findOne({ integrationId: _integration.id }).countDocuments()).toBe(0);
    expect(await Integrations.findOne({ 'gmailData.accountId': _account.id }).countDocuments()).toBe(0);
  });
});
