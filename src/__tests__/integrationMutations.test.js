/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import faker from 'faker';
import { connect, disconnect } from '../db/connection';
import { KIND_CHOICES, FORM_LOAD_TYPES, MESSENGER_DATA_AVAILABILITY } from '../data/constants';
import { brandFactory, integrationFactory, formFactory, userFactory } from '../db/factories';
import { Integrations, Brands, Users, Forms } from '../db/models';
import mutations from '../data/resolvers/mutations';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('messenger integration model add method test', () => {
  let _brand;

  beforeEach(async () => {
    _brand = await brandFactory({});
  });

  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
  });

  test('check if messenger integration create method is running successfully', async () => {
    const doc = {
      name: 'Integration test',
      brandId: _brand._id,
    };

    const integration = await Integrations.createMessengerIntegration(doc);

    expect(integration.name).toBe(doc.name);
    expect(integration.brandId).toBe(doc.brandId);
    expect(integration.kind).toBe(KIND_CHOICES.MESSENGER);
  });
});

describe('messenger integration model edit test', () => {
  let _brand;
  let _integration;
  let _brand2;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _brand2 = await brandFactory({});
    _integration = await integrationFactory({
      kind: KIND_CHOICES.MESSENGER,
      brandId: _brand,
    });
  });

  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
  });

  test('check if messenger integration update method is running successfully', async () => {
    const doc = {
      name: 'Integration test 2',
      brandId: _brand2._id,
      kind: 'new kind',
    };

    await Integrations.updateMessengerIntegration(_integration._id, doc);

    const updatedIntegration = await Integrations.findOne({ _id: _integration._id });

    expect(updatedIntegration.name).toBe(doc.name);
    expect(updatedIntegration.brandId).toBe(doc.brandId);
    expect(updatedIntegration.kind).toBe(KIND_CHOICES.MESSENGER);
  });
});

describe('form integration create model test without formData', () => {
  let _brand;
  let _form;
  let _user;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
  });

  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
    await Users.remove({});
    await Forms.remove({});
  });

  test('check if create form integration test wihtout formData is throwing exception', async () => {
    expect.assertions(1);

    const mainDoc = {
      name: 'form integration test',
      brandId: _brand._id,
      formId: _form._id,
    };

    try {
      await Integrations.createFormIntegration(mainDoc);
    } catch (e) {
      expect(e.message).toEqual('formData must be supplied');
    }
  });
});

describe('create form integration test', () => {
  let _brand;
  let _form;
  let _user;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
  });

  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
    await Users.remove({});
    await Forms.remove({});
  });

  test('test if create form integration is working successfully', async () => {
    const mainDoc = {
      name: 'form integration test',
      brandId: _brand._id,
      formId: _form._id,
    };

    const formData = {
      loadType: FORM_LOAD_TYPES.EMBEDDED,
    };

    const integration = await Integrations.createFormIntegration({ ...mainDoc, formData });

    expect(integration.formId).toEqual(_form._id);
    expect(integration.name).toEqual(mainDoc.name);
    expect(integration.brandId).toEqual(_brand._id);
    expect(integration.formData.loadType).toEqual(FORM_LOAD_TYPES.EMBEDDED);
    expect(integration.kind).toEqual(KIND_CHOICES.FORM);
  });
});

describe('edit form integration test', () => {
  let _brand;
  let _brand2;
  let _form;
  let _form2;
  let _user;
  let _form_integration;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _brand2 = await brandFactory({});
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _form2 = await formFactory({ createdUserId: _user._id });
    _form_integration = await integrationFactory({
      name: 'form integration test',
      brandId: _brand._id,
      formId: _form._id,
      kind: KIND_CHOICES.FORM,
      formData: {
        loadType: FORM_LOAD_TYPES.EMBEDDED,
      },
    });
  });

  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
    await Users.remove({});
    await Forms.remove({});
  });

  test('test if integration form update method is running successfully', async () => {
    const mainDoc = {
      name: 'form integration test 2',
      brandId: _brand2._id,
      formId: _form2._id,
    };

    const formData = {
      loadType: FORM_LOAD_TYPES.SHOUTBOX,
    };

    await Integrations.updateFormIntegration(_form_integration._id, {
      ...mainDoc,
      formData,
    });

    const integration = await Integrations.findOne({ _id: _form_integration._id });

    expect(integration.name).toEqual(mainDoc.name);
    expect(integration.formId).toEqual(_form2._id);
    expect(integration.brandId).toEqual(_brand2._id);
    expect(integration.formData.loadType).toEqual(FORM_LOAD_TYPES.SHOUTBOX);
  });
});

