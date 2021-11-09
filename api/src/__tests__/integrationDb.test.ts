import * as faker from 'faker';
import * as momentTz from 'moment-timezone';
import {
  brandFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  fieldFactory,
  formFactory,
  integrationFactory,
  userFactory
} from '../db/factories';
import {
  Brands,
  ConversationMessages,
  Forms,
  Integrations,
  Users
} from '../db/models';
import {
  KIND_CHOICES,
  LEAD_LOAD_TYPES,
  MESSENGER_DATA_AVAILABILITY
} from '../db/models/definitions/constants';

import { isTimeInBetween } from '../db/models/Integrations';

import './setup.ts';

describe('messenger integration model add method', () => {
  let _brand;
  let _user;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _user = await userFactory({});
  });

  afterEach(async () => {
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('Get integration', async () => {
    const integration = await integrationFactory({});

    try {
      await Integrations.getIntegration({ _id: 'fakeId' });
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    const response = await Integrations.getIntegration({
      _id: integration._id
    });

    expect(response).toBeDefined();
  });

  test('Find integration', async () => {
    const integration = await integrationFactory({});

    const response = await Integrations.findIntegrations({
      _id: integration._id
    });

    expect(response.length).toBe(1);
  });

  test('update basic info', async () => {
    const integration = await integrationFactory();

    const doc = {
      name: 'updated',
      brandId: 'brandId'
    };

    const response = await Integrations.updateBasicInfo(integration._id, doc);

    expect(response.name).toBe(doc.name);
    expect(response.brandId).toBe(doc.brandId);
  });

  test('update basic info (Error: Integration not found)', async () => {
    const doc = {
      name: 'updated',
      brandId: 'brandId'
    };

    try {
      await Integrations.updateBasicInfo('fakeId', doc);
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }
  });

  test('check if messenger integration create method is running successfully', async () => {
    expect.assertions(4);

    const doc = {
      name: 'Integration test',
      brandId: _brand._id,
      kind: KIND_CHOICES.MESSENGER
    };

    const integration = await Integrations.createMessengerIntegration(
      doc,
      _user._id
    );

    expect(integration.name).toBe(doc.name);
    expect(integration.brandId).toBe(doc.brandId);
    expect(integration.kind).toBe(KIND_CHOICES.MESSENGER);

    try {
      await Integrations.createMessengerIntegration(doc, _user._id);
    } catch (e) {
      expect(e.message).toBe('Duplicated messenger for single brand');
    }
  });
});

describe('messenger integration model edit method', () => {
  let _brand;
  let _integration;
  let _brand2;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _brand2 = await brandFactory({});
    _integration = await integrationFactory({
      kind: KIND_CHOICES.MESSENGER,
      brandId: _brand._id
    });
  });

  afterEach(async () => {
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('check if messenger integration update method is running successfully', async () => {
    const doc = {
      name: 'Integration test 2',
      brandId: _brand2._id,
      kind: KIND_CHOICES.MESSENGER
    };

    const updatedIntegration = await Integrations.updateMessengerIntegration(
      _integration._id,
      doc
    );

    expect(updatedIntegration.name).toBe(doc.name);
    expect(updatedIntegration.brandId).toBe(doc.brandId);
    expect(updatedIntegration.kind).toBe(KIND_CHOICES.MESSENGER);
  });
});

describe('messenger integration model edit with duplicated brand method', () => {
  test('check if messenger integration update method is throwing exception', async () => {
    const _brand = await brandFactory({});
    const _brand2 = await brandFactory({});
    const _integration = await integrationFactory({
      kind: KIND_CHOICES.MESSENGER,
      brandId: _brand._id
    });

    await integrationFactory({
      kind: KIND_CHOICES.MESSENGER,
      brandId: _brand2._id
    });

    const doc = {
      name: 'Integration test 2',
      brandId: _brand2._id,
      kind: KIND_CHOICES.MESSENGER
    };

    try {
      await Integrations.updateMessengerIntegration(_integration._id, doc);
    } catch (e) {
      expect(e.message).toBe('Duplicated messenger for single brand');
    }

    await Brands.deleteMany({});
    await Integrations.deleteMany({});
  });
});

describe('lead integration create model test without leadData', () => {
  let _user;
  let _brand;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _brand = await brandFactory({});
    _form = await formFactory({});
  });

  afterEach(async () => {
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
    await Users.deleteMany({});
    await Forms.deleteMany({});
  });

  test('check if create lead integration test without leadData is throwing exception', async () => {
    expect.assertions(1);

    const mainDoc = {
      name: 'lead integration test',
      brandId: _brand._id,
      formId: _form._id,
      kind: KIND_CHOICES.LEAD
    };

    try {
      await Integrations.createLeadIntegration(mainDoc, _user._id);
    } catch (e) {
      expect(e.message).toEqual('leadData must be supplied');
    }
  });
});

