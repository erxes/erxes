import { graphqlRequest } from '../db/connection';
import { companyFactory, conformityFactory, customerFactory, dealFactory, taskFactory } from '../db/factories';
import { Companies, Conformities, Customers, Deals } from '../db/models';

import './setup.ts';

describe('mutations', () => {
  let _company;
  let _customer;

  beforeEach(async () => {
    // Creating test data
    _company = await companyFactory({});
    _customer = await customerFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    Companies.deleteMany({});
    Customers.deleteMany({});
    Deals.deleteMany({});
    Conformities.deleteMany({});
  });

  test('Edit conformity mutations', async () => {
    conformityFactory({
      mainType: 'company',
      mainTypeId: _company._id,
      relType: 'customer',
      relTypeId: _customer._id,
    });

    const company1 = await companyFactory({});
    const customer1 = await customerFactory({});
    const customer2 = await customerFactory({});
    const customer3 = await customerFactory({});

    const mutation = `
      mutation conformityEdit(
        $mainType: String!
        $mainTypeId: String!
        $relType: String!
        $relTypeIds: [String]!
      ) {
        conformityEdit(
          mainType: $mainType
          mainTypeId: $mainTypeId
          relType: $relType
          relTypeIds: $relTypeIds
        ) {
          success
        }
      }
    `;

    let args = {
      mainType: 'company',
      mainTypeId: _company._id,
      relType: 'customer',
      relTypeIds: [customer3._id],
    };
    await graphqlRequest(mutation, 'conformityEdit', args);

    let relTypeIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: _company._id,
      relTypes: ['customer'],
    });

    let savedCustomer = await Customers.find({ _id: { $in: relTypeIds } });
    expect(savedCustomer.length).toEqual(1);

    args = {
      mainType: 'company',
      mainTypeId: _company._id,
      relType: 'customer',
      relTypeIds: [_customer._id, customer1._id, customer2._id],
    };
    await graphqlRequest(mutation, 'conformityEdit', args);

    relTypeIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: _company._id,
      relTypes: ['customer'],
    });

    savedCustomer = await Customers.find({ _id: { $in: relTypeIds } });
    expect(savedCustomer.length).toEqual(3);

    args = {
      mainType: 'customer',
      mainTypeId: _customer._id,
      relType: 'company',
      relTypeIds: [_company._id, company1._id],
    };
    await graphqlRequest(mutation, 'conformityEdit', args);

    relTypeIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: _company._id,
      relTypes: ['customer'],
    });

    savedCustomer = await Customers.find({ _id: { $in: relTypeIds } });
    expect(savedCustomer.length).toEqual(3);

    relTypeIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: company1._id,
      relTypes: ['customer'],
    });

    savedCustomer = await Customers.find({ _id: { $in: relTypeIds } });
    expect(savedCustomer.length).toEqual(1);

    args = {
      mainType: 'customer',
      mainTypeId: customer2._id,
      relType: 'company',
      relTypeIds: [],
    };
    await graphqlRequest(mutation, 'conformityEdit', args);

    relTypeIds = await Conformities.savedConformity({
      mainType: 'customer',
      mainTypeId: customer2._id,
      relTypes: ['customer'],
    });

    let relatedCompanies = await Companies.find({ _id: { $in: relTypeIds } });
    expect(relatedCompanies.length).toEqual(0);

    const deal = await dealFactory({});
    args = {
      mainType: 'customer',
      mainTypeId: _customer._id,
      relType: 'deal',
      relTypeIds: [deal._id],
    };
    await graphqlRequest(mutation, 'conformityEdit', args);

    relTypeIds = await Conformities.relatedConformity({
      mainType: 'company',
      mainTypeId: _company._id,
      relType: 'deal',
    });

    const relatedDeals = await Deals.find({ _id: { $in: relTypeIds } });
    expect(relatedDeals.length).toEqual(1);

    relTypeIds = await Conformities.relatedConformity({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'company',
    });

    relatedCompanies = await Companies.find({ _id: { $in: relTypeIds } });
    expect(relatedCompanies.length).toEqual(2);

    await taskFactory({});
    await taskFactory({});

    relTypeIds = await Conformities.relatedConformity({
      mainType: 'company',
      mainTypeId: _company._id,
      relType: 'task',
    });
    expect(relTypeIds.length).toEqual(0);

    relTypeIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: _company._id,
      relTypes: ['customer'],
    });

    expect(relTypeIds.length).toEqual(2);
  });

  test('Add conformity mutations', async () => {
    const company = await companyFactory({});
    const customer = await customerFactory({});

    const mutation = `
      mutation conformityAdd(
        $mainType: String!
        $mainTypeId: String!
        $relType: String!
        $relTypeId: String!
      ) {
        conformityAdd(
          mainType: $mainType
          mainTypeId: $mainTypeId
          relType: $relType
          relTypeId: $relTypeId
        ) {
          _id
        }
      }
    `;

    const args = {
      mainType: 'company',
      mainTypeId: company._id,
      relType: 'customer',
      relTypeId: customer._id,
    };
    await graphqlRequest(mutation, 'conformityAdd', args);

    const relTypeIds = await Conformities.savedConformity({
      mainType: 'company',
      mainTypeId: company._id,
      relTypes: ['customer'],
    });
    expect(relTypeIds.length).toEqual(1);
  });
});