describe('remove integration model method test', () => {
  let _brand;
  let _integration;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _integration = await integrationFactory({
      name: 'form integration test',
      brandId: _brand._id,
      kind: 'form',
    });
  });

  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
    await Users.remove({});
  });

  test('test if remove form integration model method is working successfully', async () => {
    await Integrations.removeIntegration({ _id: _integration._id });

    const integrationCount = await Integrations.find({}).count();

    expect(integrationCount).toEqual(0);
  });
});

describe('save integration messenger appearance test', () => {
  let _brand;
  let _integration;
  /**
   */
  beforeEach(async () => {
    _brand = await brandFactory({});
    _integration = await integrationFactory({
      name: 'messenger integration test',
      brandId: _brand._id,
      kind: 'messenger',
    });
  });

  /**
   */
  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
  });

  test('test if save integration messenger appearance method is working successfully', async () => {
    const uiOptions = {
      color: faker.random.word(),
      wallpaper: faker.random.word(),
      logo: faker.random.word(),
    };

    await Integrations.saveMessengerAppearanceData(_integration._id, uiOptions);

    const integration = await Integrations.findOne({ _id: _integration._id });

    expect(integration.uiOptions.color).toEqual(uiOptions.color);
    expect(integration.uiOptions.wallpaper).toEqual(uiOptions.wallpaper);
    expect(integration.uiOptions.logo).toEqual(uiOptions.logo);
  });
});

describe('save integration messenger configurations test', () => {
  let _brand;
  let _integration;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _integration = await integrationFactory({
      name: 'messenger integration test',
      brandId: _brand._id,
      kind: 'messenger',
    });
  });

  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
  });

  test('test if integration messenger save confiturations method is working correctly', async () => {
    const messengerData = {
      notifyCustomer: true,
      availabilityMethod: MESSENGER_DATA_AVAILABILITY.MANUAL,
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

    await Integrations.saveMessengerConfigs(_integration._id, messengerData);

    const integration = await Integrations.findOne({ _id: _integration._id });

    expect(integration.messengerData.notifyCustomer).toEqual(messengerData.notifyCustomer);
    expect(integration.messengerData.availabilityMethod).toEqual(messengerData.availabilityMethod);
    expect(integration.messengerData.isOnline).toEqual(messengerData.isOnline);
    expect(integration.messengerData.onlineHours[0].day).toEqual(messengerData.onlineHours[0].day);
    expect(integration.messengerData.onlineHours[0].from).toEqual(
      messengerData.onlineHours[0].from,
    );
    expect(integration.messengerData.onlineHours[0].to).toEqual(messengerData.onlineHours[0].to);
    expect(integration.messengerData.onlineHours[1].day).toEqual(messengerData.onlineHours[1].day);
    expect(integration.messengerData.onlineHours[1].from).toEqual(
      messengerData.onlineHours[1].from,
    );
    expect(integration.messengerData.onlineHours[1].to).toEqual(messengerData.onlineHours[1].to);
    expect(integration.messengerData.timezone).toEqual(messengerData.timezone);
    expect(integration.messengerData.welcomeMessage).toEqual(messengerData.welcomeMessage);
    expect(integration.messengerData.awayMessage).toEqual(messengerData.awayMessage);
    expect(integration.messengerData.thankYouMessage).toEqual(messengerData.thankYouMessage);

    const newMessengerData = {
      notifyCustomer: false,
      availabilityMethod: MESSENGER_DATA_AVAILABILITY.AUTO,
      isOnline: true,
      onlineHours: [
        {
          day: 'Tuesday',
          from: '9am',
          to: '1pm',
        },
        {
          day: 'Tuesday',
          from: '3pm',
          to: '7pm',
        },
      ],
      timezone: 'EET',
      welcomeMessage: 'Welcome customer',
      awayMessage: 'Good bye',
      thankYouMessage: 'Gracias',
    };

    await Integrations.saveMessengerConfigs(_integration._id, newMessengerData);

    const updatedIntegration = await Integrations.findOne({ _id: _integration._id });

    expect(updatedIntegration.messengerData.notifyCustomer).toEqual(
      newMessengerData.notifyCustomer,
    );
    expect(updatedIntegration.messengerData.availabilityMethod).toEqual(
      newMessengerData.availabilityMethod,
    );
    expect(updatedIntegration.messengerData.isOnline).toEqual(newMessengerData.isOnline);
    expect(updatedIntegration.messengerData.onlineHours[0].day).toEqual(
      newMessengerData.onlineHours[0].day,
    );
    expect(updatedIntegration.messengerData.onlineHours[0].from).toEqual(
      newMessengerData.onlineHours[0].from,
    );
    expect(updatedIntegration.messengerData.onlineHours[0].to).toEqual(
      newMessengerData.onlineHours[0].to,
    );
    expect(updatedIntegration.messengerData.onlineHours[1].day).toEqual(
      newMessengerData.onlineHours[1].day,
    );
    expect(updatedIntegration.messengerData.onlineHours[1].from).toEqual(
      newMessengerData.onlineHours[1].from,
    );
    expect(updatedIntegration.messengerData.onlineHours[1].to).toEqual(
      newMessengerData.onlineHours[1].to,
    );
    expect(updatedIntegration.messengerData.timezone).toEqual(newMessengerData.timezone);
    expect(updatedIntegration.messengerData.welcomeMessage).toEqual(
      newMessengerData.welcomeMessage,
    );
    expect(updatedIntegration.messengerData.awayMessage).toEqual(newMessengerData.awayMessage);
    expect(updatedIntegration.messengerData.thankYouMessage).toEqual(
      newMessengerData.thankYouMessage,
    );
  });
});

