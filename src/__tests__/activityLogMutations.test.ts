import { connect, disconnect, graphqlRequest } from '../db/connection';
import { companyFactory, conversationFactory, customerFactory, dealFactory } from '../db/factories';
import { ActivityLogs, Companies, Conversations, Customers, Deals } from '../db/models';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('ActivityLog creation on Customer creation', () => {
  let _customer;
  let _company;
  let _conversation;
  let _deal;

  beforeEach(async () => {
    // Creating test data
    _customer = await customerFactory({});
    _company = await companyFactory({});
    _conversation = await conversationFactory({});
    _deal = await dealFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await ActivityLogs.remove({});
    await Conversations.remove({});
    await Customers.remove({});
    await Companies.remove({});
    await Deals.remove({});
  });

  test('Add conversation log', async () => {
    const args = {
      customerId: _customer._id,
      conversationId: _conversation._id,
    };

    const mutation = `
      mutation activityLogsAddConversationLog(
        $customerId: String!
        $conversationId: String!
      ) {
        activityLogsAddConversationLog(
          customerId: $customerId
          conversationId: $conversationId
        ) {
          _id
        }
      }
    `;

    const activityLogId = await graphqlRequest(mutation, 'activityLogsAddConversationLog', args);

    const activityLog = await ActivityLogs.findOne({ _id: activityLogId });

    if (!activityLog || !activityLog.coc || !activityLog.activity) {
      throw new Error('Activity not found');
    }

    expect(activityLog.coc.id).toBe(args.customerId);
    expect(activityLog.activity.id).toBe(args.conversationId);
  });

  test('Add customer log', async () => {
    const mutation = `
      mutation activityLogsAddCustomerLog($_id: String!) {
        activityLogsAddCustomerLog(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'activityLogsAddCustomerLog', {
      _id: _customer._id,
    });

    const customerLog = await ActivityLogs.findOne({
      'activity.id': _customer._id,
    });

    expect(customerLog).toBeDefined();
  });

  test('Add company log', async () => {
    const mutation = `
      mutation activityLogsAddCompanyLog($_id: String!) {
        activityLogsAddCompanyLog(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'activityLogsAddCompanyLog', {
      _id: _company._id,
    });

    const companyLog = await ActivityLogs.findOne({
      'activity.id': _company._id,
    });

    expect(companyLog).toBeDefined();
  });

  test('Add deal log', async () => {
    const mutation = `
      mutation activityLogsAddDealLog($_id: String!) {
        activityLogsAddDealLog(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'activityLogsAddDealLog', {
      _id: _deal._id,
    });

    const dealLog = await ActivityLogs.findOne({
      'activity.id': _deal._id,
    });

    expect(dealLog).toBeDefined();
  });
});
