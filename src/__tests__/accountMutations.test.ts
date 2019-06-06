import * as sinon from 'sinon';
import accountMutations from '../data/resolvers/mutations/accounts';
import { graphqlRequest } from '../db/connection';
import {
  accountFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  integrationFactory,
  userFactory,
} from '../db/factories';
import { Accounts, Brands, ConversationMessages, Conversations, Customers, Integrations, Users } from '../db/models';
import { utils } from '../trackers/gmailTracker';

import './setup.ts';

describe('Accounts mutations', () => {
  let _account;
  let _user;
  let _integration;
  let context;

  beforeEach(async () => {
    // Creating test data
    _account = await accountFactory({
      kind: 'gmail',
    });
    _user = await userFactory({});
    _integration = await integrationFactory({
      gmailData: {
        accountId: _account._id,
      },
    });

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Brands.deleteMany({});
    await Users.deleteMany({});
    await Integrations.deleteMany({});
  });

  test(`test if Error('Login required') exception is working as intended`, async () => {
    expect.assertions(1);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(accountMutations.accountsRemove);
  });

  test('Remove account mutation test', async () => {
    const mutationQuery = `
      mutation accountsRemove($_id: String!) {
        accountsRemove(_id: $_id)
      }
    `;

    const customer = await customerFactory({
      integrationId: _integration._id,
    });
    const conversation = await conversationFactory({
      integrationId: _integration._id,
      customerId: customer._id,
      content: 'content',
    });
    await conversationMessageFactory({
      conversationId: conversation._id,
      customerId: customer._id,
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
      },
    });

    try {
      await graphqlRequest(mutationQuery, 'accountsRemove', { _id: 'fakeId' }, context);
    } catch (e) {
      expect(e[0].message).toBe(`Account not found id with fakeId`);
    }

    const mock = sinon.stub(utils, 'stopReceivingEmail').callsFake();
    await graphqlRequest(mutationQuery, 'accountsRemove', { _id: _account._id }, context);
    mock.restore();

    expect(await Accounts.findOne({ _id: _account._id })).toBe(null);
    expect(await Integrations.findOne({ 'gmailData.accountId': _account._id })).toBe(null);
    expect(await Customers.findOne({ integrationId: _integration._id })).toBe(null);
    expect(await Conversations.findOne({ integrationId: _integration._id })).toBe(null);
    expect(await ConversationMessages.findOne({ conversationId: conversation._id })).toBe(null);
  });
});
