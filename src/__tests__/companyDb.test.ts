import { companyFactory, customerFactory, dealFactory, fieldFactory, internalNoteFactory } from '../db/factories';
import { Companies, Customers, Deals, InternalNotes } from '../db/models';
import { ICompany, ICompanyDocument } from '../db/models/definitions/companies';
import { ACTIVITY_CONTENT_TYPES, STATUSES } from '../db/models/definitions/constants';

const check = (companyObj: ICompanyDocument, doc: ICompany) => {
  expect(companyObj.createdAt).toBeDefined();
  expect(companyObj.modifiedAt).toBeDefined();
  expect(companyObj.primaryName).toBe(doc.primaryName);
  expect(companyObj.names).toEqual(expect.arrayContaining(doc.names || []));
  expect(companyObj.primaryEmail).toBe(doc.primaryEmail);
  expect(companyObj.emails).toEqual(expect.arrayContaining(doc.emails || []));
  expect(companyObj.primaryPhone).toBe(doc.primaryPhone);
  expect(companyObj.phones).toEqual(expect.arrayContaining(doc.phones || []));
  expect(companyObj.primaryEmail).toBe(doc.primaryEmail);
  expect(companyObj.primaryPhone).toBe(doc.primaryPhone);
  expect(companyObj.size).toBe(doc.size);
  expect(companyObj.industry).toBe(doc.industry);
  expect(companyObj.plan).toBe(doc.plan);
};

const generateDoc = () => ({
  primaryName: 'name',
  names: ['name'],
  primaryPhone: 'phone',
  phones: ['phone'],
  primaryEmail: 'email',
  emails: ['email'],
  size: 1,
  industry: 'Airlines',
  plan: 'pro',
});

describe('Companies model tests', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory({
      primaryName: 'companyname',
      names: ['companyname', 'companyname1'],
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.deleteMany({});
  });

  test('Create company', async () => {
    expect.assertions(15);

    // check duplication ==============
    try {
      await Companies.createCompany({ primaryName: 'companyname' });
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    try {
      await Companies.createCompany({ primaryName: 'companyname1' });
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    const doc = generateDoc();

    const companyObj = await Companies.createCompany(doc);

    check(companyObj, doc);
  });

  test('Create company: with company fields validation error', async () => {
    expect.assertions(1);

    const field = await fieldFactory({ validation: 'number' });

    if (!field) {
      throw new Error('Field not found');
    }

    try {
      await Companies.createCompany({
        primaryName: 'name',
        customFieldsData: { [field._id]: 'invalid number' },
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('Update company', async () => {
    expect.assertions(14);

    const doc = generateDoc();

    const previousCompany = await companyFactory({ names: doc.names });

    // test duplication
    try {
      await Companies.updateCompany(_company._id, doc);
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    // remove previous duplicated entry
    await Companies.deleteOne({ _id: previousCompany._id });

    const companyObj = await Companies.updateCompany(_company._id, doc);

    check(companyObj, doc);
  });

  test('Update company: with company fields validation error', async () => {
    expect.assertions(1);

    const field = await fieldFactory({ validation: 'number' });

    if (!field) {
      throw new Error('Field not found');
    }

    try {
      await Companies.updateCompany(_company._id, {
        primaryName: 'name',
        customFieldsData: { [field._id]: 'invalid number' },
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('Update company customers', async () => {
    const customerIds = ['12313qwrqwe', '123', '11234'];

    await Companies.updateCustomers(_company._id, customerIds);

    for (const customerId of customerIds) {
      const customerObj = await Customers.findOne({ _id: customerId });

      if (!customerObj) {
        throw new Error('Customer not found');
      }

      expect(customerObj.companyIds).toContain(_company._id);
    }
  });

  test('removeCompany', async () => {
    const company = await companyFactory({});
    await customerFactory({ companyIds: [company._id] });

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id,
    });

    await Companies.removeCompany(company._id);

    const internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id,
    });

    const customers = await Customers.find({
      companyIds: { $in: [company._id] },
    });

    expect(customers).toHaveLength(0);
    expect(internalNote).toHaveLength(0);
  });

  test('mergeCompanies', async () => {
    expect.assertions(21);

    const company1 = await companyFactory({
      tagIds: ['123', '456', '1234'],
      names: ['company1'],
      phones: ['phone1'],
      emails: ['email1'],
    });

    const company2 = await companyFactory({
      tagIds: ['1231', '123', 'asd12'],
      names: ['company2'],
      phones: ['phone2'],
      emails: ['email2'],
    });

    const customer1 = await customerFactory({
      companyIds: [company1._id],
    });

    const customer2 = await customerFactory({
      companyIds: [company2._id],
    });

    const companyIds = [company1._id, company2._id];
    const mergedTagIds = ['123', '456', '1234', '1231', 'asd12'];

    // test duplication =================
    try {
      await Companies.mergeCompanies(companyIds, {
        primaryName: 'companyname',
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    // Merge without any errors ===========
    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: companyIds[0],
    });

    await dealFactory({
      companyIds,
    });

    const doc = {
      primaryName: 'Test name',
      size: 230,
      industry: 'Airlines',
      plan: 'Test plan',
      ownerId: '789',
      parentCompanyId: '123',
    };

    const updatedCompany = await Companies.mergeCompanies(companyIds, doc);

    expect(updatedCompany.primaryName).toBe(doc.primaryName);
    expect(updatedCompany.size).toBe(doc.size);
    expect(updatedCompany.industry).toBe(doc.industry);
    expect(updatedCompany.plan).toBe(doc.plan);
    expect(updatedCompany.names).toEqual(expect.arrayContaining(['company1', 'company2']));
    expect(updatedCompany.phones).toEqual(expect.arrayContaining(['phone1', 'phone2']));
    expect(updatedCompany.emails).toEqual(expect.arrayContaining(['email1', 'email2']));
    expect(updatedCompany.ownerId).toBe('789');
    expect(updatedCompany.parentCompanyId).toBe('123');

    // Checking old company datas deleted
    const oldCompany = (await Companies.findOne({ _id: companyIds[0] })) || { status: '' };

    expect(oldCompany.status).toBe(STATUSES.DELETED);
    expect(updatedCompany.tagIds).toEqual(expect.arrayContaining(mergedTagIds));

    const customerObj1 = await Customers.findOne({ _id: customer1._id });

    if (!customerObj1) {
      throw new Error('Customer not found');
    }

    expect(customerObj1.companyIds).not.toContain(company1._id);

    const customerObj2 = await Customers.findOne({ _id: customer2._id });

    if (!customerObj2) {
      throw new Error('Customer not found');
    }

    expect(customerObj2.companyIds).not.toContain(company2._id);

    let internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: companyIds[0],
    });

    expect(internalNote).toHaveLength(0);

    // Checking new company datas updated
    expect(updatedCompany.tagIds).toEqual(expect.arrayContaining(mergedTagIds));

    expect(customerObj1.companyIds).toContain(updatedCompany._id);
    expect(customerObj2.companyIds).toContain(updatedCompany._id);

    internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: updatedCompany._id,
    });

    expect(internalNote).not.toHaveLength(0);

    const deals = await Deals.find({
      companyIds: { $in: companyIds },
    });

    expect(deals.length).toBe(0);

    const deal = await Deals.findOne({
      companyIds: { $in: [updatedCompany._id] },
    });
    if (!deal) {
      throw new Error('Deal not found');
    }
    expect(deal.companyIds).toContain(updatedCompany._id);
  });
});
