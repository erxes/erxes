/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import faker from 'faker';
import { connect, disconnect } from '../db/connection';
import { FORM_LOAD_TYPES, MESSENGER_DATA_AVAILABILITY } from '../data/constants';
import { userFactory } from '../db/factories';
import { Integrations, Users } from '../db/models';
import IntegrationMutations from '../data/resolvers/mutations/integrations';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('mutations', () => {
  const _fakeBrandId = 'fakeBrandId';
  const _fakeFormId = 'fakeFormId';
  const _fakeIntegrationId = '_fakeIntegrationId';
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
  });

  test('test if `logging required` error is working as intended', () => {
    expect.assertions(6);

    // Login required ==================
    expect(() =>
      IntegrationMutations.integrationsCreateMessengerIntegration(null, {}, {}),
    ).toThrowError('Login required');

    expect(() =>
      IntegrationMutations.integrationsEditMessengerIntegration(null, {}, {}),
    ).toThrowError('Login required');

    expect(() =>
      IntegrationMutations.integrationsSaveMessengerAppearanceData(null, {}, {}),
    ).toThrowError('Login required');

    expect(() => IntegrationMutations.integrationsCreateFormIntegration(null, {}, {})).toThrowError(
      'Login required',
    );

    expect(() => IntegrationMutations.integrationsEditFormIntegration(null, {}, {})).toThrowError(
      'Login required',
    );

    expect(() => IntegrationMutations.integrationsRemove(null, {}, {})).toThrowError(
      'Login required',
    );
  });

  test('test Integrations.createMessengerIntegration', async () => {
    const doc = {
      name: 'Integration test',
      brandId: _fakeBrandId,
    };

    Integrations.createMessengerIntegration = jest.fn();

    await IntegrationMutations.integrationsCreateMessengerIntegration(null, doc, { user: _user });

    expect(Integrations.createMessengerIntegration).toBeCalledWith(doc);
    expect(Integrations.createMessengerIntegration.mock.calls.length).toBe(1);
  });

  test('test Integrations.updateMessengerIntegration', async () => {
    const doc = {
      _id: _fakeIntegrationId,
      name: 'Integration test 2',
      brandId: _fakeBrandId,
    };

    Integrations.updateMessengerIntegration = jest.fn();

    await IntegrationMutations.integrationsEditMessengerIntegration(null, doc, { user: _user });

    delete doc._id;

    expect(Integrations.updateMessengerIntegration).toBeCalledWith(_fakeIntegrationId, doc);
    expect(Integrations.updateMessengerIntegration.mock.calls.length).toBe(1);
  });

  test('test Integrations.saveMessengerConfigs', async () => {
    const uiOptions = {
      color: faker.random.word(),
      wallpaper: faker.random.word(),
      logo: faker.random.word(),
    };

    Integrations.saveMessengerAppearanceData = jest.fn();

    await IntegrationMutations.integrationsSaveMessengerAppearanceData(
      null,
      {
        _id: _fakeIntegrationId,
        uiOptions,
      },
      { user: _user },
    );

    expect(Integrations.saveMessengerAppearanceData).toBeCalledWith(_fakeIntegrationId, uiOptions);
    expect(Integrations.saveMessengerAppearanceData.mock.calls.length).toBe(1);
  });

  test('test Integrations.saveMessengerConfigs', async () => {
    const messengerData = {
      notifyCustomer: true,
      availabilityMethod: MESSENGER_DATA_AVAILABILITY.AUTO,
      isOnline: false,
      onlineHours: [
        {
          day: 'Monday',
          from: '8am',
          to: '12pm',
        },
        {
          day: 'Monday',
          from: '2pm',
          to: '6pm',
        },
      ],
      timezone: 'CET',
      welcomeMessage: 'Welcome user',
      awayMessage: 'Bye bye',
      thankYouMessage: 'Thank you',
    };

    Integrations.saveMessengerConfigs = jest.fn();

    await IntegrationMutations.integrationsSaveMessengerConfigs(
      null,
      {
        _id: _fakeIntegrationId,
        messengerData,
      },
      { user: _user },
    );

    expect(Integrations.saveMessengerConfigs).toBeCalledWith(_fakeIntegrationId, messengerData);
    expect(Integrations.saveMessengerConfigs.mock.calls.length).toBe(1);
  });

  test('test Integrations.createFormIntegration', async () => {
    const mainDoc = {
      name: 'form integration test',
      brandId: _fakeBrandId,
      formId: _fakeFormId,
    };

    const formData = {
      loadType: FORM_LOAD_TYPES.EMBEDDED,
    };

    Integrations.createFormIntegration = jest.fn();

    const doc = {
      ...mainDoc,
      formData,
    };

    await IntegrationMutations.integrationsCreateFormIntegration(null, doc, { user: _user });

    expect(Integrations.createFormIntegration).toBeCalledWith(doc);
    expect(Integrations.createFormIntegration.mock.calls.length).toBe(1);
  });

  test('test Integrations.updateFormIntegration', async () => {
    const mainDoc = {
      name: 'form integration test 2',
      brandId: _fakeBrandId,
      formId: _fakeFormId,
    };

    const formData = {
      loadType: FORM_LOAD_TYPES.SHOUTBOX,
    };

    const doc = {
      _id: _fakeIntegrationId,
      ...mainDoc,
      formData,
    };

    Integrations.updateFormIntegration = jest.fn();

    await IntegrationMutations.integrationsEditFormIntegration(null, doc, { user: _user });

    delete doc._id;

    expect(Integrations.updateFormIntegration).toBeCalledWith(_fakeIntegrationId, doc);
    expect(Integrations.updateFormIntegration.mock.calls.length).toBe(1);
  });

  test('test Integrations.removeIntegration', async () => {
    Integrations.removeIntegration = jest.fn();

    await IntegrationMutations.integrationsRemove(
      null,
      { _id: _fakeIntegrationId },
      { user: _user },
    );

    expect(Integrations.removeIntegration).toBeCalledWith(_fakeIntegrationId);
    expect(Integrations.removeIntegration.mock.calls.length).toBe(1);
  });
});
