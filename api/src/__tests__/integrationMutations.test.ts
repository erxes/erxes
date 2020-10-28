import './setup.ts';

import * as faker from 'faker';
import messageBroker from '../messageBroker';

import * as utils from '../data/utils';
import {
  brandFactory,
  customerFactory,
  formFactory,
  integrationFactory,
  tagsFactory,
  userFactory
} from '../db/factories';
import {
  Brands,
  Customers,
  EmailDeliveries,
  Integrations,
  Users
} from '../db/models';

import { IntegrationsAPI } from '../data/dataSources';
import { graphqlRequest } from '../db/connection';
import { KIND_CHOICES } from '../db/models/definitions/constants';

describe('mutations', () => {
  let _integration;
  let _brand;
  let tag;
  let form;

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
      adminEmails: []
    }
  };

  let dataSources;

  beforeEach(async () => {
    dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    // Creating test data
    _brand = await brandFactory({});
    tag = await tagsFactory();
    form = await formFactory();
    _integration = await integrationFactory({
      brandId: _brand._id,
      formId: form._id,
      tagIds: [tag._id]
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Brands.deleteMany({});
    await Customers.deleteMany({});
    await EmailDeliveries.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('Create messenger integration', async () => {
    await Integrations.remove({});

    const args = {
      name: 'Integration Name',
      brandId: _brand._id,
      languageCode: 'en',
      channelIds: ['randomId']
    };

    const mutation = `
      mutation integrationsCreateMessengerIntegration($channelIds: [String] ${commonParamDefs}) {
        integrationsCreateMessengerIntegration(channelIds: $channelIds ${commonParams}) {
          name
          brandId
          languageCode
        }
      }
    `;

    const integration = await graphqlRequest(
      mutation,
      'integrationsCreateMessengerIntegration',
      args
    );

    expect(integration.name).toBe(args.name);
    expect(integration.brandId).toBe(args.brandId);
    expect(integration.languageCode).toBe(args.languageCode);
  });

  test('Edit messenger integration', async () => {
    const secondBrand = await brandFactory();

    const args = {
      _id: _integration._id,
      name: _integration.name,
      brandId: secondBrand._id,
      languageCode: 'en',
      channelIds: ['randomId']
    };

    const mutation = `
      mutation integrationsEditMessengerIntegration(
        $_id: String!
        $channelIds: [String]
        ${commonParamDefs}
      ) {
        integrationsEditMessengerIntegration(
        _id: $_id
        channelIds: $channelIds
        ${commonParams}
      ) {
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
      args
    );

    expect(integration._id).toBe(args._id);
    expect(integration.name).toBe(args.name);
    expect(integration.brandId).toBe(args.brandId);
    expect(integration.languageCode).toBe(args.languageCode);
  });

  test('Save messenger integration appearance data', async () => {
    const uiOptions = {
      color: faker.random.word(),
      wallpaper: faker.random.word(),
      logo: faker.random.image()
    };

    const args = {
      _id: _integration._id,
      uiOptions
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
      args
    );

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
      showVideoCallRequest: false,
      forceLogoutWhenResolve: false,
      onlineHours: [
        {
          day: faker.random.word(),
          from: faker.random.word(),
          to: faker.random.word()
        }
      ],
      timezone: faker.random.word(),
      messages: {
        en: {
          welcome: faker.random.word(),
          away: faker.random.word(),
          thank: faker.random.word()
        }
      }
    };

    const args = {
      _id: _integration._id,
      messengerData
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

    const messengerConfig = await graphqlRequest(
      mutation,
      'integrationsSaveMessengerConfigs',
      args
    );

    expect(messengerConfig._id).toBe(args._id);
    expect(messengerConfig.messengerData.toJSON()).toEqual(args.messengerData);
  });

  test('Create lead integration', async () => {
    const leadIntegration = await integrationFactory({
      formId: 'formId',
      kind: 'lead'
    });

    const args = {
      name: leadIntegration.name,
      brandId: _brand._id,
      formId: leadIntegration.formId,
      ...commonLeadProperties
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

    const response = await graphqlRequest(
      mutation,
      'integrationsCreateLeadIntegration',
      args
    );

    expect(response.name).toBe(args.name);
    expect(response.brandId).toBe(args.brandId);
    expect(response.languageCode).toBe(args.languageCode);
    expect(response.formId).toBe(args.formId);
  });

  test('Edit lead integration', async () => {
    const leadIntegration = await integrationFactory({
      formId: 'formId',
      kind: 'lead'
    });

    const args = {
      _id: leadIntegration._id,
      name: leadIntegration.name,
      brandId: _brand._id,
      formId: leadIntegration.formId,
      ...commonLeadProperties
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

    const response = await graphqlRequest(
      mutation,
      'integrationsEditLeadIntegration',
      args
    );

    expect(response._id).toBe(args._id);
    expect(response.name).toBe(args.name);
    expect(response.brandId).toBe(args.brandId);
    expect(response.languageCode).toBe(args.languageCode);
    expect(response.formId).toBe(args.formId);
  });

  test('Create external integration', async () => {
    const mutation = `
      mutation integrationsCreateExternalIntegration(
        $kind: String!
        $name: String!
        $brandId: String!
        $accountId: String,
        $data: JSON
        $channelIds: [String]
      ) {
        integrationsCreateExternalIntegration(
          kind: $kind
          name: $name
          brandId: $brandId
          accountId: $accountId
          data: $data
          channelIds: $channelIds
        ) {
          _id
          name
          kind
          brandId
        }
      }
    `;

    const brand = await brandFactory();

    const args: any = {
      kind: 'nylas-gmail',
      name: 'Nyals gmail integration',
      brandId: brand._id,
      channelIds: ['randomId']
    };

    try {
      await graphqlRequest(
        mutation,
        'integrationsCreateExternalIntegration',
        args,
        { dataSources }
      );
    } catch (e) {
      expect(e[0].message).toBe('Error: Integrations api is not running');
    }

    args.kind = 'facebook-post';

    const createIntegrationSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'createIntegration'
    );
    createIntegrationSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'integrationsCreateExternalIntegration',
      args,
      { dataSources }
    );

    args.kind = 'twitter-dm';
    args.data = { data: 'data' };

    await graphqlRequest(
      mutation,
      'integrationsCreateExternalIntegration',
      args,
      { dataSources }
    );

    args.kind = 'smooch-viber';
    args.data = { data: 'data' };

    await graphqlRequest(
      mutation,
      'integrationsCreateExternalIntegration',
      args,
      { dataSources }
    );

    const response = await graphqlRequest(
      mutation,
      'integrationsCreateExternalIntegration',
      args,
      { dataSources }
    );

    expect(response).toBeDefined();

    args.kind = 'webhook';
    args.data = { data: 'data' };

    await graphqlRequest(
      mutation,
      'integrationsCreateExternalIntegration',
      args,
      { dataSources }
    );

    const webhookResponse = await graphqlRequest(
      mutation,
      'integrationsCreateExternalIntegration',
      args,
      {
        dataSources
      }
    );

    expect(webhookResponse).toBeDefined();

    createIntegrationSpy.mockRestore();
  });

  test('Update config', async () => {
    const mutation = `
      mutation integrationsUpdateConfigs($configsMap: JSON!) {
        integrationsUpdateConfigs(configsMap: $configsMap)
      }
    `;

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'updateConfigs');
    spy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'integrationsUpdateConfigs',
      { configsMap: { FACEBOOK_TOKEN: 'token' } },
      { dataSources }
    );

    spy.mockRestore();
  });

  test('Remove account', async () => {
    const mutation = `
      mutation integrationsRemoveAccount($_id: String!) {
        integrationsRemoveAccount(_id: $_id)
      }
    `;

    const integration1 = await integrationFactory();

    const spy = jest.spyOn(messageBroker(), 'sendRPCMessage');
    spy.mockImplementation(() =>
      Promise.resolve({ erxesApiIds: [integration1._id] })
    );

    const response = await graphqlRequest(
      mutation,
      'integrationsRemoveAccount',
      { _id: 'accountId' }
    );

    try {
      await graphqlRequest(mutation, 'integrationsRemoveAccount', {
        _id: 'accountId'
      });
    } catch (e) {
      expect(e[0].message).toBeDefined();
    }

    expect(response).toBe('success');

    spy.mockRestore();

    const spy1 = jest.spyOn(messageBroker(), 'sendRPCMessage');

    spy1.mockImplementation(() => Promise.resolve({ erxesApiIds: [] }));

    const secondResponse = await graphqlRequest(
      mutation,
      'integrationsRemoveAccount',
      { _id: 'accountId' }
    );

    expect(secondResponse).toBe('success');

    spy1.mockRestore();
  });

  test('Send mail', async () => {
    const mutation = `
      mutation integrationSendMail(
        $erxesApiId: String!
        $subject: String!
        $to: [String]!
        $cc: [String]
        $bcc: [String]
        $from: String!
        $kind: String
        $customerId: String
      ) {
        integrationSendMail(
          erxesApiId: $erxesApiId
          subject: $subject
          to: $to
          cc: $cc
          bcc: $bcc
          from: $from
          kind: $kind
          customerId: $customerId
        )
      }
    `;

    const customer = await customerFactory({ primaryEmail: 'user@mail.com' });

    const args = {
      erxesApiId: 'erxesApiId',
      subject: 'Subject',
      to: ['user@mail.com'],
      cc: ['cc'],
      bcc: ['bcc'],
      from: 'from',
      kind: 'nylas-gmail',
      body: 'body'
    };

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'sendEmail');
    const mockReplaceEditorAttribute = jest.spyOn(
      utils,
      'replaceEditorAttributes'
    );

    mockReplaceEditorAttribute.mockImplementation(() =>
      Promise.resolve({
        replacedContent: 'replacedContent',
        replacers: [{ key: 'key', value: 'value' }]
      })
    );

    spy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(mutation, 'integrationSendMail', args, {
      dataSources
    });

    const emailDelivery = await EmailDeliveries.findOne({
      customerId: customer._id
    });

    if (emailDelivery) {
      expect(JSON.stringify(emailDelivery.to)).toEqual(JSON.stringify(args.to));
      expect(customer._id).toEqual(emailDelivery.customerId);
    }

    spy.mockRestore();

    try {
      await graphqlRequest(mutation, 'integrationSendMail', args, {
        dataSources
      });
    } catch (e) {
      expect(e[0].message).toBeDefined();
    }

    mockReplaceEditorAttribute.mockRestore();
  });

  test('Integrations remove', async () => {
    const mutation = `
      mutation integrationsRemove($_id: String!) {
        integrationsRemove(_id: $_id)
      }
    `;

    const messengerIntegration = await integrationFactory({
      kind: 'messenger',
      formId: form._id,
      tagIds: [tag._id]
    });

    const removeSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'removeIntegration'
    );
    removeSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(mutation, 'integrationsRemove', {
      _id: messengerIntegration._id
    });

    expect(await Integrations.findOne({ _id: messengerIntegration._id })).toBe(
      null
    );

    const facebookPostIntegration = await integrationFactory({
      kind: 'facebook-post'
    });

    await graphqlRequest(
      mutation,
      'integrationsRemove',
      {
        _id: facebookPostIntegration._id
      },
      {
        dataSources
      }
    );

    removeSpy.mockRestore();
  });

  test('test integrationsRemove() to catch error', async () => {
    const mutation = `
      mutation integrationsRemove($_id: String!) {
        integrationsRemove(_id: $_id)
      }
    `;

    const fbPostIntegration = await integrationFactory({
      kind: 'facebook-post'
    });

    try {
      await graphqlRequest(mutation, 'integrationsRemove', {
        _id: fbPostIntegration._id
      });
    } catch (e) {
      expect(e[0].message).toBeDefined();
    }
  });

  test('Integrations archive', async () => {
    const mutation = `
      mutation integrationsArchive($_id: String!, $status: Boolean!) {
        integrationsArchive(_id: $_id, status: $status) {
          _id
          isActive
        }
      }
    `;

    const integration = await integrationFactory();
    let response = await graphqlRequest(mutation, 'integrationsArchive', {
      _id: integration._id,
      status: true
    });

    expect(response.isActive).toBeFalsy();

    response = await graphqlRequest(mutation, 'integrationsArchive', {
      _id: integration._id,
      status: false
    });

    expect(response.isActive).toBeTruthy();
  });

  test('Integrations edit common fields', async () => {
    const mutation = `
      mutation integrationsEditCommonFields($_id: String!, $name: String!, $brandId: String!, $channelIds: [String], $data: JSON) {
        integrationsEditCommonFields(_id: $_id name: $name brandId: $brandId channelIds: $channelIds data: $data) {
          _id
          name
          brandId
          webhookData
        }
      }
    `;

    const integration = await integrationFactory();

    const doc: any = {
      _id: integration._id,
      name: 'updated',
      brandId: 'brandId',
      channelIds: ['randomId']
    };

    const response = await graphqlRequest(
      mutation,
      'integrationsEditCommonFields',
      doc
    );

    expect(response._id).toBe(doc._id);
    expect(response.name).toBe(doc.name);
    expect(response.brandId).toBe(doc.brandId);

    const webhookIntegration = await integrationFactory({
      kind: KIND_CHOICES.WEBHOOK
    });

    doc._id = webhookIntegration._id;
    doc.data = {
      script: 'script'
    };

    const webhookResponse = await graphqlRequest(
      mutation,
      'integrationsEditCommonFields',
      doc
    );

    expect(webhookResponse).toBeDefined();
  });

  test('test integrationsSendSms()', async () => {
    const mutation = `
      mutation integrationsSendSms(
        $integrationId: String!
        $content: String!
        $to: String!
      ) {
        integrationsSendSms(
          integrationId: $integrationId
          content: $content
          to: $to
        )
      }
    `;

    const args = {
      integrationId: 'integrationId',
      content: 'Hello',
      to: '+976123456789'
    };

    const spy = jest.spyOn(dataSources.IntegrationsAPI, 'sendSms');

    spy.mockImplementation(() => Promise.resolve({ status: 'ok' }));

    const response = await graphqlRequest(
      mutation,
      'integrationsSendSms',
      args,
      { dataSources }
    );

    expect(response.status).toBe('ok');

    spy.mockRestore();
  });
});
