/* eslint-env jest */
/* eslint-disable no-underscore-dangle */
import faker from 'faker';
import { connect, disconnect } from '../db/connection';
import { brandFactory, integrationFactory, formFactory, userFactory } from '../db/factories';
import { Integrations, Brands, Users, Forms } from '../db/models';
import mutations from '../data/resolvers/mutations';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('messenger integration add test', () => {
  let _brand;
  /**
   */
  beforeEach(async () => {
    _brand = await brandFactory({});
  });

  /**
   */
  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
  });

  test('messenger integration add test', async () => {
    const integration = await Integrations.createMessengerIntegration({
      name: 'Integration test',
      brandId: _brand._id,
    });

    expect(integration.name).toBe('Integration test');
    expect(integration.brandId).toBe(_brand._id);
    expect(integration.kind).toBe('messenger');
  });
});

describe('messenger integration edit test', () => {
  let _brand;
  let _integration;
  /**
   */
  beforeEach(async () => {
    _brand = await brandFactory({});
    _integration = await integrationFactory({
      kind: 'messenger',
    });
  });

  /**
   */
  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
  });

  test('messenger integration edit test', async () => {
    await Integrations.updateMessengerIntegration(_integration._id, {
      name: 'Integration test 2',
      brandId: _brand._id,
      kind: 'new kind',
    });

    const updatedIntegration = await Integrations.findOne({ _id: _integration._id });

    expect(updatedIntegration.name).toBe('Integration test 2');
    expect(updatedIntegration.brandId).toBe(_brand._id);
    expect(updatedIntegration.kind).toBe('messenger');
  });
});

describe('create form integration test without formData', () => {
  let _brand;
  let _form;
  let _user;
  /**
   */
  beforeEach(async () => {
    _brand = await brandFactory({});
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
  });

  /**
   */
  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
    await Users.remove({});
    await Forms.remove({});
  });

  test('create form integration test wihtout formData', async () => {
    expect.assertions(1);
    const mainDoc = {
      name: 'form integration test',
      brandId: _brand._id,
      formId: _form._id,
    };

    try {
      await Integrations.createFormIntegration(mainDoc);
    } catch (e) {
      expect(e).toEqual('formData must be supplied');
    }
  });
});

describe('create form integration test', () => {
  let _brand;
  let _form;
  let _user;
  /**
   */
  beforeEach(async () => {
    _brand = await brandFactory({});
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
  });

  /**
   */
  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
    await Users.remove({});
    await Forms.remove({});
  });

  test('create form integration test without formData', async () => {
    const mainDoc = {
      name: 'form integration test',
      brandId: _brand._id,
      formId: _form._id,
    };

    const formData = {
      loadType: 'embedded',
    };

    const integration = await Integrations.createFormIntegration({ ...mainDoc, formData });

    expect(integration.formId).toEqual(_form._id);
    expect(integration.name).toEqual('form integration test');
    expect(integration.brandId).toEqual(_brand._id);
    expect(integration.formData.loadType).toEqual('embedded');
    expect(integration.kind).toEqual('form');
  });
});

describe('edit form integration test', () => {
  let _brand;
  let _brand2;
  let _form;
  let _form2;
  let _user;
  let _form_integration;
  /**
   */
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
      kind: 'form',
      formData: {
        loadType: 'embedded',
      },
    });
  });

  /**
   */
  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
    await Users.remove({});
    await Forms.remove({});
  });

  test('edit form integration  test', async () => {
    const mainDoc = {
      name: 'form integration test 2',
      brandId: _brand2._id,
      formId: _form2._id,
    };

    const formData = {
      loadType: 'shoutbox',
    };

    await Integrations.updateFormIntegration(_form_integration._id, {
      ...mainDoc,
      formData,
    });

    const integration = await Integrations.findOne({ _id: _form_integration._id });

    expect(integration.name).toEqual('form integration test 2');
    expect(integration.formId).toEqual(_form2._id);
    expect(integration.brandId).toEqual(_brand2._id);
    expect(integration.formData.loadType).toEqual('shoutbox');
  });
});

