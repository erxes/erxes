import { connect, disconnect } from '../db/connection';
import {
  activityLogFactory,
  companyFactory,
  customerFactory,
  fieldFactory,
  internalNoteFactory,
} from '../db/factories';
import { ActivityLogs, Companies, Customers, InternalNotes } from '../db/models';
import { COC_CONTENT_TYPES } from '../db/models/definitions/constants';

beforeAll(() => connect());

afterAll(() => disconnect());

const check = (companyObj, doc) => {
  expect(companyObj.createdAt).toBeDefined();
  expect(companyObj.modifiedAt).toBeDefined();
  expect(companyObj.name).toBe(doc.name);
  expect(companyObj.email).toBe(doc.email);
  expect(companyObj.size).toBe(doc.size);
  expect(companyObj.industry).toBe(doc.industry);
  expect(companyObj.plan).toBe(doc.plan);
};

const generateDoc = () => ({
  primaryName: 'name',
  names: ['name'],
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
    await Companies.remove({});
  });

  test('Create company', async () => {
    expect.assertions(9);

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
    expect.assertions(8);

    const doc = generateDoc();

    const previousCompany = await companyFactory({ names: doc.names });

    // test duplication
    try {
      await Companies.updateCompany(_company._id, doc);
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    // remove previous duplicated entry
    await Companies.remove({ _id: previousCompany._id });

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
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id,
    });

    await Companies.removeCompany(company._id);

    const internalNote = await InternalNotes.find({
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id,
    });

    const activityLog = await ActivityLogs.find({
      coc: {
        type: COC_CONTENT_TYPES.COMPANY,
        id: company._id,
      },
    });

    const customers = await Customers.find({
      companyIds: { $in: [company._id] },
    });

    expect(customers).toHaveLength(0);
    expect(internalNote).toHaveLength(0);
    expect(activityLog).toHaveLength(0);
  });

  test('mergeCompanies', async () => {
    expect.assertions(19);

    const company1 = await companyFactory({
      tagIds: ['123', '456', '1234'],
      names: ['company1'],
    });

    const company2 = await companyFactory({
      tagIds: ['1231', '123', 'asd12'],
      names: ['company2'],
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
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: companyIds[0],
    });

    await activityLogFactory({
      coc: {
        type: COC_CONTENT_TYPES.COMPANY,
        id: companyIds[0],
      },
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
    expect(updatedCompany.ownerId).toBe('789');
    expect(updatedCompany.parentCompanyId).toBe('123');

    // Checking old company datas deleted
    expect(await Companies.find({ _id: companyIds[0] })).toHaveLength(0);
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
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: companyIds[0],
    });

    let activityLog = await ActivityLogs.find({
      coc: {
        type: COC_CONTENT_TYPES.COMPANY,
        id: companyIds[0],
      },
    });

    expect(internalNote).toHaveLength(0);
    expect(activityLog).toHaveLength(0);

    // Checking new company datas updated
    expect(updatedCompany.tagIds).toEqual(expect.arrayContaining(mergedTagIds));

    expect(customerObj1.companyIds).toContain(updatedCompany._id);
    expect(customerObj2.companyIds).toContain(updatedCompany._id);

    internalNote = await InternalNotes.find({
      contentType: COC_CONTENT_TYPES.COMPANY,
      contentTypeId: updatedCompany._id,
    });

    activityLog = await ActivityLogs.find({
      coc: {
        type: COC_CONTENT_TYPES.COMPANY,
        id: updatedCompany._id,
      },
    });

    expect(internalNote).not.toHaveLength(0);
    expect(activityLog).not.toHaveLength(0);
  });
});
