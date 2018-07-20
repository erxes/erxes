/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { Companies, Customers, InternalNotes, ActivityLogs } from '../db/models';
import {
  companyFactory,
  fieldFactory,
  internalNoteFactory,
  activityLogFactory,
  customerFactory,
} from '../db/factories';
import { COC_CONTENT_TYPES } from '../data/constants';

beforeAll(() => connect());

afterAll(() => disconnect());

const check = (companyObj, doc) => {
  expect(companyObj.name).toBe(doc.name);
  expect(companyObj.email).toBe(doc.email);
  expect(companyObj.website).toBe(doc.website);
  expect(companyObj.size).toBe(doc.size);
  expect(companyObj.industry).toBe(doc.industry);
  expect(companyObj.plan).toBe(doc.plan);
};

const generateDoc = () => ({
  primaryName: 'name',
  names: ['name'],
  website: 'http://company.com',
  size: 1,
  industry: 'Airlines',
  plan: 'pro',
});

describe('Companies model tests', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.remove({});
  });

  test('Create company', async () => {
    expect.assertions(8);

    // check duplication
    try {
      await Companies.createCompany({ names: [_company.names[0]] });
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    // check duplication
    try {
      await Companies.createCompany({ primaryName: [_company.names[0]] });
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    const doc = generateDoc();

    const companyObj = await Companies.createCompany(doc);

    check(companyObj, doc);
  });

  test('Update company', async () => {
    expect.assertions(7);

    const doc = generateDoc();

    const previousCompany = await companyFactory({ names: [doc.names] });

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

  test('Create company: with company fields validation error', async () => {
    expect.assertions(1);

    const field = await fieldFactory({ validation: 'number' });

    try {
      await Companies.createCompany({
        name: 'name',
        customFieldsData: { [field._id]: 'invalid number' },
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('Update company: with company fields validation error', async () => {
    expect.assertions(1);

    const field = await fieldFactory({ validation: 'number' });

    try {
      await Companies.updateCompany(_company._id, {
        name: 'name',
        customFieldsData: { [field._id]: 'invalid number' },
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('Update company customers', async () => {
    const customerIds = ['12313qwrqwe', '123', '11234'];

    await Companies.updateCustomers(_company._id, customerIds);

    for (let customerId of customerIds) {
      const customerObj = await Customers.findOne({ _id: customerId });

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

    const removed = await Companies.removeCompany(company._id);

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

    const customers = await Customers.find({ companyIds: { $in: [company._id] } });

    expect(customers).toHaveLength(0);
    expect(internalNote).toHaveLength(0);
    expect(activityLog).toHaveLength(0);
    expect(removed.result).toEqual({ n: 1, ok: 1 });
  });

  test('mergeCompanies', async () => {
    expect.assertions(18);

    const testCompany = await companyFactory({
      tagIds: ['123', '456', '1234'],
    });

    const testCompany2 = await companyFactory({
      tagIds: ['1231', '123', 'asd12'],
    });

    let testCustomer = await customerFactory({
      companyIds: [testCompany._id],
    });

    let testCustomer2 = await customerFactory({
      companyIds: [testCompany2._id],
    });

    const companyIds = [testCompany._id, testCompany2._id];
    const mergedTagIds = Array.from(new Set(testCompany.tagIds.concat(testCompany2.tagIds)));

    const companyObj = await companyFactory({ names: testCompany.names });

    // test duplication
    try {
      await Companies.mergeCompanies(companyIds, { names: [_company.names] });
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    await Companies.remove({ _id: companyObj._id });

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
      website: 'Test webiste',
      size: 230,
      industry: 'Airlines',
      plan: 'Test plan',
    };

    const updatedCompany = await Companies.mergeCompanies(companyIds, doc);

    expect(updatedCompany.primaryName).toBe(doc.primaryName);
    expect(updatedCompany.website).toBe(doc.website);
    expect(updatedCompany.size).toBe(doc.size);
    expect(updatedCompany.industry).toBe(doc.industry);
    expect(updatedCompany.plan).toBe(doc.plan);
    expect(updatedCompany.names).toEqual(
      expect.arrayContaining(testCompany.names.concat(testCompany2.names)),
    );

    // Checking old company datas deleted
    expect(await Companies.find({ _id: companyIds[0] })).toHaveLength(0);
    expect(updatedCompany.tagIds).toEqual(expect.arrayContaining(mergedTagIds));

    testCustomer = await Customers.findOne({ _id: testCustomer._id });
    expect(testCustomer.companyIds).not.toContain(testCompany._id);

    testCustomer2 = await Customers.findOne({ _id: testCustomer2._id });
    expect(testCustomer2.companyIds).not.toContain(testCompany2._id);

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

    expect(testCustomer.companyIds).toContain(updatedCompany._id);
    expect(testCustomer2.companyIds).toContain(updatedCompany._id);

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

  test('Check Duplication', async () => {
    expect.assertions(1);
    // check duplication
    try {
      await Companies.checkDuplication(
        { primaryName: _company.primaryName, names: _company.names },
        '123132',
      );
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }
  });
});