describe('remove integration test', () => {
  let _brand;
  let _integration;
  /**
   */
  beforeEach(async () => {
    _brand = await brandFactory({});
    _integration = await integrationFactory({
      name: 'form integration test',
      brandId: _brand._id,
      kind: 'form',
    });
  });

  /**
   */
  afterEach(async () => {
    await Brands.remove({});
    await Integrations.remove({});
  });

  test('remove form integration test', async () => {
    await mutations.integrationsRemove(null, { id: _integration._id });
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

  test('save integration messenger appearance test', async () => {
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

  test('save integration messenger configurations test', async () => {
    const messengerData = {
      notifyCustomer: true,
      availabilityMethod: 'manual',
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

    expect(integration.messengerData.notifyCustomer).toEqual(true);
    expect(integration.messengerData.availabilityMethod).toEqual('manual');
    expect(integration.messengerData.isOnline).toEqual(false);
    expect(integration.messengerData.onlineHours[0].day).toEqual('Monday');
    expect(integration.messengerData.onlineHours[0].from).toEqual('8am');
    expect(integration.messengerData.onlineHours[0].to).toEqual('12pm');
    expect(integration.messengerData.onlineHours[1].day).toEqual('Monday');
    expect(integration.messengerData.onlineHours[1].from).toEqual('2pm');
    expect(integration.messengerData.onlineHours[1].to).toEqual('6pm');
    expect(integration.messengerData.timezone).toEqual('CET');
    expect(integration.messengerData.welcomeMessage).toEqual('Welcome user');
    expect(integration.messengerData.awayMessage).toEqual('Bye bye');
    expect(integration.messengerData.thankYouMessage).toEqual('Thank you');

    const newMessengerData = {
      notifyCustomer: false,
      availabilityMethod: 'auto',
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

    expect(updatedIntegration.messengerData.notifyCustomer).toEqual(false);
    expect(updatedIntegration.messengerData.availabilityMethod).toEqual('auto');
    expect(updatedIntegration.messengerData.isOnline).toEqual(true);
    expect(updatedIntegration.messengerData.onlineHours[0].day).toEqual('Tuesday');
    expect(updatedIntegration.messengerData.onlineHours[0].from).toEqual('9am');
    expect(updatedIntegration.messengerData.onlineHours[0].to).toEqual('1pm');
    expect(updatedIntegration.messengerData.onlineHours[1].day).toEqual('Tuesday');
    expect(updatedIntegration.messengerData.onlineHours[1].from).toEqual('3pm');
    expect(updatedIntegration.messengerData.onlineHours[1].to).toEqual('7pm');
    expect(updatedIntegration.messengerData.timezone).toEqual('EET');
    expect(updatedIntegration.messengerData.welcomeMessage).toEqual('Welcome customer');
    expect(updatedIntegration.messengerData.awayMessage).toEqual('Good bye');
    expect(updatedIntegration.messengerData.thankYouMessage).toEqual('Gracias');
  });
});

describe('mutation test', () => {
  let _brand;
  let _brand2;
  let _user;
  let _form;
  let _form2;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _brand2 = await brandFactory({});
    _user = await userFactory({});
    _form = await formFactory({ createdUserId: _user._id });
    _form2 = await formFactory({ createdUserId: _user._id });
  }),
    afterEach(async () => {
      await Brands.remove({});
      await Integrations.remove({});
      await Users.remove({});
      await Forms.remove({});
    });

  test('mutation test', async () => {
    let integration = await mutations.integrationsCreateMessengerIntegration(null, {
      name: 'Integration test',
      brandId: _brand._id,
    });

    expect(integration.name).toBe('Integration test');
    expect(integration.brandId).toBe(_brand._id);
    expect(integration.kind).toBe('messenger');

    await mutations.integrationsEditMessengerIntegration(null, {
      id: integration._id,
      name: 'Integration test 2',
      brandId: _brand2._id,
    });

    integration = await Integrations.findOne({ _id: integration._id });

    expect(integration.name).toEqual('Integration test 2');
    expect(integration.brandId).toEqual(_brand2._id);

    const uiOptions = {
      color: faker.random.word(),
      wallpaper: faker.random.word(),
      logo: faker.random.word(),
    };

    await mutations.integrationsSaveMessengerAppearanceData(null, {
      id: integration._id,
      uiOptions,
    });

    integration = await Integrations.findOne({ _id: integration._id });

    expect(integration.uiOptions.color).toEqual(uiOptions.color);
    expect(integration.uiOptions.wallpaper).toEqual(uiOptions.wallpaper);
    expect(integration.uiOptions.logo).toEqual(uiOptions.logo);

    let mainDoc = {
      name: 'form integration test',
      brandId: _brand._id,
      formId: _form._id,
    };

    let formData = {
      loadType: 'embedded',
    };

    let integration2 = await mutations.integrationsCreateFormIntegration(null, {
      ...mainDoc,
      formData,
    });
    expect(integration2.formId).toEqual(_form._id);
    expect(integration2.name).toEqual('form integration test');
    expect(integration2.brandId).toEqual(_brand._id);
    expect(integration2.formData.loadType).toEqual('embedded');

    mainDoc = {
      name: 'form integration test 2',
      brandId: _brand2._id,
      formId: _form2._id,
    };

    formData = {
      loadType: 'shoutbox',
    };

    await mutations.integrationsEditFormIntegration(null, {
      id: integration2._id,
      ...mainDoc,
      formData,
    });

    const updatedIntegration = await Integrations.findOne({ _id: integration2._id });

    expect(updatedIntegration.name).toEqual('form integration test 2');
    expect(updatedIntegration.formId).toEqual(_form2._id);
    expect(updatedIntegration.brandId).toEqual(_brand2._id);
    expect(updatedIntegration.formData.loadType).toEqual('shoutbox');

    const messengerData = {
      notifyCustomer: true,
      availabilityMethod: 'manual',
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

    await mutations.integrationsSaveMessengerConfigs(null, { id: integration._id, messengerData });

    integration = await Integrations.findOne({ _id: integration._id });

    expect(integration.messengerData.notifyCustomer).toEqual(true);
    expect(integration.messengerData.availabilityMethod).toEqual('manual');
    expect(integration.messengerData.isOnline).toEqual(false);
    expect(integration.messengerData.onlineHours[0].day).toEqual('Monday');
    expect(integration.messengerData.onlineHours[0].from).toEqual('8am');
    expect(integration.messengerData.onlineHours[0].to).toEqual('12pm');
    expect(integration.messengerData.onlineHours[1].day).toEqual('Monday');
    expect(integration.messengerData.onlineHours[1].from).toEqual('2pm');
    expect(integration.messengerData.onlineHours[1].to).toEqual('6pm');
    expect(integration.messengerData.timezone).toEqual('CET');
    expect(integration.messengerData.welcomeMessage).toEqual('Welcome user');
    expect(integration.messengerData.awayMessage).toEqual('Bye bye');
    expect(integration.messengerData.thankYouMessage).toEqual('Thank you');

    const integrations = await Integrations.find({}, { _id: 1 });
    for (let i of integrations) {
      await mutations.integrationsRemove(null, { id: i._id });
    }

    const integrationCount = await Integrations.find({}).count();
    expect(integrationCount).toEqual(0);
  });
});
