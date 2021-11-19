import { graphqlRequest } from '../db/connection';
import { dashboardFactory, dashboardItemsFactory } from '../db/factories';
import { DashboardItems, Dashboards } from '../db/models';

import './setup.ts';

import { HelpersApi } from '../data/dataSources';

describe('dashboardQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Dashboards.deleteMany({});
    await DashboardItems.deleteMany({});
  });

  test('Dashboards', async () => {
    await dashboardFactory({ name: 'name 1' });
    await dashboardFactory({ name: 'name 2' });
    await dashboardFactory({ name: 'name 3' });

    const qry = `
      query dashboards {
        dashboards {
          _id
          name
        }
      }
    `;

    const response = await graphqlRequest(qry, 'dashboards');

    expect(response.length).toBe(3);
  });

  test('Dashboard detail', async () => {
    const qry = `
      query dashboardDetails($_id: String!) {
        dashboardDetails(_id: $_id) {
          _id
          name
        }
      }
    `;

    const dashboard = await dashboardFactory({});

    const response = await graphqlRequest(qry, 'dashboardDetails', {
      _id: dashboard._id
    });

    expect(response._id).toBe(dashboard._id);
  });

  test('Get dashboard total count', async () => {
    const qry = `
      query dashboardsTotalCount {
        dashboardsTotalCount
      }
    `;

    await dashboardFactory({});
    await dashboardFactory({});
    await dashboardFactory({});

    const brandsCount = await graphqlRequest(qry, 'dashboardsTotalCount');

    expect(brandsCount).toBe(3);
  });

  test('Get dashboard items', async () => {
    const qry = `
      query dashboardItems($dashboardId: String!) {
        dashboardItems(dashboardId: $dashboardId) {
          dashboardId
          layout
          vizState
          name
          type
          isDateRange
        }
      }
    `;

    const dashboard = await dashboardFactory({});

    await dashboardItemsFactory({ dashboardId: dashboard._id });
    await dashboardItemsFactory({ dashboardId: dashboard._id });

    const dashboardItems = await graphqlRequest(qry, 'dashboardItems', {
      dashboardId: dashboard._id
    });

    expect(dashboardItems.length).toBe(2);
  });

  test('Get dashboard items', async () => {
    const qry = `
      query dashboardItemDetail($_id: String!) {
        dashboardItemDetail(_id: $_id) {
          dashboardId
          layout
          vizState
          name
          type
        }
      }
    `;

    const dashboardItem = await dashboardItemsFactory({
      name: 'dashboardItem name'
    });

    const dashboardItemDetail = await graphqlRequest(
      qry,
      'dashboardItemDetail',
      { _id: dashboardItem._id }
    );

    expect(dashboardItemDetail.name).toBe('dashboardItem name');
  });

  test('Get initial datas of dashboard', async () => {
    const qry = `
      query dashboardInitialDatas($type: String) {
       dashboardInitialDatas(type: $type){
          vizState
          name
          type
        }
      }
    `;

    const dataSources = { HelpersApi: new HelpersApi() };

    const spy = jest.spyOn(dataSources.HelpersApi, 'fetchApi');
    spy.mockImplementation(() =>
      Promise.resolve([
        { name: 'name', vizState: 'vizState', type: 'vizState' }
      ])
    );

    const response = await graphqlRequest(
      qry,
      'dashboardInitialDatas',
      {},
      {
        dataSources
      }
    );

    expect(response).toBeDefined();

    spy.mockRestore();
  });

  test('Get filters of dashboard', async () => {
    const qry = `
      query dashboardFilters($type: String) {
        dashboardFilters(type: $type)
      }
    `;

    const types = [
      'pipeline',
      'modifiedBy',
      'integrationName',
      'integrationType',
      'brand',
      'test',
      'tag',
      'Conversations.tag',
      'Companies.tag',
      'Tasks.board',
      'Tickets.board',
      'board',
      'ConversationProperties.customerFirstName'
    ];

    types.forEach(async type => {
      const response = await graphqlRequest(qry, 'dashboardFilters', {
        type
      });

      expect(response).toBeDefined();
    });
  });
});
