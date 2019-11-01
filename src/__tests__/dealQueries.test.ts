import * as moment from 'moment';
import { graphqlRequest } from '../db/connection';
import {
  companyFactory,
  conformityFactory,
  customerFactory,
  dealFactory,
  productFactory,
  stageFactory,
  userFactory,
} from '../db/factories';
import { Deals } from '../db/models';

import './setup.ts';

describe('dealQueries', () => {
  const commonDealTypes = `
    _id
    name
    stageId
    assignedUserIds
    amount
    closeDate
    description
    companies {
      _id
    }
    customers {
      _id
    }
    products
    productsData
    assignedUsers {
      _id
    }
  `;

  const qryDealFilter = `
    query deals(
      $stageId: String
      $assignedUserIds: [String]
      $customerIds: [String]
      $companyIds: [String]
      $productIds: [String]
      $nextDay: String
      $nextWeek: String
      $nextMonth: String
      $noCloseDate: String
      $overdue: String
      $mainType: String
      $mainTypeId: String
      $isRelated: Boolean
      $isSaved: Boolean
    ) {
      deals(
        stageId: $stageId
        customerIds: $customerIds
        assignedUserIds: $assignedUserIds
        companyIds: $companyIds
        productIds: $productIds
        nextDay: $nextDay
        nextWeek: $nextWeek
        nextMonth: $nextMonth
        noCloseDate: $noCloseDate
        overdue: $overdue
        conformityMainType: $mainType
        conformityMainTypeId: $mainTypeId
        conformityIsRelated: $isRelated
        conformityIsSaved: $isSaved
      ) {
        ${commonDealTypes}
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Deals.deleteMany({});
  });

  test('Filter by next day', async () => {
    const tomorrow = moment()
      .add(1, 'day')
      .endOf('day')
      .format('YYYY-MM-DD');

    await dealFactory({ closeDate: new Date(tomorrow) });

    const response = await graphqlRequest(qryDealFilter, 'deals', { nextDay: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by next week', async () => {
    const nextWeek = moment()
      .day(8)
      .format('YYYY-MM-DD');

    await dealFactory({ closeDate: new Date(nextWeek) });

    const response = await graphqlRequest(qryDealFilter, 'deals', { nextWeek: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by next month', async () => {
    const nextMonth = moment()
      .add(1, 'months')
      .format('YYYY-MM-01');

    await dealFactory({ closeDate: new Date(nextMonth) });

    const response = await graphqlRequest(qryDealFilter, 'deals', { nextMonth: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by has no close date', async () => {
    await dealFactory({ noCloseDate: true });

    const response = await graphqlRequest(qryDealFilter, 'deals', { noCloseDate: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by overdue', async () => {
    const yesterday = moment()
      .utc()
      .subtract(1, 'days')
      .toDate();

    await dealFactory({ closeDate: yesterday });

    const response = await graphqlRequest(qryDealFilter, 'deals', { overdue: 'true' });

    expect(response.length).toBe(1);
  });

  test('Deal filter by products', async () => {
    const product = await productFactory();
    const productId = product._id;

    await dealFactory({ productsData: { productId } });

    const response = await graphqlRequest(qryDealFilter, 'deals', { productIds: [productId] });

    expect(response.length).toBe(1);
  });

  test('Deal filter by team members', async () => {
    const { _id } = await userFactory();

    await dealFactory({ assignedUserIds: [_id] });

    const response = await graphqlRequest(qryDealFilter, 'deals', { assignedUserIds: [_id] });

    expect(response.length).toBe(1);
  });

  test('Deal filter by customers', async () => {
    const { _id } = await customerFactory();
    const deal = await dealFactory({});

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'customer',
      relTypeId: _id,
    });

    let response = await graphqlRequest(qryDealFilter, 'deals', { customerIds: [_id] });

    expect(response.length).toBe(1);

    const customer1 = await customerFactory();

    response = await graphqlRequest(qryDealFilter, 'deals', { customerIds: [customer1._id] });

    expect(response.length).toBe(0);
  });

  test('Deal filter by companies', async () => {
    const { _id } = await companyFactory();

    const deal = await dealFactory({});

    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'deal',
      relTypeId: deal._id,
    });

    let response = await graphqlRequest(qryDealFilter, 'deals', { companyIds: [_id] });

    expect(response.length).toBe(1);

    const company1 = await companyFactory();

    response = await graphqlRequest(qryDealFilter, 'deals', { companyIds: [company1._id] });

    expect(response.length).toBe(0);
  });

  test('Deals', async () => {
    const stage = await stageFactory();

    const args = { stageId: stage._id };

    await dealFactory(args);
    await dealFactory(args);
    await dealFactory(args);

    const qry = `
      query deals($stageId: String!) {
        deals(stageId: $stageId) {
          ${commonDealTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'deals', args);

    expect(response.length).toBe(3);
  });

  test('Deal detail', async () => {
    const deal = await dealFactory();

    const args = { _id: deal._id };

    const qry = `
      query dealDetail($_id: String!) {
        dealDetail(_id: $_id) {
          ${commonDealTypes}
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealDetail', args);

    expect(response._id).toBe(deal._id);
  });

  test('Deal (=ticket, task) filter by conformity saved and related', async () => {
    const { _id } = await companyFactory();

    const deal = await dealFactory({});
    await dealFactory({});
    await customerFactory({});
    await companyFactory({});

    let response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'company',
      mainTypeId: _id,
      isSaved: true,
    });

    expect(response.length).toBe(0);

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'company',
      mainTypeId: _id,
      isRelated: true,
    });

    expect(response.length).toBe(0);

    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'deal',
      relTypeId: deal._id,
    });

    const customer = await customerFactory({});
    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'customer',
      relTypeId: customer._id,
    });

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'company',
      mainTypeId: _id,
      isSaved: true,
    });

    expect(response.length).toBe(1);

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'company',
      mainTypeId: _id,
      isRelated: true,
    });

    expect(response.length).toBe(0);

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'customer',
      mainTypeId: customer._id,
      isSaved: true,
    });

    expect(response.length).toBe(0);

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'customer',
      mainTypeId: customer._id,
      isRelated: true,
    });

    expect(response.length).toBe(1);
  });

  test('Deal filter by customers and companies', async () => {
    const customer = await customerFactory();
    const company = await companyFactory();
    const deal = await dealFactory({});
    const deal1 = await dealFactory({});
    const deal2 = await dealFactory({});

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'customer',
      relTypeId: customer._id,
    });

    await conformityFactory({
      mainType: 'company',
      mainTypeId: company._id,
      relType: 'deal',
      relTypeId: deal._id,
    });

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal1._id,
      relType: 'customer',
      relTypeId: customer._id,
    });

    await conformityFactory({
      mainType: 'company',
      mainTypeId: company._id,
      relType: 'deal',
      relTypeId: deal2._id,
    });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      customerIds: [customer._id],
      companyIds: [company._id],
    });

    expect(response.length).toBe(1);
  });
});
