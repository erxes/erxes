import {
  companyFactory,
  conformityFactory,
  customerFactory,
  dealFactory,
  fieldFactory,
  internalNoteFactory,
  userFactory
} from '../db/factories';
import {
  Companies,
  Conformities,
  Customers,
  Deals,
  InternalNotes
} from '../db/models';
import { ICompany, ICompanyDocument } from '../db/models/definitions/companies';
import { ACTIVITY_CONTENT_TYPES } from '../db/models/definitions/constants';

import './setup.ts';

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
  plan: 'pro'
});

describe('Companies model tests', () => {
  let _company;

  beforeEach(async () => {
    _company = await companyFactory({
      primaryName: 'companyname',
      names: ['companyname', 'companyname1'],
      code: 'code'
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Companies.deleteMany({});
  });

  test('Get company', async () => {
    try {
      await Companies.getCompany('fakeId');
    } catch (e) {
      expect(e.message).toBe('Company not found');
    }

    const response = await Companies.getCompany(_company._id);

    expect(response).toBeDefined();
  });

  test('Create company', async () => {
    expect.assertions(5);

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

    try {
      await Companies.createCompany({ code: 'code' });
    } catch (e) {
      expect(e.message).toBe('Duplicated code');
    }

    let companyObj = await Companies.createCompany({}, await userFactory());

    expect(companyObj).toBeDefined();

    const doc = generateDoc();
    // primary name is empty
    doc.primaryName = '';

    companyObj = await Companies.createCompany(doc);

    expect(companyObj.primaryName).toBe('');
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
        customFieldsData: [{ field: field._id, value: 'invalid number' }]
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
        customFieldsData: [{ field: field._id, value: 'invalid number' }]
      });
    } catch (e) {
      expect(e.message).toBe(`${field.text}: Invalid number`);
    }
  });

  test('removeCompany', async () => {
    const company = await companyFactory({});
    const customer = await customerFactory({});

    await conformityFactory({
      mainType: 'company',
      mainTypeId: company._id,
      relType: 'customer',
      relTypeId: customer._id
    });

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id
    });

    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id
    });

    await Companies.removeCompanies([company._id]);

    const internalNotes = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: company._id
    });

    const customers = await Customers.find({
      _id: { $in: [customer._id] }
    });

    const conformities = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: company._id,
      relTypes: ['customer']
    });

    expect(customers).toHaveLength(1);
    expect(internalNotes).toHaveLength(0);
    expect(conformities).toHaveLength(0);
  });

  test('mergeCompanies', async () => {
    expect.assertions(19);

    const company1 = await companyFactory({
      tagIds: ['123', '456', '1234'],
      names: ['company1'],
      phones: ['phone1'],
      emails: ['email1'],
      scopeBrandIds: ['123']
    });

    const company2 = await companyFactory({
      tagIds: ['1231', '123', 'asd12'],
      names: ['company2'],
      phones: ['phone2'],
      emails: ['email2']
    });

    const company3 = await companyFactory();

    const customer1 = await customerFactory({});
    await conformityFactory({
      mainType: 'customer',
      mainTypeId: customer1._id,
      relType: 'company',
      relTypeId: company1._id
    });

    const customer2 = await customerFactory({});
    await conformityFactory({
      mainType: 'customer',
      mainTypeId: customer2._id,
      relType: 'company',
      relTypeId: company2._id
    });

    const companyIds = [company1._id, company2._id, company3._id];
    const mergedTagIds = ['123', '456', '1234', '1231', 'asd12'];

    // test duplication =================
    try {
      await Companies.mergeCompanies(companyIds, {
        primaryName: 'companyname'
      });
    } catch (e) {
      expect(e.message).toBe('Duplicated name');
    }

    // Merge without any errors ===========
    await internalNoteFactory({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: companyIds[0]
    });

    const deal1 = await dealFactory({});
    companyIds.map(async companyId => {
      await conformityFactory({
        mainType: 'deal',
        mainTypeId: deal1._id,
        relType: 'company',
        relTypeId: companyId
      });
    });

    const doc = {
      primaryName: 'Test name',
      size: 230,
      industry: 'Airlines',
      plan: 'Test plan',
      ownerId: '789',
      parentCompanyId: '123'
    };

    const updatedCompany = await Companies.mergeCompanies(companyIds, doc);

    expect(updatedCompany.primaryName).toBe(doc.primaryName);
    expect(updatedCompany.size).toBe(doc.size);
    expect(updatedCompany.industry).toBe(doc.industry);
    expect(updatedCompany.plan).toBe(doc.plan);
    expect(updatedCompany.names).toEqual(
      expect.arrayContaining(['company1', 'company2'])
    );
    expect(updatedCompany.phones).toEqual(
      expect.arrayContaining(['phone1', 'phone2'])
    );
    expect(updatedCompany.emails).toEqual(
      expect.arrayContaining(['email1', 'email2'])
    );
    expect(updatedCompany.ownerId).toBe('789');
    expect(updatedCompany.parentCompanyId).toBe('123');

    // Checking old company datas deleted
    const oldCompany = (await Companies.findOne({ _id: companyIds[0] })) || {
      status: ''
    };

    expect(oldCompany.status).toBe('deleted');
    expect(updatedCompany.tagIds).toEqual(expect.arrayContaining(mergedTagIds));

    let internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: companyIds[0]
    });

    expect(internalNote).toHaveLength(0);

    // Checking new company datas updated
    expect(updatedCompany.tagIds).toEqual(expect.arrayContaining(mergedTagIds));

    internalNote = await InternalNotes.find({
      contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
      contentTypeId: updatedCompany._id
    });

    expect(internalNote).not.toHaveLength(0);

    const cusRelTypeIds = await Conformities.filterConformity({
      mainType: 'company',
      mainTypeIds: companyIds,
      relType: 'customer'
    });
    expect(cusRelTypeIds.length).toBe(0);

    const newCusRelTypeIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: updatedCompany._id,
      relTypes: ['customer']
    });

    const customers = await Customers.find({
      _id: { $in: newCusRelTypeIds }
    });

    expect(customers).toHaveLength(2);

    const relTypeIds = await Conformities.filterConformity({
      mainType: 'company',
      mainTypeIds: companyIds,
      relType: 'deal'
    });
    expect(relTypeIds.length).toBe(0);

    const newRelTypeIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: updatedCompany._id,
      relTypes: ['deal']
    });

    const deals = await Deals.find({
      _id: { $in: newRelTypeIds }
    });

    expect(deals).toHaveLength(1);
  });
});
