import * as sinon from 'sinon';
import * as utils from '../data/utils';
import { graphqlRequest } from '../db/connection';
import { dashboardFactory, dashboardItemsFactory } from '../db/factories';
import { DashboardItems, Dashboards } from '../db/models';

import './setup.ts';

describe('Test dashboard mutations', () => {
  afterEach(async () => {
    // Clearing test data
    await DashboardItems.deleteMany({});
    await Dashboards.deleteMany({});
  });

  test('Create dashboard', async () => {
    const args = { name: 'deal board' };

    const mutation = `
      mutation dashboardAdd($name: String) {
        dashboardAdd(name: $name) {
          _id
          name
        }
      }
    `;

    const createdDashboard = await graphqlRequest(
      mutation,
      'dashboardAdd',
      args
    );

    expect(createdDashboard.name).toEqual(args.name);
  });

  test('Update dashboard', async () => {
    const dashboard = await dashboardFactory({});
    const args = { _id: dashboard._id, name: 'dashboardName' };

    const mutation = `
      mutation dashboardEdit($_id: String!, $name: String!) {
        dashboardEdit(name: $name, _id: $_id) {
          _id
          name
        }
      }
    `;

    const response = await graphqlRequest(mutation, 'dashboardEdit', args);

    expect(response._id).toBe(args._id);
    expect(response.name).toBe(args.name);
  });

  test('Remove dashboard', async () => {
    // disconnect pipeline connected to board
    const dashboard = await dashboardFactory({});

    const mutation = `
      mutation dashboardRemove($_id: String!) {
        dashboardRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'dashboardRemove', { _id: dashboard._id });

    expect(await Dashboards.findOne({ _id: dashboard._id })).toBe(null);
  });

  test('Create dashboard item', async () => {
    const args = { name: 'dashboardItem' };

    const mutation = `
      mutation dashboardItemAdd($name: String) {
        dashboardItemAdd(name: $name) {
          _id
          name
        }
      }
    `;

    const createdDashboardItem = await graphqlRequest(
      mutation,
      'dashboardItemAdd',
      args
    );

    expect(createdDashboardItem.name).toEqual(args.name);
  });

  test('Update dashboard item', async () => {
    const dashboardItem = await dashboardItemsFactory({});
    const args = { _id: dashboardItem._id, name: 'dashboardName' };

    const mutation = `
      mutation dashboardItemEdit($_id: String!, $name: String!) {
        dashboardItemEdit(name: $name, _id: $_id) {
          _id
          name
        }
      }
    `;

    const response = await graphqlRequest(mutation, 'dashboardItemEdit', args);

    expect(response._id).toBe(args._id);
    expect(response.name).toBe(args.name);
  });

  test('Remove dashboard item', async () => {
    // disconnect pipeline connected to board
    const dashboard = await dashboardItemsFactory({});

    const mutation = `
      mutation dashboardItemRemove($_id: String!) {
        dashboardItemRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'dashboardItemRemove', {
      _id: dashboard._id
    });

    expect(await DashboardItems.findOne({ _id: dashboard._id })).toBe(null);
  });

  test('Dashboard dashboard send email', async () => {
    const mock = sinon.stub(utils, 'getDashboardFile').callsFake(() => {
      return Promise.resolve('success');
    });
    // disconnect pipeline connected to board
    const dashboard = await dashboardItemsFactory({});

    const mutation = `
      mutation dashboardSendEmail($dashboardId: String!, $toEmails: [String]!, $subject: String, $content: String, $sendUrl:Boolean){
        dashboardSendEmail(dashboardId: $dashboardId, toEmails: $toEmails, subject: $subject, content: $content, sendUrl: $sendUrl)
      }
    `;

    const response1 = await graphqlRequest(mutation, 'dashboardSendEmail', {
      dashboardId: dashboard._id,
      toEmails: ['test@gmail.com'],
      content: 'test'
    });

    const response2 = await graphqlRequest(mutation, 'dashboardSendEmail', {
      dashboardId: dashboard._id,
      toEmails: ['test@gmail.com'],
      content: 'test',
      sendUrl: true
    });

    expect(response1).toBeDefined();
    expect(response2).toBeDefined();

    mock.restore();
  });
});
