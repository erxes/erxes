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
import { googleUtils } from '../trackers/googleTracker';
import { socUtils } from '../trackers/twitterTracker';

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
    _user = await userFactory({ role: 'admin' });
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
    expect.assertions(3);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(accountMutations.accountsRemove);
    expectError(accountMutations.accountsAddTwitter);
    expectError(accountMutations.accountsAddGmail);
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

  test('accountsAddGmail', async () => {
    const mutationQuery = `
      mutation accountsAddGmail($code: String!) {
        accountsAddGmail(code: $code){
          id
        }
      }
    `;
    const params = {
      access_token: 'access_token',
      refresh_token: 'refresh_token',
      expiry_date: 'expiry_date',
      scope: 'scope',
    };
    const emailAddress = 'test@gmail.com';

    const getAccessToken = jest.spyOn(googleUtils, 'getAccessToken');
    getAccessToken.mockImplementation(() => params);

    const getGmailUserProfile = jest.spyOn(utils, 'getGmailUserProfile');
    const result = { data: { emailAddress: 'test@gmail.com' } };
    getGmailUserProfile.mockImplementation(() => result);

    const { id } = await graphqlRequest(mutationQuery, 'accountsAddGmail', { code: 'code' }, context);

    expect(getAccessToken.mock.calls.length).toBe(1);
    expect(getGmailUserProfile.mock.calls.length).toBe(1);

    const newAccount = await Accounts.findOne({ _id: id });

    if (!newAccount) {
      throw new Error('Account does not exists');
    }

    expect(newAccount).toBeDefined();
    expect(newAccount.uid).toBe(emailAddress);
    expect(newAccount.name).toBe(emailAddress);
    expect(newAccount.kind).toBe('gmail');
    expect(newAccount.token).toBe(params.access_token);
    expect(newAccount.tokenSecret).toBe(params.refresh_token);
    expect(newAccount.expireDate).toBe(params.expiry_date);
    expect(newAccount.scope).toBe(params.scope);
  });

  test('accountsAddTwitter', async () => {
    const mutationQuery = `
      mutation accountsAddTwitter($queryParams: TwitterIntegrationAuthParams) {
        accountsAddTwitter(queryParams: $queryParams){
          id
          name
          kind
        }
      }
    `;

    const params = {
      tokens: {
        auth: {
          token: 'token',
          token_secret: 'token_secret',
        },
      },
      info: {
        name: 'name',
        id: 'id',
      },
    };

    const authenticate = jest.spyOn(socUtils, 'authenticate');
    authenticate.mockImplementation(() => params);

    const { id } = await graphqlRequest(mutationQuery, 'accountsAddTwitter', {}, context);

    expect(authenticate.mock.calls.length).toBe(1);

    const newAccount = await Accounts.findOne({ _id: id });

    if (!newAccount) {
      throw new Error('Account does not exists');
    }

    expect(newAccount).toBeDefined();
    expect(newAccount.uid).toBe(params.info.id);
    expect(newAccount.name).toBe(params.info.name);
    expect(newAccount.kind).toBe('twitter');
    expect(newAccount.token).toBe(params.tokens.auth.token);
    expect(newAccount.tokenSecret).toBe(params.tokens.auth.token_secret);
  });
});