describe('create lead integration', () => {
  let _user;
  let _brand;
  let _form;

  beforeEach(async () => {
    _user = await userFactory({});
    _brand = await brandFactory({});
    _form = await formFactory({});
  });

  afterEach(async () => {
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
    await Users.deleteMany({});
    await Forms.deleteMany({});
  });

  test('test if create lead integration is working successfully', async () => {
    const mainDoc = {
      name: 'lead integration test',
      brandId: _brand._id,
      formId: _form._id,
      kind: KIND_CHOICES.LEAD
    };

    const leadData = {
      loadType: LEAD_LOAD_TYPES.EMBEDDED
    };

    const integration = await Integrations.createLeadIntegration(
      {
        ...mainDoc,
        leadData
      },
      _user._id
    );

    if (!integration || !integration.leadData) {
      throw new Error('Integration not found');
    }

    expect(integration.formId).toEqual(_form._id);
    expect(integration.name).toEqual(mainDoc.name);
    expect(integration.brandId).toEqual(_brand._id);
    expect(integration.leadData.loadType).toEqual(LEAD_LOAD_TYPES.EMBEDDED);
    expect(integration.kind).toEqual(KIND_CHOICES.LEAD);
  });
});

describe('edit lead integration', () => {
  let _brand;
  let _brand2;
  let _form;
  let _leadIntegration;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _brand2 = await brandFactory({});
    _form = await formFactory({});

    _leadIntegration = await integrationFactory({
      name: 'lead integration test',
      brandId: _brand._id,
      formId: _form._id,
      kind: KIND_CHOICES.LEAD,
      leadData: {
        loadType: LEAD_LOAD_TYPES.EMBEDDED
      }
    });
  });

  afterEach(async () => {
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
    await Users.deleteMany({});
    await Forms.deleteMany({});
  });

  test('create external integration', async () => {
    const brand = await brandFactory();
    const user = await userFactory();

    const doc = {
      name: 'external',
      kind: KIND_CHOICES.FACEBOOK_MESSENGER,
      brandId: brand._id,
      accountId: 'accountId'
    };

    const integration = await Integrations.createExternalIntegration(
      doc,
      user._id
    );

    expect(integration.name).toBe(doc.name);
    expect(integration.kind).toBe(doc.kind);
    expect(integration.brandId).toBe(doc.brandId);
  });

  test('test if integration lead update method is running successfully', async () => {
    const mainDoc = {
      name: 'lead integration test 2',
      brandId: _brand2._id,
      formId: _form._id,
      kind: KIND_CHOICES.LEAD
    };

    const leadData = {
      loadType: LEAD_LOAD_TYPES.SHOUTBOX
    };

    const integration = await Integrations.updateLeadIntegration(
      _leadIntegration._id,
      {
        ...mainDoc,
        leadData
      }
    );

    if (!integration || !integration.leadData) {
      throw new Error('Integration not found');
    }

    expect(integration.name).toEqual(mainDoc.name);
    expect(integration.formId).toEqual(_form._id);
    expect(integration.brandId).toEqual(_brand2._id);
    expect(integration.leadData.loadType).toEqual(LEAD_LOAD_TYPES.SHOUTBOX);

    const integrationNoLeadData = await Integrations.updateLeadIntegration(
      _leadIntegration._id,
      {
        ...mainDoc
      }
    );

    expect(
      integrationNoLeadData.leadData &&
        integrationNoLeadData.leadData.adminEmails
    ).toHaveLength(0);
    expect(
      integrationNoLeadData.leadData && integrationNoLeadData.leadData.rules
    ).toHaveLength(0);
  });
});

