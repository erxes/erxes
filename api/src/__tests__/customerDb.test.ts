import {
  conformityFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  dealFactory,
  fieldFactory,
  integrationFactory,
  internalNoteFactory,
  userFactory
} from '../db/factories';
import {
  Conformities,
  ConversationMessages,
  Conversations,
  Customers,
  Deals,
  ImportHistory,
  InternalNotes
} from '../db/models';
import { ACTIVITY_CONTENT_TYPES } from '../db/models/definitions/constants';

import * as sinon from 'sinon';
import * as utils from '../data/utils';
import {
  ICustomer,
  ICustomerDocument
} from '../db/models/definitions/customers';
import './setup.ts';

describe('Customers model tests', () => {
  let _customer;

  beforeEach(async () => {
    _customer = await customerFactory({
      primaryEmail: 'email@gmail.com',
      emails: ['email@gmail.com', 'otheremail@gmail.com'],
      primaryPhone: '+99922210',
      phones: ['+99922210', '+99922211'],
      code: 'code'
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.deleteMany({});
    await ImportHistory.deleteMany({});
  });

  test('Get customer', async () => {
    try {
      await Customers.getCustomer('fakeId');
    } catch (e) {
      expect(e.message).toBe('Customer not found');
    }

    const response = await Customers.getCustomer(_customer._id);

    expect(response).toBeDefined();
  });

  test('Get customer name', async () => {
    let customer = await customerFactory({});
    let response = await Customers.getCustomerName(customer);
    expect(response).toBe('Unknown');

    customer = await customerFactory({ firstName: 'firstName' });
    response = await Customers.getCustomerName(customer);
    expect(response).toBe('firstName ');

    customer = await customerFactory({ lastName: 'lastName' });
    response = await Customers.getCustomerName(customer);
    expect(response).toBe(' lastName');

    customer = await customerFactory({
      firstName: 'firstName',
      lastName: 'lastName'
    });
    response = await Customers.getCustomerName(customer);
    expect(response).toBe('firstName lastName');

    customer = await customerFactory({ primaryEmail: 'primaryEmail' });
    response = await Customers.getCustomerName(customer);
    expect(response).toBe('primaryEmail');

    customer = await customerFactory({ primaryPhone: 'primaryPhone' });
    response = await Customers.getCustomerName(customer);
    expect(response).toBe('primaryPhone');

    customer = await customerFactory({
      visitorContactInfo: { phone: 8880, email: 'email@yahoo.com' }
    });
    response = await Customers.getCustomerName(customer);
    expect(response).toBe('8880');

    customer = await customerFactory({
      visitorContactInfo: { email: 'email@yahoo.com' }
    });
    response = await Customers.getCustomerName(customer);
    expect(response).toBe('email@yahoo.com');
  });

  test('Create customer', async () => {
    // check duplication ===============

    try {
      await Customers.createCustomer({ primaryEmail: 'email@gmail.com' });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    try {
      await Customers.createCustomer({ primaryEmail: 'otheremail@gmail.com' });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    try {
      await Customers.createCustomer({ primaryPhone: '+99922210' });
    } catch (e) {
      expect(e.message).toBe('Duplicated phone');
    }

    try {
      await Customers.createCustomer({ primaryPhone: '+99922211' });
    } catch (e) {
      expect(e.message).toBe('Duplicated phone');
    }

    try {
      await Customers.createCustomer({ code: 'code' });
    } catch (e) {
      expect(e.message).toBe('Duplicated code');
    }

    // Create without any error
    const doc: ICustomer = {
      primaryEmail: 'dombo@yahoo.com',
      emails: ['dombo@yahoo.com'],
      firstName: 'firstName',
      lastName: 'lastName',
      primaryPhone: '+12312132',
      phones: ['12312132'],
      code: 'code1234',
      state: 'lead'
    };

    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    let customerObj = await Customers.createCustomer(doc);

    expect(customerObj.createdAt).toBeDefined();
    expect(customerObj.modifiedAt).toBeDefined();
    expect(customerObj.firstName).toBe(doc.firstName);
    expect(customerObj.lastName).toBe(doc.lastName);
    expect(customerObj.primaryEmail).toBe(doc.primaryEmail);
    expect(customerObj.emails).toEqual(
      expect.arrayContaining(doc.emails || [])
    );
    expect(customerObj.primaryPhone).toBe(doc.primaryPhone);
    expect(customerObj.phones).toEqual(
      expect.arrayContaining(doc.phones || [])
    );
    expect(customerObj.searchText).toEqual(
      'dombo@yahoo.com 12312132 firstName lastName code1234'
    );

    customerObj = await Customers.createCustomer(
      {
        visitorContactInfo: {}
      },
      await userFactory()
    );

    expect(customerObj).toBeDefined();
    mock.restore();
  });

  test('Create visitor', async () => {
    const customerId = await Customers.createVisitor();

    expect(customerId).toBeDefined();
  });

  test('Create customer: searchText', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });
    const doc = {
      primaryEmail: 'dombo@yahoo.com',
      primaryPhone: '+12312132'
    };

    const customerObj = await Customers.createCustomer(doc);

    expect(customerObj.searchText).toEqual('dombo@yahoo.com +12312132');
    mock.restore();
  });

  test('Create customer: with customer fields validation error', async () => {
    expect.assertions(1);

    const field = await fieldFactory({ validation: 'number' });

    if (!field) {
      throw new Error('Field not found');
    }

    try {
      await Customers.createCustomer({
        primaryEmail: 'email',
        emails: ['dombo@yahoo.com'],
        customFieldsData: [{ field: field._id, value: 'invalid number' }]
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('Update customer', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    expect.assertions(6);

    const previousCustomer = await customerFactory({
      primaryEmail: 'dombo@yahoo.com',
      emails: ['dombo@yahoo.com']
    });

    const doc = {
      firstName: 'Dombo',
      primaryEmail: 'dombo@yahoo.com',
      emails: ['dombo@yahoo.com'],
      primaryPhone: '+242442200',
      phones: ['242442200']
    };

    // test duplication
    try {
      await Customers.updateCustomer(_customer._id, doc);
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // remove previous duplicated entry
    await Customers.deleteOne({ _id: previousCustomer._id });

    let customerObj = await Customers.updateCustomer(_customer._id, doc);

    expect(customerObj.modifiedAt).toBeDefined();
    expect(customerObj.firstName).toBe(doc.firstName);
    expect(customerObj.primaryEmail).toBe(doc.primaryEmail);
    expect(customerObj.primaryPhone).toBe(doc.primaryPhone);

    customerObj = await Customers.updateCustomer(_customer._id, {
      primaryEmail: ''
    });

    expect(customerObj.primaryEmail).toBe('');

    mock.restore();
  });

  test('Mark customer as inactive', async () => {
    const customer = await customerFactory({
      isOnline: true
    });

    const customerObj = await Customers.markCustomerAsNotActive(customer._id);

    if (!customerObj || !customerObj) {
      throw new Error('Customer not found');
    }

    expect(customerObj.isOnline).toBe(false);
    expect(customerObj.lastSeenAt).toBeDefined();
  });

  test('Update customer: with customer fields validation error', async () => {
    expect.assertions(1);

    const field = await fieldFactory({ validation: 'number' });

    if (!field) {
      throw new Error('Field not found');
    }

    try {
      await Customers.updateCustomer(_customer._id, {
        primaryEmail: 'email',
        emails: ['dombo@yahoo.com'],
        customFieldsData: [{ field: field._id, value: 'invalid number' }]
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('removeCustomer', async () => {
    const customer = await customerFactory({});

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id
    });

    const conversation = await conversationFactory({
      customerId: customer._id
    });

    await conversationFactory({
      customerId: customer._id
    });

    await conversationMessageFactory({
      conversationId: conversation._id,
      customerId: customer._id
    });

    await Customers.removeCustomers([customer._id]);

    const internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id
    });

    expect(await Customers.find({ _id: customer._id })).toHaveLength(0);
    expect(internalNote).toHaveLength(0);
    expect(await Conversations.find({ customerId: customer._id })).toHaveLength(
      0
    );
    expect(
      await ConversationMessages.find({ customerId: customer._id })
    ).toHaveLength(0);
  });

  test('Merge customers: without emails or phones', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });
    const visitor1 = await customerFactory({});
    const visitor2 = await customerFactory({});

    const customerIds = [visitor1._id, visitor2._id];

    const merged = await Customers.mergeCustomers(customerIds, {
      primaryEmail: 'merged@gmail.com',
      primaryPhone: '+2555225'
    });

    expect(merged.emails).toContain('merged@gmail.com');
    expect(merged.phones).toContain('+2555225');
    mock.restore();
  });

  test('Merge customers: without primaryEmail and primaryPhone', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });
    const visitor1 = await customerFactory({});
    const visitor2 = await customerFactory({});

    const customerIds = [visitor1._id, visitor2._id];

    const merged = await Customers.mergeCustomers(customerIds, {});

    expect(merged.emails).toHaveLength(0);
    expect(merged.phones).toHaveLength(0);
    mock.restore();
  });

  test('Merge customers', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    expect.assertions(19);

    const integration = await integrationFactory({});

    const customer1 = await customerFactory({
      tagIds: ['2343', '234', '234'],
      integrationId: integration._id
    });
    const customer2 = await customerFactory({
      tagIds: ['qwe', '2343', '123'],
      integrationId: integration._id
    });

    await ['123', '1234', '12345'].map(async item => {
      await conformityFactory({
        mainType: 'company',
        mainTypeId: item,
        relType: 'customer',
        relTypeId: customer1._id
      });
    });

    await ['123', '456', '45678'].map(async item => {
      await conformityFactory({
        mainType: 'customer',
        mainTypeId: customer2._id,
        relType: 'company',
        relTypeId: item
      });
    });

    if (!customer1 || !customer1.tagIds) {
      throw new Error('Customer1 not found');
    }

    if (!customer2 || !customer2.tagIds) {
      throw new Error('Customer2 not found');
    }

    const customerIds = [customer1._id, customer2._id];

    const mergedTagIds = Array.from(
      new Set(customer1.tagIds.concat(customer2.tagIds))
    );

    try {
      await Customers.mergeCustomers(customerIds, {
        primaryEmail: 'email@gmail.com'
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // Merge without any errors ===========
    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customerIds[0]
    });

    await conversationFactory({
      customerId: customerIds[0]
    });

    await conversationMessageFactory({
      customerId: customerIds[0]
    });

    const deal1 = await dealFactory({});

    customerIds.map(async customerId => {
      await conformityFactory({
        mainType: 'deal',
        mainTypeId: deal1._id,
        relType: 'customer',
        relTypeId: customerId
      });
    });

    const processState = process.env.ELK_SYNCER;
    process.env.ELK_SYNCER = 'false';

    // Merging both customers companyIds and tagIds
    const mergedCompanyIds = await Conformities.filterConformity({
      mainType: 'customer',
      mainTypeIds: customerIds,
      relType: 'company'
    });

    const doc = {
      firstName: 'Test first name',
      lastName: 'Test last name',
      primaryEmail: 'Test email',
      primaryPhone: '+12049124',
      messengerData: {
        sessionCount: 6
      },
      visitorContactInfo: {
        email: 'test123@gmail.com',
        phone: '1213312132'
      },
      ownerId: '456'
    };

    const mergedCustomer = await Customers.mergeCustomers(
      [...customerIds, 'fakeId'],
      doc
    );

    if (!mergedCustomer || !mergedCustomer.visitorContactInfo) {
      throw new Error('Merged customer not found');
    }

    expect(mergedCustomer.integrationId).toBeDefined();
    expect(mergedCustomer.firstName).toBe(doc.firstName);
    expect(mergedCustomer.lastName).toBe(doc.lastName);
    expect(mergedCustomer.primaryEmail).toBe(doc.primaryEmail);
    expect(mergedCustomer.primaryPhone).toBe(doc.primaryPhone);

    const companyIds = await Conformities.savedConformity({
      mainType: 'customer',
      relTypes: ['company'],
      mainTypeId: mergedCustomer._id
    });
    expect(mergedCompanyIds.sort()).toEqual(companyIds.sort());

    expect(mergedCustomer.tagIds).toEqual(expect.arrayContaining(mergedTagIds));
    expect(mergedCustomer.visitorContactInfo.toJSON()).toEqual(
      doc.visitorContactInfo
    );
    expect(mergedCustomer.ownerId).toBe('456');

    // Checking old customers datas to be deleted
    const oldCustomer = (await Customers.findOne({ _id: customerIds[0] })) || {
      status: ''
    };

    expect(oldCustomer.status).toBe('deleted');
    expect(
      await Conversations.find({ customerId: customerIds[0] })
    ).toHaveLength(0);
    expect(
      await ConversationMessages.find({ customerId: customerIds[0] })
    ).toHaveLength(0);

    let internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customerIds[0]
    });

    expect(internalNote).toHaveLength(0);

    // Checking merged customer datas
    expect(
      await Conversations.find({ customerId: mergedCustomer._id })
    ).not.toHaveLength(0);
    expect(
      await ConversationMessages.find({ customerId: mergedCustomer._id })
    ).not.toHaveLength(0);

    internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.CUSTOMER,
      contentTypeId: mergedCustomer._id
    });

    expect(internalNote).not.toHaveLength(0);

    const relTypeIds = await Conformities.filterConformity({
      mainType: 'customer',
      mainTypeIds: customerIds,
      relType: 'deal'
    });
    expect(relTypeIds.length).toBe(0);

    const newRelTypeIds = await Conformities.savedConformity({
      mainType: 'customer',
      mainTypeId: mergedCustomer._id,
      relTypes: ['deal']
    });

    const deals = await Deals.find({
      _id: { $in: newRelTypeIds }
    });

    expect(deals).toHaveLength(1);
    process.env.ELK_SYNCER = processState;
    mock.restore();
  });

  test('Update profile score', async () => {
    const customer = await customerFactory({});

    const response = await Customers.calcPSS({ ...customer });

    expect(response.profileScore).toBe(0);
  });

  test('Mark as active', async () => {
    const customer = await customerFactory({});

    const response = await Customers.markCustomerAsActive(customer._id);

    expect(response.isOnline).toBeTruthy();
  });

  test('createMessengerCustomer() must return a new customer', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });
    const now = new Date();

    const email = 'uniqueEmail@gmail.com';
    const phone = '+422999';

    const customer = await Customers.createMessengerCustomer({
      doc: {
        integrationId: _customer.integrationId,
        email,
        phone,
        isUser: _customer.isUser
      },
      customData: {
        firstName: 'firstName'
      }
    });

    expect(customer).toBeDefined();

    expect(customer.createdAt).toBeDefined();
    expect(customer.searchText).toBeDefined();
    expect(customer.profileScore).toBeDefined();
    expect(customer.modifiedAt).toBeDefined();
    expect(customer.primaryEmail).toBe(email);
    expect(customer.emails).toContain(email);

    expect(customer.primaryPhone).toBe(phone);
    expect(customer.phones).toContain(phone);

    expect(customer.createdAt >= now).toBe(true);

    expect(customer.lastSeenAt).toBeDefined();
    expect(customer.isOnline).toBe(true);
    expect(customer.sessionCount).toBe(1);

    expect(customer.firstName).toBe('firstName');
    mock.restore();
  });

  test('updateMessengerCustomer()', async () => {
    const mock = sinon.stub(utils, 'sendRequest').callsFake(() => {
      return Promise.resolve('success');
    });

    const integration = await integrationFactory();

    try {
      await Customers.updateMessengerCustomer({
        _id: '_id',
        doc: { integrationId: integration._id },
        customData: {}
      });
    } catch (e) {
      expect(e.message).toBe('Customer not found');
    }

    const email = 'uniqueEmail@gmail.com';
    const phone = '+422999';
    const deviceToken = 'token';

    _customer.isUser = true;
    await _customer.save();

    const customer = await Customers.updateMessengerCustomer({
      _id: _customer._id,
      doc: {
        integrationId: integration._id,
        email,
        phone,
        isUser: true,
        deviceToken
      }
    });

    expect(customer.primaryEmail).toBe(email);
    expect(customer.emails).toContain(email);
    expect(customer.deviceTokens).toContain(deviceToken);

    expect(customer.primaryPhone).toBe(phone);
    expect(customer.phones).toContain(phone);
    mock.restore();
  });

  test('getWidgetCustomer()', async () => {
    // emails, primaryEmail ==============
    let customer: ICustomerDocument | null = await customerFactory({
      primaryEmail: 'customer@gmail.com',
      emails: ['main@gmail.com']
    });

    let foundCustomer = await Customers.getWidgetCustomer({
      email: 'customer@gmail.com'
    });

    expect(foundCustomer && foundCustomer._id).toBe(customer._id);

    // phones
    customer = await customerFactory({
      phones: ['911111']
    });

    foundCustomer = await Customers.getWidgetCustomer({
      phone: '911111'
    });

    expect(foundCustomer && foundCustomer._id).toBe(customer._id);

    // primaryPhone
    customer = await customerFactory({
      primaryPhone: '24244242'
    });

    foundCustomer = await Customers.getWidgetCustomer({
      phone: '24244242'
    });

    expect(foundCustomer && foundCustomer._id).toBe(customer._id);

    // code
    customer = await customerFactory({
      code: '24244242'
    });

    foundCustomer = await Customers.getWidgetCustomer({
      code: '24244242'
    });

    expect(foundCustomer && foundCustomer._id).toBe(customer._id);

    // cached customer id
    foundCustomer = await Customers.getWidgetCustomer({
      cachedCustomerId: customer._id
    });

    expect(foundCustomer && foundCustomer._id).toBe(customer._id);

    // related integrationIds

    customer = await customerFactory({
      relatedIntegrationIds: ['123'],
      code: '1234'
    });

    foundCustomer = await Customers.getWidgetCustomer({
      integrationId: '1234',
      code: '1234'
    });

    expect(foundCustomer && foundCustomer._id).toBe(customer._id);
  });

  test('updateSession()', async () => {
    try {
      await Customers.updateSession('_id');
    } catch (e) {
      expect(e.message).toBe('Customer not found');
    }

    const now = new Date();

    const customer = await Customers.updateSession(_customer._id);

    expect(customer.isOnline).toBeTruthy();
    expect(
      customer.lastSeenAt && customer.lastSeenAt.getTime() >= now.getTime()
    ).toBeTruthy();
  });

  test('saveVisitorContactInfo()', async () => {
    // email ==========
    let customer = await Customers.saveVisitorContactInfo({
      customerId: _customer._id,
      type: 'email',
      value: 'test@gmail.com'
    });

    let visitorContactInfo: any = customer.visitorContactInfo || {};

    expect(visitorContactInfo.email).toBe('test@gmail.com');

    // phone ===============
    customer = await Customers.saveVisitorContactInfo({
      customerId: _customer._id,
      type: 'phone',
      value: '985435353'
    });

    visitorContactInfo = customer.visitorContactInfo || {};

    // check company in companyIds
    expect(visitorContactInfo.phone).toBe('985435353');
  });

  test('updateLocation()', async () => {
    const updated = await Customers.updateLocation(_customer._id, {
      language: 'en'
    });

    expect(updated.location && updated.location.language).toBe('en');
  });

  test('changeState()', async () => {
    const updated = await Customers.changeState(_customer._id, 'state');

    expect(updated.state).toBe('state');
  });

  test('changeVerificationStatus()', async () => {
    const phoneResult = await Customers.updateVerificationStatus(
      [_customer._id],
      'phone',
      'valid'
    );

    phoneResult.forEach(c => {
      expect(c.phoneValidationStatus).toBe('valid');
    });

    const emailResult = await Customers.updateVerificationStatus(
      [_customer._id],
      'email',
      'valid'
    );

    emailResult.forEach(c => {
      expect(c.emailValidationStatus).toBe('valid');
    });
  });
});