describe('mutation tests', () => {
  let _user;

  beforeEach(async () => {
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Users.remove({});
  });

  test('mutation test', async () => {
    // test Integrations.createMessengerIntegration ==========
    const fakeBrandId = 'fakeBrandId';
    const fakeIntegrationId = 'fakeIntegrationid';
    const fakeFormId = 'fakeFormId';

    let doc = {
      name: 'Integration test',
      brandId: fakeBrandId,
    };

    Integrations.createMessengerIntegration = jest.fn();

    await mutations.integrationsCreateMessengerIntegration(null, doc, { user: _user });

    expect(Integrations.createMessengerIntegration).toBeCalledWith(doc);
    expect(Integrations.createMessengerIntegration.mock.calls.length).toBe(1);

    // test Integrations.updateMessengerIntegration =========================
    doc = {
      _id: fakeIntegrationId,
      name: 'Integration test 2',
      brandId: fakeBrandId,
    };

    Integrations.updateMessengerIntegration = jest.fn();

    await mutations.integrationsEditMessengerIntegration(null, doc, { user: _user });

    delete doc._id;

    expect(Integrations.updateMessengerIntegration).toBeCalledWith(fakeIntegrationId, doc);
    expect(Integrations.updateMessengerIntegration.mock.calls.length).toBe(1);

    // test Integrations.saveMessengerConfigs =======================
    const uiOptions = {
      color: faker.random.word(),
      wallpaper: faker.random.word(),
      logo: faker.random.word(),
    };

    Integrations.saveMessengerAppearanceData = jest.fn();

    await mutations.integrationsSaveMessengerAppearanceData(
      null,
      {
        _id: fakeIntegrationId,
        uiOptions,
      },
      { user: _user },
    );

    expect(Integrations.saveMessengerAppearanceData).toBeCalledWith(fakeIntegrationId, uiOptions);
    expect(Integrations.saveMessengerAppearanceData.mock.calls.length).toBe(1);

    // test Integrations.saveMessengerConfigs ===================
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

    await mutations.integrationsSaveMessengerConfigs(
      null,
      {
        _id: fakeIntegrationId,
        messengerData,
      },
      { user: _user },
    );

    expect(Integrations.saveMessengerConfigs).toBeCalledWith(fakeIntegrationId, messengerData);
    expect(Integrations.saveMessengerConfigs.mock.calls.length).toBe(1);

    // test Integrations.createFormIntegration =======================
    let mainDoc = {
      name: 'form integration test',
      brandId: fakeBrandId,
      formId: fakeFormId,
    };

    let formData = {
      loadType: FORM_LOAD_TYPES.EMBEDDED,
    };

    Integrations.createFormIntegration = jest.fn();

    doc = {
      ...mainDoc,
      formData,
    };

    await mutations.integrationsCreateFormIntegration(null, doc, { user: _user });

    expect(Integrations.createFormIntegration).toBeCalledWith(doc);
    expect(Integrations.createFormIntegration.mock.calls.length).toBe(1);

    // test Integrations.updateFormIntegration =====================
    mainDoc = {
      name: 'form integration test 2',
      brandId: fakeBrandId,
      formId: fakeFormId,
    };

    formData = {
      loadType: FORM_LOAD_TYPES.SHOUTBOX,
    };

    doc = {
      _id: fakeIntegrationId,
      ...mainDoc,
      formData,
    };

    Integrations.updateFormIntegration = jest.fn();

    await mutations.integrationsEditFormIntegration(null, doc, { user: _user });

    delete doc._id;

    expect(Integrations.updateFormIntegration).toBeCalledWith(fakeIntegrationId, doc);
    expect(Integrations.updateFormIntegration.mock.calls.length).toBe(1);

    // test Integrations.removeIntegration ===========================
    Integrations.removeIntegration = jest.fn();

    await mutations.integrationsRemove(null, { _id: fakeIntegrationId }, { user: _user });

    expect(Integrations.removeIntegration).toBeCalledWith(fakeIntegrationId);
    expect(Integrations.removeIntegration.mock.calls.length).toBe(1);
  });
});