describe('remove integration model method test', () => {
  let _brand;
  let _form;
  let _integration;
  let _conversation;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _form = await formFactory();

    await fieldFactory({ contentType: 'form', contentTypeId: _form._id });

    _integration = await integrationFactory({
      name: 'lead integration test',
      brandId: _brand._id,
      formId: _form._id,
      kind: 'lead'
    });

    _conversation = await conversationFactory({
      integrationId: _integration._id
    });

    await conversationMessageFactory({ conversationId: _conversation._id });
    await conversationMessageFactory({ conversationId: _conversation._id });

    await customerFactory({ integrationId: _integration._id });
  });

  afterEach(async () => {
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
    await Users.deleteMany({});
    await Forms.deleteMany({});
    await ConversationMessages.deleteMany({});
  });

  test('test if remove lead integration model method is working successfully', async () => {
    try {
      await Integrations.removeIntegration('fakeId');
    } catch (e) {
      expect(e.message).toBe('Integration not found');
    }

    await Integrations.removeIntegration(_integration._id);

    expect(await Integrations.find({}).countDocuments()).toEqual(0);
    expect(await ConversationMessages.find({}).countDocuments()).toBe(0);
    expect(await Forms.find({}).countDocuments()).toBe(0);

    const integrationNoForm = await integrationFactory();

    await Integrations.removeIntegration(integrationNoForm._id);

    expect(await Integrations.find({}).countDocuments()).toEqual(0);
  });
});

