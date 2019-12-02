import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { brandFactory, integrationFactory, userFactory } from '../db/factories';
import { Brands, Integrations, Users } from '../db/models';

import { IntegrationsAPI } from '../data/dataSources';
import './setup.ts';

describe('mutations', () => {
  let _integration;
  let _brand;

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

  const commonLeadProperties = {
    languageCode: 'en',
    loadType: faker.random.word(),
    fromEmail: faker.internet.email(),
    userEmailTitle: faker.random.word(),
    userEmailContent: faker.random.word(),
    adminEmailTitle: faker.random.word(),
    adminEmailContent: faker.random.word(),
    redirectUrl: faker.random.word(),
    successAction: faker.random.word(),
    leadData: {
      thankContent: faker.random.word(),
      adminEmails: [],
    },
  };

  beforeEach(async () => {
    // Creating test data
    _integration = await integrationFactory({});
    _brand = await brandFactory({});
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

    const integration = await graphqlRequest(mutation, 'integrationsCreateMessengerIntegration', args);

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

    const integration = await graphqlRequest(mutation, 'integrationsEditMessengerIntegration', args);

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

    const messengerAppearanceData = await graphqlRequest(mutation, 'integrationsSaveMessengerAppearanceData', args);

    expect(messengerAppearanceData._id).toBe(args._id);
    expect(messengerAppearanceData.uiOptions.toJSON()).toEqual(args.uiOptions);
  });

  test('Save messenger integration config', async () => {
    const user = await userFactory({});

    const messengerData = {
      supporterIds: [user.id],
      notifyCustomer: false,
      isOnline: false,
      availabilityMethod: 'auto',
      requireAuth: false,
      showChat: false,
      showLauncher: false,
      forceLogoutWhenResolve: false,
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

    const messengerConfig = await graphqlRequest(mutation, 'integrationsSaveMessengerConfigs', args);

    expect(messengerConfig._id).toBe(args._id);
    expect(messengerConfig.messengerData.toJSON()).toEqual(args.messengerData);
  });

  test('Create lead integration', async () => {
    const leadIntegration = await integrationFactory({ formId: 'formId', kind: 'lead' });

    const args = {
      name: leadIntegration.name,
      brandId: _brand._id,
      formId: leadIntegration.formId,
      ...commonLeadProperties,
    };

    const mutation = `
      mutation integrationsCreateLeadIntegration(
        ${commonParamDefs}
        $formId: String!
        $leadData: IntegrationLeadData!
      ) {
        integrationsCreateLeadIntegration(
          ${commonParams}
          formId: $formId
          leadData: $leadData
        ) {
          name
          brandId
          languageCode
          formId
          leadData
        }
      }
    `;

    const response = await graphqlRequest(mutation, 'integrationsCreateLeadIntegration', args);

    expect(response.name).toBe(args.name);
    expect(response.brandId).toBe(args.brandId);
    expect(response.languageCode).toBe(args.languageCode);
    expect(response.formId).toBe(args.formId);
  });

  test('Edit lead integration', async () => {
    const leadIntegration = await integrationFactory({ formId: 'formId', kind: 'lead' });

    const args = {
      _id: leadIntegration._id,
      name: leadIntegration.name,
      brandId: _brand._id,
      formId: leadIntegration.formId,
      ...commonLeadProperties,
    };

    const mutation = `
      mutation integrationsEditLeadIntegration(
        $_id: String!
        $formId: String!
        $leadData: IntegrationLeadData!
        ${commonParamDefs}
      ) {
        integrationsEditLeadIntegration(
          _id: $_id
          formId: $formId
          leadData: $leadData
          ${commonParams}
        ) {
          _id
          name
          brandId
          languageCode
          formId
          leadData
        }
      }
    `;

    const response = await graphqlRequest(mutation, 'integrationsEditLeadIntegration', args);

    expect(response._id).toBe(args._id);
    expect(response.name).toBe(args.name);
    expect(response.brandId).toBe(args.brandId);
    expect(response.languageCode).toBe(args.languageCode);
    expect(response.formId).toBe(args.formId);
  });

  test('Create external integration', async () => {
    process.env.INTEGRATIONS_API_DOMAIN = 'http://fake.erxes.io';

    const mutation = `
      mutation integrationsCreateExternalIntegration(
        $kind: String!
        $name: String!
        $brandId: String!
        $accountId: String,
        $data: JSON
      ) {
        integrationsCreateExternalIntegration(
          kind: $kind
          name: $name
          brandId: $brandId
          accountId: $accountId
          data: $data
        ) {
          _id
          name
          kind
          brandId
        }
      }
    `;

    const brand = await brandFactory();

    const dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    const args: any = {
      kind: 'nylas-gmail',
      name: 'Nyals gmail integration',
      brandId: brand._id,
    };

    try {
      await graphqlRequest(mutation, 'integrationsCreateExternalIntegration', args, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Error: Integrations api is not running');
    }

    args.kind = 'facebook-post';
    try {
      await graphqlRequest(mutation, 'integrationsCreateExternalIntegration', args, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Error: Integrations api is not running');
    }

    args.kind = 'twitter-dm';
    args.data = { data: 'data' };

    try {
      await graphqlRequest(mutation, 'integrationsCreateExternalIntegration', args, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Error: Integrations api is not running');
    }

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'createIntegration');
    spy.mockImplementation(() => Promise.resolve());

    const response = await graphqlRequest(mutation, 'integrationsCreateExternalIntegration', args, { dataSources });

    expect(response).toBeDefined();
  });

  test('Add mail account', async () => {
    process.env.INTEGRATIONS_API_DOMAIN = 'http://fake.erxes.io';

    const mutation = `
      mutation integrationAddMailAccount(
        $email: String!
        $password: String!
        $kind: String!
      ) {
        integrationAddMailAccount(
          email: $email
          password: $password
          kind: $kind
        )
      }
    `;

    const args = {
      email: 'email',
      password: 'pass',
      kind: 'facebook-post',
    };

    const dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    try {
      await graphqlRequest(mutation, 'integrationAddMailAccount', args, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }
  });

  test('Add imap account', async () => {
    process.env.INTEGRATIONS_API_DOMAIN = 'http://fake.erxes.io';

    const mutation = `
      mutation integrationAddImapAccount(
        $email: String!
        $password: String!
        $imapHost: String!
        $imapPort: Int!
        $smtpHost: String!
        $smtpPort: Int!
        $kind: String!
      ) {
        integrationAddImapAccount(
          email: $email
          password: $password
          imapHost: $imapHost
          imapPort: $imapPort
          smtpHost: $smtpHost
          smtpPort: $smtpPort
          kind: $kind
        )
      }
    `;

    const args = {
      email: 'email@yahoo.com',
      password: 'pass',
      imapHost: 'imapHost',
      imapPort: 10,
      smtpHost: 'smtpHost',
      smtpPort: 10,
      kind: 'facebook-post',
    };

    const dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    try {
      await graphqlRequest(mutation, 'integrationAddImapAccount', args, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }
  });

  test('Remove account', async () => {
    process.env.INTEGRATIONS_API_DOMAIN = 'http://fake.erxes.io';

    const mutation = `
      mutation integrationsRemoveAccount($_id: String!) {
        integrationsRemoveAccount(_id: $_id)
      }
    `;

    const integration = await integrationFactory();

    const dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'removeAccount');
    spy.mockImplementation(() => Promise.resolve({ erxesApiIds: [integration._id] }));

    const user = { user: await userFactory() };

    const response = await graphqlRequest(
      mutation,
      'integrationsRemoveAccount',
      { _id: 'accountId' },
      { dataSources, user },
    );

    expect(response).toBe('success');

    spy.mockRestore();

    try {
      await graphqlRequest(mutation, 'integrationsRemoveAccount', { _id: 'accountId' }, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }
  });

  test('Send mail', async () => {
    process.env.INTEGRATIONS_API_DOMAIN = 'http://fake.erxes.io';

    const mutation = `
      mutation integrationSendMail(
        $erxesApiId: String!
        $subject: String!
        $to: String!
        $from: String!
        $kind: String
      ) {
        integrationSendMail(
          erxesApiId: $erxesApiId
          subject: $subject
          to: $to
          from: $from
          kind: $kind
        )
      }
    `;

    const args = {
      erxesApiId: 'erxesApiId',
      subject: 'Subject',
      to: 'to',
      from: 'from',
      kind: 'nylas-gmail',
    };

    const dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    try {
      await graphqlRequest(mutation, 'integrationSendMail', args, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }

    args.kind = 'facebook-post';
    try {
      await graphqlRequest(mutation, 'integrationSendMail', args, { dataSources });
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }
  });

  test('Integrations remove', async () => {
    const mutation = `
      mutation integrationsRemove($_id: String!) {
        integrationsRemove(_id: $_id)
      }
    `;

    const messengerIntegration = await integrationFactory({ kind: 'messenger' });
    await graphqlRequest(mutation, 'integrationsRemove', {
      _id: messengerIntegration._id,
    });

    expect(await Integrations.findOne({ _id: messengerIntegration._id })).toBe(null);

    const facebookPostIntegration = await integrationFactory({ kind: 'facebook-post' });

    const dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    try {
      await graphqlRequest(
        mutation,
        'integrationsRemove',
        {
          _id: facebookPostIntegration._id,
        },
        {
          dataSources,
        },
      );
    } catch (e) {
      expect(e[0].message).toBe('Integrations api is not running');
    }
  });

  test('Integrations archive', async () => {
    const mutation = `
      mutation integrationsArchive($_id: String!) {
        integrationsArchive(_id: $_id) {
          _id
          isActive
        }
      }
    `;

    const integration = await integrationFactory();
    const response = await graphqlRequest(mutation, 'integrationsArchive', {
      _id: integration._id,
    });

    expect(response.isActive).toBeFalsy();
  });

  test('Integrations edit common fields', async () => {
    const mutation = `
      mutation integrationsEditCommonFields($_id: String!, $name: String!, $brandId: String!) {
        integrationsEditCommonFields(_id: $_id name: $name brandId: $brandId) {
          _id
          name
          brandId
        }
      }
    `;

    const integration = await integrationFactory();

    const doc = {
      _id: integration._id,
      name: 'updated',
      brandId: 'brandId',
    };

    const response = await graphqlRequest(mutation, 'integrationsEditCommonFields', doc);

    expect(response._id).toBe(doc._id);
    expect(response.name).toBe(doc.name);
    expect(response.brandId).toBe(doc.brandId);
  });
});
