import { connect, disconnect } from '../db/connection';
import {
  activityLogFactory,
  conversationFactory,
  conversationMessageFactory,
  customerFactory,
  fieldFactory,
  integrationFactory,
  internalNoteFactory,
  userFactory,
} from '../db/factories';
import {
  ActivityLogs,
  ConversationMessages,
  Conversations,
  Customers,
  ImportHistory,
  InternalNotes,
} from '../db/models';
import { COC_CONTENT_TYPES } from '../db/models/definitions/constants';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('Customers model tests', () => {
  let _customer;

  beforeEach(async () => {
    _customer = await customerFactory({
      primaryEmail: 'email@gmail.com',
      emails: ['email@gmail.com', 'otheremail@gmail.com'],
      primaryPhone: '99922210',
      phones: ['99922210', '99922211'],
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Customers.remove({});
    await ImportHistory.remove({});
  });

  test('Create customer', async () => {
    expect.assertions(13);

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
      await Customers.createCustomer({ primaryPhone: '99922210' });
    } catch (e) {
      expect(e.message).toBe('Duplicated phone');
    }

    try {
      await Customers.createCustomer({ primaryPhone: '99922211' });
    } catch (e) {
      expect(e.message).toBe('Duplicated phone');
    }

    try {
      await Customers.createCustomer({ twitterData: _customer.twitterData });
    } catch (e) {
      expect(e.message).toBe('Duplicated twitter');
    }

    // Create without any error
    const doc = {
      primaryEmail: 'dombo@yahoo.com',
      emails: ['dombo@yahoo.com'],
      firstName: 'firstName',
      lastName: 'lastName',
      primaryPhone: '12312132',
      phones: ['12312132'],
    };

    const customerObj = await Customers.createCustomer(doc);

    expect(customerObj.createdAt).toBeDefined();
    expect(customerObj.modifiedAt).toBeDefined();
    expect(customerObj.firstName).toBe(doc.firstName);
    expect(customerObj.lastName).toBe(doc.lastName);
    expect(customerObj.primaryEmail).toBe(doc.primaryEmail);
    expect(customerObj.emails).toEqual(expect.arrayContaining(doc.emails));
    expect(customerObj.primaryPhone).toBe(doc.primaryPhone);
    expect(customerObj.phones).toEqual(expect.arrayContaining(doc.phones));
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
        customFieldsData: { [field._id]: 'invalid number' },
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('Update customer', async () => {
    expect.assertions(5);

    const previousCustomer = await customerFactory({
      primaryEmail: 'dombo@yahoo.com',
      emails: ['dombo@yahoo.com'],
    });

    const doc = {
      firstName: 'Dombo',
      primaryEmail: 'dombo@yahoo.com',
      emails: ['dombo@yahoo.com'],
      primaryPhone: '242442200',
      phones: ['242442200'],
    };

    // test duplication
    try {
      await Customers.updateCustomer(_customer._id, doc);
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // remove previous duplicated entry
    await Customers.remove({ _id: previousCustomer._id });

    const customerObj = await Customers.updateCustomer(_customer._id, doc);

    expect(customerObj.modifiedAt).toBeDefined();
    expect(customerObj.firstName).toBe(doc.firstName);
    expect(customerObj.primaryEmail).toBe(doc.primaryEmail);
    expect(customerObj.primaryPhone).toBe(doc.primaryPhone);
  });

  test('Mark customer as inactive', async () => {
    const customer = await customerFactory({
      messengerData: { isActive: true, lastSeenAt: null },
    });

    const customerObj = await Customers.markCustomerAsNotActive(customer._id);

    if (!customerObj || !customerObj.messengerData) {
      throw new Error('Customer not found');
    }

    expect(customerObj.messengerData.isActive).toBe(false);
    expect(customerObj.messengerData.lastSeenAt).toBeDefined();
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
        customFieldsData: { [field._id]: 'invalid number' },
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('Update customer companies', async () => {
    const companyIds = ['12313qwrqwe', '123', '11234'];

    const customerObj = await Customers.updateCompanies(_customer._id, companyIds);

    expect(customerObj.companyIds).toEqual(expect.arrayContaining(companyIds));
  });

  test('removeCustomer', async () => {
    const customer = await customerFactory({});

    await internalNoteFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id,
    });

    const conversation = await conversationFactory({
      customerId: customer._id,
    });

    await conversationMessageFactory({
      conversationId: conversation._id,
      customerId: customer._id,
    });

    await Customers.removeCustomer(customer._id);

    const internalNote = await InternalNotes.find({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customer._id,
    });

    expect(await Customers.find({ _id: customer._id })).toHaveLength(0);
    expect(internalNote).toHaveLength(0);
    expect(await Conversations.find({ customerId: customer._id })).toHaveLength(0);
    expect(await ConversationMessages.find({ customerId: customer._id })).toHaveLength(0);
  });

  test('Merge customers: without emails or phones', async () => {
    const visitor1 = await customerFactory({});
    const visitor2 = await customerFactory({});

    const customerIds = [visitor1._id, visitor2._id];

    const merged = await Customers.mergeCustomers(customerIds, {
      primaryEmail: 'merged@gmail.com',
      primaryPhone: '2555225',
    });

    expect(merged.emails).toContain('merged@gmail.com');
    expect(merged.phones).toContain('2555225');
  });

  test('Merge customers', async () => {
    expect.assertions(23);

    const integration = await integrationFactory({});

    const customer1 = await customerFactory({
      companyIds: ['123', '1234', '12345'],
      tagIds: ['2343', '234', '234'],
      integrationId: integration._id,
    });

    const customer2 = await customerFactory({
      companyIds: ['123', '456', '45678'],
      tagIds: ['qwe', '2343', '123'],
      integrationId: integration._id,
    });

    if (!customer1 || !customer1.companyIds || !customer1.tagIds) {
      throw new Error('Customer1 not found');
    }

    if (!customer2 || !customer2.companyIds || !customer2.tagIds) {
      throw new Error('Customer2 not found');
    }

    const customerIds = [customer1._id, customer2._id];

    // Merging both customers companyIds and tagIds
    const mergedCompanyIds = Array.from(new Set(customer1.companyIds.concat(customer2.companyIds)));

    const mergedTagIds = Array.from(new Set(customer1.tagIds.concat(customer2.tagIds)));

    // test duplication ============
    try {
      await Customers.mergeCustomers(customerIds, {
        twitterData: _customer.twitterData,
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated twitter');
    }

    try {
      await Customers.mergeCustomers(customerIds, {
        primaryEmail: 'email@gmail.com',
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated email');
    }

    // Merge without any errors ===========
    await internalNoteFactory({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customerIds[0],
    });

    await conversationFactory({
      customerId: customerIds[0],
    });

    await conversationMessageFactory({
      customerId: customerIds[0],
    });

    await activityLogFactory({
      coc: {
        type: COC_CONTENT_TYPES.CUSTOMER,
        id: customerIds[0],
      },
    });

    const doc = {
      firstName: 'Test first name',
      lastName: 'Test last name',
      primaryEmail: 'Test email',
      primaryPhone: 'Test phone',
      facebookData: {
        id: '1231312asd',
      },
      twitterData: {
        id: 1234123,
      },
      messengerData: {
        sessionCount: 6,
      },
      visitorContactInfo: {
        email: 'test123@gmail.com',
        phone: '1213312132',
      },
      ownerId: '456',
    };

    const mergedCustomer = await Customers.mergeCustomers(customerIds, doc);

    if (
      !mergedCustomer ||
      !mergedCustomer.twitterData ||
      !mergedCustomer.facebookData ||
      !mergedCustomer.messengerData ||
      !mergedCustomer.visitorContactInfo
    ) {
      throw new Error('Merged customer not found');
    }

    expect(mergedCustomer.integrationId).toBeDefined();
    expect(mergedCustomer.firstName).toBe(doc.firstName);
    expect(mergedCustomer.lastName).toBe(doc.lastName);
    expect(mergedCustomer.primaryEmail).toBe(doc.primaryEmail);
    expect(mergedCustomer.primaryPhone).toBe(doc.primaryPhone);
    expect(mergedCustomer.twitterData.toJSON()).toEqual(doc.twitterData);
    expect(mergedCustomer.messengerData.toJSON()).toEqual(doc.messengerData);
    expect(mergedCustomer.facebookData.toJSON()).toEqual(doc.facebookData);
    expect(mergedCustomer.companyIds).toEqual(expect.arrayContaining(mergedCompanyIds));
    expect(mergedCustomer.tagIds).toEqual(expect.arrayContaining(mergedTagIds));
    expect(mergedCustomer.visitorContactInfo.toJSON()).toEqual(doc.visitorContactInfo);
    expect(mergedCustomer.ownerId).toBe('456');

    // Checking old customers datas to be deleted
    expect(await Customers.find({ _id: customerIds[0] })).toHaveLength(0);
    expect(await Conversations.find({ customerId: customerIds[0] })).toHaveLength(0);
    expect(await ConversationMessages.find({ customerId: customerIds[0] })).toHaveLength(0);

    let internalNote = await InternalNotes.find({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: customerIds[0],
    });

    let activityLog = await ActivityLogs.find({
      coc: {
        id: customerIds[0],
        type: COC_CONTENT_TYPES.CUSTOMER,
      },
    });

    expect(internalNote).toHaveLength(0);
    expect(activityLog).toHaveLength(0);

    // Checking merged customer datas
    expect(await Conversations.find({ customerId: mergedCustomer._id })).not.toHaveLength(0);
    expect(await ConversationMessages.find({ customerId: mergedCustomer._id })).not.toHaveLength(0);

    internalNote = await InternalNotes.find({
      contentType: COC_CONTENT_TYPES.CUSTOMER,
      contentTypeId: mergedCustomer._id,
    });

    activityLog = await ActivityLogs.find({
      coc: {
        type: COC_CONTENT_TYPES.CUSTOMER,
        id: mergedCustomer._id,
      },
    });

    expect(internalNote).not.toHaveLength(0);
    expect(activityLog).not.toHaveLength(0);
  });

  test('bulkInsert', async () => {
    await fieldFactory({
      contentType: 'customer',
      text: 'First referred site',
      validation: '',
    });

    await fieldFactory({
      contentType: 'customer',
      text: 'Fax number',
      validation: '',
    });
    const user = await userFactory({});

    const fieldNames = ['primaryEmail', 'primaryPhone', 'First referred site', 'Fax number'];

    const fieldValues = [
      ['customer1email@yahoo.com', 'customer1phone', 'customer1property1', 'customer1property2'],
      ['customer2email@yahoo.com', 'customer2phone', 'customer2property1', 'customer2property2'],
    ];

    const response = await Customers.bulkInsert(fieldNames, fieldValues, user);
    const customers = await Customers.find({});

    const history = await ImportHistory.findOne({ userId: user._id });

    if (!history || !history.ids) {
      throw new Error('History not found');
    }

    // Before each test we create 1 customer so it should be 3 total
    expect(customers.length).toBe(3);
    expect(response.length).toBe(0);
    expect(history.success).toBe(2);
    expect(history.total).toBe(2);
    expect(history.ids.length).toBe(2);
    expect(history.failed).toBe(0);
  });

  test('bulkInsert with errors', async () => {
    const user = await userFactory({});
    const badFieldNames = ['badColumn name1'];

    let response = await Customers.bulkInsert(badFieldNames, [], user);
    // We sent bad column name
    expect(response.length).toBe(1);
    expect(response[0]).toBe('Bad column name badColumn name1');

    await fieldFactory({
      contentType: 'customer',
      text: 'Fax number',
      validation: '',
    });
    const customer = await customerFactory({
      emails: ['testCustomerEmail@gmail.com'],
      primaryEmail: 'testCustomerEmail@gmail.com',
    });

    const fieldNames = ['primaryEmail', 'firstName', 'Fax number'];

    const fieldValues: any = [
      [customer.primaryEmail, 'Heyy', '12313'], // this one has duplicated email
      ['newEmail@gmail.com', 'Ayyy', '12313'], // this one should be inserted
      [customer.primaryEmail, '', ''], // this one has duplicated email too
    ];

    response = await Customers.bulkInsert(fieldNames, fieldValues, user);

    expect(response.length).toBe(2);
    expect(response[0]).toBe('Duplicated email at the row 1');
    expect(response[1]).toBe('Duplicated email at the row 3');

    const history = await ImportHistory.findOne({ userId: user._id });

    if (!history || !history.ids) {
      throw new Error('History not found');
    }

    expect(history.total).toBe(3);
    expect(history.success).toBe(1);
    expect(history.failed).toBe(2);
    expect(history.ids.length).toBe(1);

    process.env.MAX_IMPORT_SIZE = '2';

    // Max import size error
    response = await Customers.bulkInsert(fieldNames, fieldValues, user);

    expect(response.length).toBe(1);
    expect(response[0]).toBe(`You can only import max ${process.env.MAX_IMPORT_SIZE} at a time`);
  });
});