describe('save integration messenger appearance test', () => {
  let _brand;
  let _integration;

  beforeEach(async () => {
    _brand = await brandFactory({});
    _integration = await integrationFactory({
      name: 'messenger integration test',
      brandId: _brand._id,
      kind: 'messenger'
    });
  });

  afterEach(async () => {
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
  });

  test('test if save integration messenger appearance method is working successfully', async () => {
    const uiOptions = {
      color: faker.random.word(),
      wallpaper: faker.random.word(),
      logo: faker.random.word()
    };

    const integration = await Integrations.saveMessengerAppearanceData(
      _integration._id,
      uiOptions
    );

    if (!integration || !integration.uiOptions) {
      throw new Error('Integration not found');
    }

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
      kind: KIND_CHOICES.MESSENGER
    });
  });

  afterEach(async () => {
    await Brands.deleteMany({});
    await Integrations.deleteMany({});
  });

  test(`test if messenger integration save confiturations
    method is working correctly`, async () => {
    const messengerData = {
      notifyCustomer: true,
      availabilityMethod: MESSENGER_DATA_AVAILABILITY.MANUAL,
      isOnline: false,
      onlineHours: [
        {
          day: 'monday',
          from: '8:00 AM',
          to: '12:00 PM'
        },
        {
          day: 'monday',
          from: '2:00 PM',
          to: '6:00 PM'
        }
      ],
      timezone: momentTz.tz.guess(true),
      messages: {
        en: {
          welcome: 'Welcome user',
          away: 'Bye bye',
          thank: 'Thank you'
        }
      }
    };

    const integration = await Integrations.saveMessengerConfigs(
      _integration._id,
      messengerData
    );

    if (
      !integration ||
      !integration.messengerData ||
      !integration.messengerData.onlineHours ||
      !integration.messengerData.messages
    ) {
      throw new Error('Integration not found');
    }

    expect(integration.messengerData.notifyCustomer).toEqual(
      messengerData.notifyCustomer
    );
    expect(integration.messengerData.availabilityMethod).toEqual(
      messengerData.availabilityMethod
    );
    expect(integration.messengerData.isOnline).toEqual(messengerData.isOnline);
    expect(integration.messengerData.onlineHours[0].day).toEqual(
      messengerData.onlineHours[0].day
    );
    expect(integration.messengerData.onlineHours[0].from).toEqual(
      messengerData.onlineHours[0].from
    );
    expect(integration.messengerData.onlineHours[0].to).toEqual(
      messengerData.onlineHours[0].to
    );
    expect(integration.messengerData.onlineHours[1].day).toEqual(
      messengerData.onlineHours[1].day
    );
    expect(integration.messengerData.onlineHours[1].from).toEqual(
      messengerData.onlineHours[1].from
    );
    expect(integration.messengerData.onlineHours[1].to).toEqual(
      messengerData.onlineHours[1].to
    );
    expect(integration.messengerData.timezone).toEqual(messengerData.timezone);
    expect(integration.messengerData.messages.en.welcome).toEqual(
      messengerData.messages.en.welcome
    );
    expect(integration.messengerData.messages.en.away).toEqual(
      messengerData.messages.en.away
    );
    expect(integration.messengerData.messages.en.thank).toEqual(
      messengerData.messages.en.thank
    );

    const newMessengerData = {
      notifyCustomer: false,
      availabilityMethod: MESSENGER_DATA_AVAILABILITY.AUTO,
      isOnline: true,
      onlineHours: [
        {
          day: 'tuesday',
          from: '9:00 AM',
          to: '1:00 PM'
        },
        {
          day: 'tuesday',
          from: '3:00 PM',
          to: '7:00 PM'
        }
      ],
      timezone: 'EET',
      messages: {
        en: {
          welcome: 'Welcome user',
          away: 'Bye bye',
          thank: 'Thank you'
        }
      }
    };

    const updatedIntegration = await Integrations.saveMessengerConfigs(
      _integration._id,
      newMessengerData
    );

    if (
      !updatedIntegration ||
      !updatedIntegration.messengerData ||
      !updatedIntegration.messengerData.onlineHours
    ) {
      throw new Error('Integration not found');
    }

    expect(updatedIntegration.messengerData.notifyCustomer).toEqual(
      newMessengerData.notifyCustomer
    );
    expect(updatedIntegration.messengerData.availabilityMethod).toEqual(
      newMessengerData.availabilityMethod
    );
    expect(updatedIntegration.messengerData.isOnline).toEqual(
      newMessengerData.isOnline
    );
    expect(updatedIntegration.messengerData.onlineHours[0].day).toEqual(
      newMessengerData.onlineHours[0].day
    );
    expect(updatedIntegration.messengerData.onlineHours[0].from).toEqual(
      newMessengerData.onlineHours[0].from
    );
    expect(updatedIntegration.messengerData.onlineHours[0].to).toEqual(
      newMessengerData.onlineHours[0].to
    );
    expect(updatedIntegration.messengerData.onlineHours[1].day).toEqual(
      newMessengerData.onlineHours[1].day
    );
    expect(updatedIntegration.messengerData.onlineHours[1].from).toEqual(
      newMessengerData.onlineHours[1].from
    );
    expect(updatedIntegration.messengerData.onlineHours[1].to).toEqual(
      newMessengerData.onlineHours[1].to
    );
    expect(updatedIntegration.messengerData.timezone).toEqual(
      newMessengerData.timezone
    );
    expect(integration.messengerData.messages.en.welcome).toEqual(
      messengerData.messages.en.welcome
    );
    expect(integration.messengerData.messages.en.away).toEqual(
      messengerData.messages.en.away
    );
    expect(integration.messengerData.messages.en.thank).toEqual(
      messengerData.messages.en.thank
    );
  });

  test('Increase view count of lead', async () => {
    expect.assertions(2);

    let updated = await Integrations.increaseViewCount(
      _integration.formId,
      true
    );

    expect(updated.leadData && updated.leadData.viewCount).toBe(1);

    updated = await Integrations.increaseViewCount(_integration.formId, true);
    expect(updated.leadData && updated.leadData.viewCount).toBe(2);
  });

  test('Increase contacts gathered', async () => {
    expect.assertions(2);

    let updated = await Integrations.increaseContactsGathered(
      _integration.formId,
      true
    );

    expect(updated.leadData && updated.leadData.contactsGathered).toBe(1);

    updated = await Integrations.increaseContactsGathered(
      _integration.formId,
      true
    );
    expect(updated.leadData && updated.leadData.contactsGathered).toBe(2);
  });

  describe('Manual mode', () => {
    test('empty', async () => {
      const integration = await integrationFactory({});
      expect(Integrations.isOnline(integration)).toBeFalsy();
    });

    test('isOnline() must return status as it is', async () => {
      const integration = await integrationFactory({
        messengerData: {
          availabilityMethod: 'manual'
        }
      });

      if (!integration.messengerData) {
        throw new Error('Messenger data undefined');
      }

      // online
      integration.messengerData.isOnline = true;
      expect(Integrations.isOnline(integration)).toBeTruthy();

      // offline
      integration.messengerData.isOnline = false;
      expect(Integrations.isOnline(integration)).toBeFalsy();
    });
  });

  describe('Auto mode', () => {
    test('isTimeInBetween()', () => {
      const time1 = '9:00 AM';
      const time2 = '6:00 PM';
      const timezone = momentTz.tz.guess(true);

      expect(
        isTimeInBetween(timezone, new Date('2017/05/08 11:10 AM'), time1, time2)
      ).toBeTruthy();
      expect(
        isTimeInBetween(timezone, new Date('2017/05/08 7:00 PM'), time1, time2)
      ).toBeFalsy();
    });

    test('isOnline() must return false if there is no config for current day', async () => {
      const integration = await integrationFactory({
        messengerData: {
          availabilityMethod: 'auto',
          onlineHours: [
            {
              day: 'tuesday',
              from: '9:00 AM',
              to: '5:00 PM'
            }
          ]
        }
      });

      // 2017-05-08, monday
      expect(
        Integrations.isOnline(integration, new Date('2017/05/08 11:10 AM'))
      ).toBeFalsy();
    });

    test('isOnline() for specific day', async () => {
      const integration = await integrationFactory({
        messengerData: {
          availabilityMethod: 'auto',
          onlineHours: [
            {
              day: 'tuesday',
              from: '9:00 AM',
              to: '5:00 PM'
            }
          ]
        }
      });

      // 2017-05-09, tuesday
      expect(
        Integrations.isOnline(integration, new Date('2017/05/09 06:10 PM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/09 09:01 AM'))
      ).toBeTruthy();
    });

    test('isOnline() for everyday', async () => {
      const integration = await integrationFactory({
        messengerData: {
          availabilityMethod: 'auto',
          onlineHours: [
            {
              day: 'everyday',
              from: '9:00 AM',
              to: '5:00 PM'
            }
          ],
          timezone: momentTz.tz.guess(true)
        }
      });

      // monday -> sunday
      expect(
        Integrations.isOnline(integration, new Date('2017/05/08 10:00 AM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/09 11:00 AM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/10 12:00 PM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/11 1:00 PM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/12 2:00 PM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/13 3:00 PM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/14 3:30 PM'))
      ).toBeTruthy();

      // monday -> sunday
      expect(
        Integrations.isOnline(integration, new Date('2017/05/08 1:00 AM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/09 4:00 AM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/10 5:00 AM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/11 6:00 AM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/12 6:00 PM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/13 7:00 PM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/14 8:00 PM'))
      ).toBeFalsy();
    });

    test('isOnline() for weekdays', async () => {
      const integration = await integrationFactory({
        messengerData: {
          availabilityMethod: 'auto',
          onlineHours: [
            {
              day: 'weekdays',
              from: '9:00 AM',
              to: '5:00 PM'
            }
          ],
          timezone: momentTz.tz.guess(true)
        }
      });

      // weekdays
      expect(
        Integrations.isOnline(integration, new Date('2017/05/08 10:00 AM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/09 11:00 AM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/10 12:00 PM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/11 1:00 PM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/12 2:00 PM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/11 11:00 PM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/12 8:00 AM'))
      ).toBeFalsy();

      // weekend
      expect(
        Integrations.isOnline(integration, new Date('2017/05/13 10:00 AM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/14 11:00 AM'))
      ).toBeFalsy();
    });

    test('isOnline() for weekend', async () => {
      const integration = await integrationFactory({
        messengerData: {
          availabilityMethod: 'auto',
          onlineHours: [
            {
              day: 'weekends',
              from: '9:00 AM',
              to: '5:00 PM'
            }
          ],
          timezone: momentTz.tz.guess(true)
        }
      });

      // weekdays
      expect(
        Integrations.isOnline(integration, new Date('2017/05/08 10:00 AM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/09 11:00 AM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/10 12:00 PM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/11 1:00 PM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/12 2:00 PM'))
      ).toBeFalsy();

      // weekend
      expect(
        Integrations.isOnline(integration, new Date('2017/05/13 10:00 AM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/14 11:00 AM'))
      ).toBeTruthy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/13 07:00 AM'))
      ).toBeFalsy();
      expect(
        Integrations.isOnline(integration, new Date('2017/05/14 11:00 PM'))
      ).toBeFalsy();
    });
  });

  test('getWidgetIntegration', async () => {
    expect.assertions(4);

    try {
      await Integrations.getWidgetIntegration('_id', 'messenger');
    } catch (e) {
      expect(e.message).toBe('Brand not found');
    }

    const brand = await brandFactory({});
    const integration = await integrationFactory({
      brandId: brand._id,
      kind: 'messenger'
    });

    // brandObject false
    let response = await Integrations.getWidgetIntegration(
      brand.code || '',
      'messenger'
    );

    expect(response._id).toBe(integration._id);

    // brandObject true
    response = await Integrations.getWidgetIntegration(
      brand.code || '',
      'messenger',
      true
    );

    expect(response.integration._id).toBe(integration._id);
    expect(response.brand._id).toBe(brand._id);
  });
});
