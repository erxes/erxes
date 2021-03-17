import * as moment from 'moment';
import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  companyFactory,
  conformityFactory,
  customerFactory,
  dealFactory,
  fieldFactory,
  notificationFactory,
  pipelineFactory,
  pipelineLabelFactory,
  productFactory,
  stageFactory,
  userFactory
} from '../db/factories';
import { Boards, Deals, Pipelines, Stages } from '../db/models';

import { BOARD_STATUSES } from '../db/models/definitions/constants';
import './setup.ts';

const generateProductsData = async () => {
  const field1 = await fieldFactory({ contentType: 'product' });

  if (!field1) {
    throw new Error('Field not found');
  }

  const customFieldsData = [{ field: field1._id, value: 'text' }];

  const product = await productFactory({ customFieldsData });
  const productNoCustomData = await productFactory();
  const productId = product._id;

  const productsData = [
    {
      productId,
      currency: 'USD',
      amount: 200,
      tickUsed: true
    },
    {
      productId,
      currency: 'USD'
    },
    {
      productId: productNoCustomData._id
    },
    {
      productId: undefined
    }
  ];

  return {
    productsData,
    productId
  };
};

describe('dealQueries', () => {
  const commonDealFields = `
    _id
    name
    stageId
    assignedUserIds
    amount
    closeDate
    description
    companies { _id }
    customers { _id }
    products
    productsData
    assignedUsers { _id }
    labels { _id }
    hasNotified
    isWatched
    stage { _id }
    boardId
    pipeline { _id }
    userId
    createdUser { _id }
  `;

  const qryDealFilter = `
    query deals(
      $search: String
      $stageId: String
      $pipelineId: String
      $assignedUserIds: [String]
      $customerIds: [String]
      $companyIds: [String]
      $productIds: [String]
      $closeDateType: String
      $mainType: String
      $mainTypeId: String
      $isRelated: Boolean
      $isSaved: Boolean
      $date: ItemDate
      $labelIds: [String]
      $initialStageId: String
      $userIds: [String]
    ) {
      deals(
        search: $search
        stageId: $stageId
        pipelineId: $pipelineId
        customerIds: $customerIds
        assignedUserIds: $assignedUserIds
        companyIds: $companyIds
        productIds: $productIds
        closeDateType: $closeDateType
        conformityMainType: $mainType
        conformityMainTypeId: $mainTypeId
        conformityIsRelated: $isRelated
        conformityIsSaved: $isSaved
        date: $date
        labelIds: $labelIds
        initialStageId: $initialStageId
        userIds: $userIds
      ) {
        _id
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Deals.deleteMany({});
  });

  test('Filter by initialStageId', async () => {
    const deal = await dealFactory();

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      initialStageId: deal.stageId
    });

    expect(response.length).toBe(1);
  });

  test('Filter by search', async () => {
    await dealFactory({ searchText: 'name' });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      search: 'name'
    });

    expect(response.length).toBe(1);
  });

  test('Filter by next day', async () => {
    const tomorrow = moment()
      .add(1, 'day')
      .endOf('day')
      .format('YYYY-MM-DD');

    await dealFactory({ closeDate: new Date(tomorrow) });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      closeDateType: 'nextDay'
    });

    expect(response.length).toBe(1);
  });

  test('Deal filter by next week', async () => {
    const nextWeek = moment()
      .day(8)
      .format('YYYY-MM-DD');

    await dealFactory({ closeDate: new Date(nextWeek) });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      closeDateType: 'nextWeek'
    });

    expect(response.length).toBe(1);
  });

  test('Deal filter by next month', async () => {
    const nextMonth = moment()
      .add(1, 'months')
      .format('YYYY-MM-01');

    await dealFactory({ closeDate: new Date(nextMonth) });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      closeDateType: 'nextMonth'
    });

    expect(response.length).toBe(1);
  });

  test('Deal filter by has no close date', async () => {
    await dealFactory({ noCloseDate: true });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      closeDateType: 'noCloseDate'
    });

    expect(response.length).toBe(1);
  });

  test('Deal filter by overdue', async () => {
    const yesterday = moment()
      .utc()
      .subtract(1, 'days')
      .toDate();

    await dealFactory({ closeDate: yesterday });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      closeDateType: 'overdue'
    });

    expect(response.length).toBe(1);
  });

  test('Deal filter by products', async () => {
    const { productsData, productId } = await generateProductsData();

    await dealFactory({ productsData });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      productIds: [productId]
    });

    expect(response.length).toBe(1);
  });

  test('Deal filter by team members', async () => {
    const { _id } = await userFactory();

    await dealFactory({ assignedUserIds: [_id] });

    let response = await graphqlRequest(qryDealFilter, 'deals', {
      assignedUserIds: [_id]
    });

    expect(response.length).toBe(1);

    await dealFactory();

    // Filter by assigned to no one
    response = await graphqlRequest(qryDealFilter, 'deals', {
      assignedUserIds: ['']
    });

    expect(response.length).toBe(0);
  });

  test('Deal filter by customers', async () => {
    const customer1 = await customerFactory();
    const customer2 = await customerFactory();
    const user = await userFactory();
    const deal = await dealFactory();

    await notificationFactory({
      contentTypeId: deal._id,
      contentType: 'deal',
      receiver: user
    });

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'customer',
      relTypeId: customer1._id
    });

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'customer',
      relTypeId: customer2._id
    });

    await conformityFactory({
      mainType: 'customer',
      mainTypeId: customer1._id,
      relType: 'deal',
      relTypeId: deal._id
    });

    await conformityFactory({
      mainType: 'customer',
      mainTypeId: customer2._id,
      relType: 'deal',
      relTypeId: deal._id
    });

    let response = await graphqlRequest(
      qryDealFilter,
      'deals',
      {
        customerIds: [customer1._id, customer2._id]
      },
      { user }
    );

    expect(response.length).toBe(1);

    const customer3 = await customerFactory();

    response = await graphqlRequest(qryDealFilter, 'deals', {
      customerIds: [customer3._id]
    });

    expect(response.length).toBe(0);
  });

  test('Deal filter by companies', async () => {
    const { _id } = await companyFactory();

    const deal = await dealFactory();

    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'deal',
      relTypeId: deal._id
    });

    // another company choosed
    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'company',
      relTypeId: (await companyFactory())._id
    });

    let response = await graphqlRequest(qryDealFilter, 'deals', {
      companyIds: [_id]
    });

    expect(response.length).toBe(1);

    const company1 = await companyFactory();

    response = await graphqlRequest(qryDealFilter, 'deals', {
      companyIds: [company1._id]
    });

    expect(response.length).toBe(0);
  });

  test('Deal filter by label', async () => {
    const { _id } = await pipelineLabelFactory();

    await dealFactory({ labelIds: [_id] });

    let response = await graphqlRequest(qryDealFilter, 'deals', {
      labelIds: [_id]
    });

    expect(response.length).toBe(1);

    // filtering nolabelled deals
    await dealFactory();

    response = await graphqlRequest(qryDealFilter, 'deals', { labelIds: [''] });

    expect(response.length).toBe(1);
  });

  test('Deal filter by date', async () => {
    const board = await boardFactory();
    const pipeline = await pipelineFactory({ boardId: board._id });
    const stage = await stageFactory({ pipelineId: pipeline._id });

    const date = new Date();
    await dealFactory({ closeDate: date, stageId: stage._id });

    const args = {
      date: { year: date.getUTCFullYear(), month: date.getUTCMonth() },
      pipelineId: pipeline._id
    };

    const response = await graphqlRequest(qryDealFilter, 'deals', args);

    expect(response.length).toBe(1);
  });

  test('Deals filtered by created user', async () => {
    const board = await boardFactory();
    const pipeline = await pipelineFactory({ boardId: board._id });
    const stage = await stageFactory({ pipelineId: pipeline._id });

    const user = await userFactory();

    const dealParams = { userId: user._id, stageId: stage._id };

    await dealFactory(dealParams);
    await dealFactory(dealParams);
    await dealFactory(dealParams);

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      userIds: [user._id]
    });

    expect(response.length).toBe(3);
  });

  test('Deals', async () => {
    const board = await boardFactory();
    const pipeline = await pipelineFactory({ boardId: board._id });
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const currentUser = await userFactory({});

    const args = { stageId: stage._id };
    const deal = await dealFactory({ ...args, name: 'b' });
    await dealFactory({ ...args, name: 'c' });
    await dealFactory({ ...args, name: 'a' });

    Object.assign(args, { pipelineId: stage.pipelineId });
    const qry = `
      query deals($stageId: String!, $pipelineId: String, $sortField: String, $sortDirection: Int) {
        deals(stageId: $stageId, pipelineId: $pipelineId, sortField: $sortField, sortDirection: $sortDirection) {
          _id
          name
        }
      }
    `;

    let response = await graphqlRequest(qry, 'deals', args, {
      user: currentUser
    });

    expect(response.length).toBe(3);

    response = await graphqlRequest(qry, 'deals', {
      ...args,
      sortField: 'name',
      sortDirection: 1
    });

    expect(response[0].name).toBe('a');
    expect(response[1].name).toBe('b');
    expect(response[2].name).toBe('c');

    await Pipelines.updateOne(
      { _id: pipeline._id },
      { $set: { isCheckUser: true } }
    );

    response = await graphqlRequest(qry, 'deals', args, { user: currentUser });

    expect(response.length).toBe(0);

    await Deals.updateOne(
      { _id: deal._id },
      { $set: { assignedUserIds: [currentUser._id] } }
    );

    response = await graphqlRequest(qry, 'deals', args, { user: currentUser });

    expect(response.length).toBe(1);
  });

  test('Deals total count', async () => {
    const stage = await stageFactory({});
    const currentUser = await userFactory({});

    const args = { stageId: stage._id };

    await dealFactory(args);
    await dealFactory(args);

    const qry = `
      query dealsTotalCount($stageId: String!) {
        dealsTotalCount(stageId: $stageId)
      }
    `;

    const response = await graphqlRequest(qry, 'dealsTotalCount', args, {
      user: currentUser
    });

    expect(response).toBe(2);
  });

  test('Deal detail', async () => {
    const currentUser = await userFactory({});
    const board = await boardFactory();
    const pipeline = await pipelineFactory({ boardId: board._id });
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const { productsData } = await generateProductsData();

    const deal = await dealFactory({
      stageId: stage._id,
      watchedUserIds: [currentUser._id],
      productsData
    });

    const args = { _id: deal._id };

    const qry = `
      query dealDetail($_id: String!) {
        dealDetail(_id: $_id) {
          ${commonDealFields}
        }
      }
    `;

    let response = await graphqlRequest(qry, 'dealDetail', args, {
      user: currentUser
    });
    expect(response._id).toBe(deal._id);

    await Pipelines.updateOne(
      { _id: pipeline._id },
      { $set: { visibility: 'private' } }
    );
    try {
      response = await graphqlRequest(qry, 'dealDetail', args, {
        user: currentUser
      });
    } catch (e) {
      expect(e[0].message).toEqual('You do not have permission to view.');
    }

    await Pipelines.updateOne(
      { _id: pipeline._id },
      { $set: { memberIds: [currentUser._id] } }
    );
    response = await graphqlRequest(qry, 'dealDetail', args, {
      user: currentUser
    });
    expect(response._id).toBe(deal._id);

    await Pipelines.updateOne(
      { _id: pipeline._id },
      { $set: { visibility: 'public', isCheckUser: true } }
    );
    try {
      response = await graphqlRequest(qry, 'dealDetail', args, {
        user: currentUser
      });
    } catch (e) {
      expect(e[0].message).toEqual('You do not have permission to view.');
    }

    await Pipelines.updateOne(
      { _id: pipeline._id },
      { $set: { excludeCheckUserIds: [currentUser._id] } }
    );
    response = await graphqlRequest(qry, 'dealDetail', args, {
      user: currentUser
    });
    expect(response._id).toBe(deal._id);

    await Pipelines.updateOne(
      { _id: pipeline._id },
      { $set: { excludeCheckUserIds: [], isCheckUser: true } }
    );
    await Deals.updateOne(
      { _id: deal._id },
      { $set: { assignedUserIds: [currentUser._id] } }
    );
    response = await graphqlRequest(qry, 'dealDetail', args, {
      user: currentUser
    });
    expect(response._id).toBe(deal._id);
    expect(response.isWatched).toBe(true);
  });

  test('Deal total amount', async () => {
    const board = await boardFactory();
    const pipeline = await pipelineFactory({ boardId: board._id });
    const stage = await stageFactory({ pipelineId: pipeline._id });

    const product = await productFactory();
    const productsData = [
      {
        productId: product._id,
        currency: 'USD',
        amount: 200,
        tickUsed: true
      }
    ];

    const args = {
      stageId: stage._id,
      productsData
    };

    await dealFactory(args);
    await dealFactory(args);
    await dealFactory(args);

    const filter = { pipelineId: pipeline._id };

    const qry = `
      query dealsTotalAmounts($pipelineId: String) {
        dealsTotalAmounts(pipelineId: $pipelineId) {
          _id
          name
          currencies {
            name
            amount
          }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dealsTotalAmounts', filter);

    expect(response[0].currencies[0].name).toBe('USD');
    expect(response[0].currencies[0].amount).toBe(600);
  });

  test('Deal (=ticket, task) filter by conformity saved and related', async () => {
    const { _id } = await companyFactory();

    const deal = await dealFactory();
    await dealFactory();

    await customerFactory({});
    await companyFactory({});

    let response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'company',
      mainTypeId: _id,
      isSaved: true
    });

    expect(response.length).toBe(0);

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'company',
      mainTypeId: _id,
      isRelated: true
    });

    expect(response.length).toBe(0);

    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'deal',
      relTypeId: deal._id
    });

    const customer = await customerFactory({});
    await conformityFactory({
      mainType: 'company',
      mainTypeId: _id,
      relType: 'customer',
      relTypeId: customer._id
    });

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'company',
      mainTypeId: _id,
      isSaved: true
    });

    expect(response.length).toBe(1);

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'company',
      mainTypeId: _id,
      isRelated: true
    });

    expect(response.length).toBe(0);

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'customer',
      mainTypeId: customer._id,
      isSaved: true
    });

    expect(response.length).toBe(0);

    response = await graphqlRequest(qryDealFilter, 'deals', {
      mainType: 'customer',
      mainTypeId: customer._id,
      isRelated: true
    });

    expect(response.length).toBe(1);
  });

  test('Deal filter by customers and companies', async () => {
    const customer = await customerFactory();
    const company = await companyFactory();

    const deal = await dealFactory();
    const deal1 = await dealFactory();
    const deal2 = await dealFactory();

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'customer',
      relTypeId: customer._id
    });

    await conformityFactory({
      mainType: 'company',
      mainTypeId: company._id,
      relType: 'deal',
      relTypeId: deal._id
    });

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal1._id,
      relType: 'customer',
      relTypeId: customer._id
    });

    await conformityFactory({
      mainType: 'company',
      mainTypeId: company._id,
      relType: 'deal',
      relTypeId: deal2._id
    });

    const response = await graphqlRequest(qryDealFilter, 'deals', {
      customerIds: [customer._id],
      companyIds: [company._id]
    });

    expect(response.length).toBe(1);
  });

  test('Get archived deals', async () => {
    const pipeline = await pipelineFactory();
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const args = {
      stageId: stage._id,
      status: BOARD_STATUSES.ARCHIVED
    };

    await dealFactory({ ...args, name: 'james' });
    await dealFactory({ ...args, name: 'jone' });
    await dealFactory({ ...args, name: 'gerrad' });

    const qry = `
      query archivedDeals(
        $pipelineId: String!,
        $search: String,
        $page: Int,
        $perPage: Int
      ) {
        archivedDeals(
          pipelineId: $pipelineId
          search: $search
          page: $page
          perPage: $perPage
        ) {
          _id
        }
      }
    `;

    let response = await graphqlRequest(qry, 'archivedDeals', {
      pipelineId: pipeline._id
    });

    expect(response.length).toBe(3);

    response = await graphqlRequest(qry, 'archivedDeals', {
      pipelineId: pipeline._id,
      search: 'james'
    });

    expect(response.length).toBe(1);

    response = await graphqlRequest(qry, 'archivedDeals', {
      pipelineId: 'fakeId'
    });

    expect(response.length).toBe(0);
  });

  test('Get archived deals count', async () => {
    const pipeline = await pipelineFactory();
    const stage = await stageFactory({ pipelineId: pipeline._id });
    const args = {
      stageId: stage._id,
      status: BOARD_STATUSES.ARCHIVED
    };

    await dealFactory({ ...args, name: 'james' });
    await dealFactory({ ...args, name: 'jone' });
    await dealFactory({ ...args, name: 'gerrad' });

    const qry = `
      query archivedDealsCount(
        $pipelineId: String!,
        $search: String
      ) {
        archivedDealsCount(
          pipelineId: $pipelineId
          search: $search
        )
      }
    `;

    let response = await graphqlRequest(qry, 'archivedDealsCount', {
      pipelineId: pipeline._id
    });

    expect(response).toBe(3);

    response = await graphqlRequest(qry, 'archivedDealsCount', {
      pipelineId: pipeline._id,
      search: 'james'
    });

    expect(response).toBe(1);

    response = await graphqlRequest(qry, 'archivedDealsCount', {
      pipelineId: 'fakeId'
    });

    expect(response).toBe(0);
  });
});
