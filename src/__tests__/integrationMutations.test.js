/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect, graphqlRequest } from '../db/connection';
import { Users, Integrations, Brands } from '../db/models';
import { userFactory, integrationFactory, brandFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

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

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({ role: 'admin' });
    _integration = await integrationFactory();
    _brand = await brandFactory();

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.remove({});
    await Brands.remove({});
    await Integrations.remove({});
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

    const integration = await graphqlRequest(
      mutation,
      'integrationsCreateMessengerIntegration',
      args,
      context,
    );

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
        mutation integrationsEditMessengerIntegration($_id: String!, ${commonParamDefs}) {
          integrationsEditMessengerIntegration(_id: $_id, ${commonParams}) {
            _id
            name
            brandId
            languageCode
          }
        }
    `;

    const integration = await graphqlRequest(
      mutation,
      'integrationsEditMessengerIntegration',
      args,
      context,
    );

    expect(integration._id).toBe(args._id);
    expect(integration.name).toBe(args.name);
    expect(integration.brandId).toBe(args.brandId);
    expect(integration.languageCode).toBe(args.languageCode);
  });

  test('Save messenger integration appearance data', async () => {
    const uiOptions = {
      color: 'fakeColor',
      wallpaper: 'fakeWallpaper',
      logo: 'fakeLogo',
    };

    const args = {
      _id: _integration._id,
      uiOptions: uiOptions,
    };

    const mutation = `
      mutation integrationsSaveMessengerAppearanceData(
        $_id: String!,
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
      notifyCustomer: false,
      isOnline: false,
      onlineHours: [
        {
          day: 'fakeDay',
          from: 'fakeFrom',
          to: 'fakeTo',
        },
      ],
      timezone: 'fakeTimezone',
      welcomeMessage: 'fakeMessage',
      awayMessage: 'fakeAwayMessage',
      thankYouMessage: 'fakeThankMessage',
    };

    const args = {
      _id: _integration._id,
      messengerData: messengerData,
    };

    const mutation = `
      mutation integrationsSaveMessengerConfigs(
        $_id: String!,
        $messengerData: IntegrationMessengerData
      ) {
        integrationsSaveMessengerConfigs(
          _id: $_id,
          messengerData: $messengerData
        ) {
          _id
          messengerData
        }
      }
    `;

    const messengerConfig = await graphqlRequest(
      mutation,
      'integrationsSaveMessengerConfigs',
      args,
      context,
    );

    expect(messengerConfig._id).toBe(args._id);
    expect(messengerConfig.messengerData.toJSON()).toEqual(args.messengerData);
  });

  test('Create form integration', async () => {
    const args = {
      name: _integration.name,
      brandId: _brand._id,
      languageCode: 'en',
      loadType: 'fakeLoadType',
      fromEmail: 'fakeFromEmail',
      userEmailTitle: 'fakeUserEmailTitle',
      userEmailContent: 'fakeUserEmailContent',
      adminEmailTitle: 'fakeAdminEmailTitle',
      adminEmailContent: 'fakeAdminEmailContent',
      redirectUrl: 'fakeRedirectUrl',
      successAction: 'fakeSuccessAction',
      formId: _integration.formId,
      formData: {
        thankContent: 'fakeThankContent',
        adminEmails: [],
      },
    };

    const mutation = `
      mutation integrationsCreateFormIntegration(
        ${commonParamDefs},
        $formId: String!,
        $formData: IntegrationFormData!
      ) {
        integrationsCreateFormIntegration(
          ${commonParams},
          formId: $formId,
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

    const formIntegration = await graphqlRequest(
      mutation,
      'integrationsCreateFormIntegration',
      args,
      context,
    );

    expect(formIntegration.name).toBe(args.name);
    expect(formIntegration.brandId).toBe(args.brandId);
    expect(formIntegration.languageCode).toBe(args.languageCode);
    expect(formIntegration.formId).toBe(args.formId);
    expect(formIntegration.formData.toJSON()).toEqual(args.formData);
  });
});
