import * as faker from 'faker';
import * as sinon from 'sinon';
import * as utils from '../data/utils';
import { graphqlRequest } from '../db/connection';
import { accountFactory, brandFactory, integrationFactory, userFactory } from '../db/factories';
import { Brands, Integrations, Users } from '../db/models';
import * as facebookTracker from '../trackers/facebookTracker';
import { socUtils } from '../trackers/twitterTracker';

describe('mutations', () => {
  let _integration;
  let _brand;
  let _user;
  let context;

  const commonParamDefs = `
    $name: String!
    $brandId: String!
    $languageCode: String
  `;

  const commonParams = `
    name: $name
    brandId: $brandId
    languageCode: $languageCode
  `;

  const commonFormProperties = {
    languageCode: 'en',
    loadType: faker.random.word(),
    fromEmail: faker.internet.email(),
    userEmailTitle: faker.random.word(),
    userEmailContent: faker.random.word(),
    adminEmailTitle: faker.random.word(),
    adminEmailContent: faker.random.word(),
    redirectUrl: faker.random.word(),
    successAction: faker.random.word(),
    formData: {
      thankContent: faker.random.word(),
      adminEmails: [],
    },
  };

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({ role: 'admin' });
    _integration = await integrationFactory({});
    _brand = await brandFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('Create messenger integration', async () => {
    const args = {
      name: _integration.name,
      brandId: _brand._id,
      languageCode: 'en',
    };

    const mutation = `
      mutation integrationsCreateMessengerIntegration(${commonParamDefs}) {
        integrationsCreateMessengerIntegration(${commonParams}) {
          name
          brandId
          languageCode
        }
      }
    `;

    const integration = await graphqlRequest(mutation, 'integrationsCreateMessengerIntegration', args, context);

    expect(integration.name).toBe(args.name);
    expect(integration.brandId).toBe(args.brandId);
    expect(integration.languageCode).toBe(args.languageCode);
  });

  test('Edit messenger integration', async () => {
    const args = {
      _id: _integration._id,
      name: _integration.name,
      brandId: _brand._id,
      languageCode: 'en',
    };

    const mutation = `
      mutation integrationsEditMessengerIntegration(
        $_id: String!
        ${commonParamDefs}
      ) {
        integrationsEditMessengerIntegration(
        _id: $_id
        ${commonParams}
      ) {
          _id
          name
          brandId
          languageCode
        }
      }
    `;

    const integration = await graphqlRequest(mutation, 'integrationsEditMessengerIntegration', args, context);

    expect(integration._id).toBe(args._id);
    expect(integration.name).toBe(args.name);
    expect(integration.brandId).toBe(args.brandId);
    expect(integration.languageCode).toBe(args.languageCode);
  });

  test('Save messenger integration appearance data', async () => {
    const uiOptions = {
      color: faker.random.word(),
      wallpaper: faker.random.word(),
      logo: faker.random.image(),
    };

    const args = {
      _id: _integration._id,
      uiOptions,
    };

    const mutation = `
      mutation integrationsSaveMessengerAppearanceData(
        $_id: String!
        $uiOptions: MessengerUiOptions
      ) {
        integrationsSaveMessengerAppearanceData(_id: $_id, uiOptions: $uiOptions) {
          _id
          uiOptions
        }
      }
    `;

    const messengerAppearanceData = await graphqlRequest(
      mutation,
      'integrationsSaveMessengerAppearanceData',
      args,
      context,
    );

    expect(messengerAppearanceData._id).toBe(args._id);
    expect(messengerAppearanceData.uiOptions.toJSON()).toEqual(args.uiOptions);
  });

  test('Save messenger integration config', async () => {
    const messengerData = {
      supporterIds: [_user.id],
      notifyCustomer: false,
      isOnline: false,
      availabilityMethod: 'auto',
      requireAuth: false,
      onlineHours: [
        {
          day: faker.random.word(),
          from: faker.random.word(),
          to: faker.random.word(),
        },
      ],
      timezone: faker.random.word(),
      messages: {
        en: {
          welcome: faker.random.word(),
          away: faker.random.word(),
          thank: faker.random.word(),
        },
      },
    };

    const args = {
      _id: _integration._id,
      messengerData,
    };

    const mutation = `
      mutation integrationsSaveMessengerConfigs(
        $_id: String!
        $messengerData: IntegrationMessengerData
      ) {
        integrationsSaveMessengerConfigs(
          _id: $_id
          messengerData: $messengerData
        ) {
          _id
          messengerData
        }
      }
    `;

    const messengerConfig = await graphqlRequest(mutation, 'integrationsSaveMessengerConfigs', args, context);

    expect(messengerConfig._id).toBe(args._id);
    expect(messengerConfig.messengerData.toJSON()).toEqual(args.messengerData);
  });

  test('Create form integration', async () => {
    const args = {
      name: _integration.name,
      brandId: _brand._id,
      formId: _integration.formId,
      ...commonFormProperties,
    };

    const mutation = `
      mutation integrationsCreateFormIntegration(
        ${commonParamDefs}
        $formId: String!
        $formData: IntegrationFormData!
      ) {
        integrationsCreateFormIntegration(
          ${commonParams}
          formId: $formId
          formData: $formData
        ) {
          name
          brandId
          languageCode
          formId
          formData
        }
      }
    `;

    const formIntegration = await graphqlRequest(mutation, 'integrationsCreateFormIntegration', args, context);

    expect(formIntegration.name).toBe(args.name);
    expect(formIntegration.brandId).toBe(args.brandId);
    expect(formIntegration.languageCode).toBe(args.languageCode);
    expect(formIntegration.formId).toBe(args.formId);
    expect(formIntegration.formData.toJSON()).toEqual(args.formData);
  });

  test('Create twitter integration', async () => {
    const account = await accountFactory({});
    const args = {
      brandId: _brand._id,
      accountId: account._id,
    };

    const authenticateDoc = {
      info: {
        name: 'name',
        id: 1,
      },

      tokens: {
        auth: {
          token: 'token',
          tokenSecret: 'secret',
        },
      },
    };

    socUtils.authenticate = jest.fn(() => authenticateDoc);
    socUtils.trackIntegration = jest.fn();

    const mutation = `
      mutation integrationsCreateTwitterIntegration(
        $brandId: String!
        $accountId: String!
      ) {
        integrationsCreateTwitterIntegration(
          brandId: $brandId
          accountId: $accountId
        ) {
          brandId
          twitterData
        }
      }
    `;

    const twitterIntegration = await graphqlRequest(mutation, 'integrationsCreateTwitterIntegration', args, context);

    expect(twitterIntegration.brandId).toBe(args.brandId);
    expect(twitterIntegration.twitterData.accountId).toBe(account._id);
  });

  test('Create facebook integration', async () => {
    process.env.FACEBOOK_APP_ID = '123321';
    process.env.DOMAIN = 'qwqwe';
    process.env.INTEGRATION_ENDPOINT_URL = '';

    const account = await accountFactory({});
    const args = {
      brandId: _brand._id,
      name: _integration.name,
      accountId: account._id,
      pageIds: ['fakePageIds'],
    };

    sinon.stub(facebookTracker, 'getPageInfo').callsFake(() => {
      return { id: '456', access_token: '123' };
    });

    sinon.stub(facebookTracker, 'subscribePage').callsFake(() => {
      return { success: true };
    });

    sinon.stub(utils, 'sendPostRequest').callsFake(() => {
      return true;
    });

    const mutation = `
      mutation integrationsCreateFacebookIntegration(
        $brandId: String!
        $name: String!
        $accountId: String!
        $pageIds: [String!]!
      ) {
        integrationsCreateFacebookIntegration(
          brandId: $brandId
          name: $name
          accountId: $accountId
          pageIds: $pageIds
        ) {
          brandId
          name
          facebookData
        }
      }
    `;

    const facebookIntegration = await graphqlRequest(mutation, 'integrationsCreateFacebookIntegration', args, context);

    expect(facebookIntegration.brandId).toBe(args.brandId);
    expect(facebookIntegration.name).toBe(args.name);
    expect(facebookIntegration.facebookData.accountId).toBe(account._id);
    expect(facebookIntegration.facebookData.pageIds).toEqual(expect.arrayContaining(args.pageIds));
  });

  test('Edit form integration', async () => {
    const args = {
      _id: _integration._id,
      name: _integration.name,
      brandId: _brand._id,
      formId: _integration.formId,
      ...commonFormProperties,
    };

    const mutation = `
      mutation integrationsEditFormIntegration(
        $_id: String!
        $formId: String!
        $formData: IntegrationFormData!
        ${commonParamDefs}
      ) {
        integrationsEditFormIntegration(
          _id: $_id
          formId: $formId
          formData: $formData
          ${commonParams}
        ) {
          _id
          name
          brandId
          languageCode
          formId
          formData
        }
      }
    `;

    const formIntegration = await graphqlRequest(mutation, 'integrationsEditFormIntegration', args, context);

    expect(formIntegration._id).toBe(args._id);
    expect(formIntegration.name).toBe(args.name);
    expect(formIntegration.brandId).toBe(args.brandId);
    expect(formIntegration.languageCode).toBe(args.languageCode);
    expect(formIntegration.formId).toBe(args.formId);
    expect(formIntegration.formData.toJSON()).toEqual(args.formData);
  });
});
