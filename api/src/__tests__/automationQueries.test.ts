import './setup.ts';

import * as faker from 'faker';

import AutomationsAPI from '../data/dataSources/automations';
import * as queryBuilder from '../data/modules/segments/queryBuilder';
import { graphqlRequest } from '../db/connection';
import { segmentFactory, userFactory } from '../db/factories';
import { Segments, Users } from '../db/models';

describe('Automations mutations', () => {
  let dataSources;
  let user;
  let context;
  let getAutomationSpy;

  const listParamsDef = `
  $page: Int
  $perPage: Int
  $ids: [String]
  $excludeIds: Boolean
  $searchValue: String
  $sortField: String
  $sortDirection: Int
  $status: String
`;

  const listParamsValue = `
  page: $page
  perPage: $perPage
  ids: $ids
  excludeIds: $excludeIds
  searchValue: $searchValue
  sortField: $sortField
  sortDirection: $sortDirection
  status: $status
`;

  const userFields = `
    _id
    username
    email
    details {
      avatar
      fullName
    }
  `;

  const automationFields = `
    _id
    name
    status
    triggers {
      id
      type
      actionId
      style
      config
      icon
      label
      description
      count
    }
    actions {
      id
      type
      nextActionId
      style
      config
      icon
      label
      description
    }
    createdAt
    updatedAt
    createdBy
    updatedBy
    createdUser {
      ${userFields}
    }
    updatedUser {
      ${userFields}
    }
  `;

  beforeEach(async () => {
    // Creating test data
    dataSources = { AutomationsAPI: new AutomationsAPI() };

    getAutomationSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomationDetail'
    );

    getAutomationSpy.mockImplementation(() => {
      return {
        _id: faker.random.uuid(),
        name: faker.random.word(),
        status: 'active'
      };
    });

    user = await userFactory({});
    context = { user, dataSources };
  });

  afterEach(async () => {
    await Users.deleteMany({});
    await Segments.deleteMany({});
    getAutomationSpy.mockRestore();
  });

  test('Qry Automations', async () => {
    const query = `
      query automations(${listParamsDef}) {
        automations(${listParamsValue}) {
          ${automationFields}
        }
      }
    `;

    const getAutomationsSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomations'
    );

    getAutomationsSpy.mockImplementation(() => {
      return [];
    });

    const response = await graphqlRequest(query, 'automations', {}, context);
    expect(response.length).toBe(0);

    getAutomationsSpy.mockRestore();
  });

  test('Qry Automations main', async () => {
    const query = `
      query automationsMain(${listParamsDef}) {
        automationsMain(${listParamsValue}) {
          list {
            _id
            name
            status
            triggers {
              id
            }
            actions {
              id
            }
            createdAt
            updatedAt
            createdBy
            updatedBy
            createdUser {
              ${userFields}
            }
            updatedUser {
              ${userFields}
            }
          }

          totalCount
        }
      }
    `;

    const getAutomationsSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomationsMain'
    );

    getAutomationsSpy.mockImplementation(() => {
      return {
        totalCount: 1,
        list: [
          {
            _id: faker.random.word(),
            createdBy: user._id,
            updatedBy: user._id,
            createdAt: new Date(),
            updatedAt: new Date(),
            actions: [{ _id: faker.random.word() }],
            triggers: [{ _id: faker.random.word() }]
          }
        ]
      };
    });

    const response = await graphqlRequest(
      query,
      'automationsMain',
      {},
      context
    );

    expect(response.totalCount).toBe(1);
    expect(response.list.length).toBe(1);
    expect(response.list[0].createdUser.email).toBe(user.email);
    expect(response.list[0].updatedUser.email).toBe(user.email);

    getAutomationsSpy.mockRestore();
  });

  test('Qry Automation Detail', async () => {
    const query = `
      query automationDetail($_id: String!) {
        automationDetail(_id: $_id) {
          ${automationFields}
        }
      }
    `;

    const getAutomationDetailSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomationDetail'
    );

    const segment = await segmentFactory();

    getAutomationDetailSpy.mockImplementation(() => {
      return {
        _id: faker.random.word(),
        createdBy: user._id,
        updatedBy: user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
        triggers: [
          { _id: faker.random.word(), config: { contentId: segment._id } },
          {
            _id: faker.random.word(),
            config: { contentId: faker.random.word() }
          }
        ]
      };
    });

    const response = await graphqlRequest(
      query,
      'automationDetail',
      { _id: faker.random.word() },
      context
    );
    expect(response.createdUser.email).toBe(user.email);
    expect(response.updatedUser.email).toBe(user.email);

    getAutomationDetailSpy.mockRestore();
  });

  test('Qry Automation Histories', async () => {
    const query = `
      query automationHistories($automationId: String!) {
        automationHistories(automationId: $automationId) {
          _id
          createdAt
          modifiedAt
          automationId
          status
          description
          actions
        }
      }
    `;

    const getAutomationHistoriesSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomationHistories'
    );

    getAutomationHistoriesSpy.mockImplementation(() => {
      return [
        {
          _id: faker.random.word(),
          createdAt: new Date(),
          modifiedAt: new Date(),
          automationId: faker.random.word(),
          status: 'active',
          description: faker.random.word(),
          actions: []
        }
      ];
    });

    const response = await graphqlRequest(
      query,
      'automationHistories',
      { automationId: faker.random.word() },
      context
    );
    expect(response.length).toBe(1);

    getAutomationHistoriesSpy.mockRestore();
  });

  test('Qry Automation Notes', async () => {
    const query = `
      query automationNotes($automationId: String!, $triggerId: String, $actionId: String) {
        automationNotes(automationId: $automationId, triggerId: $triggerId, actionId: $actionId) {
          _id
          description
          triggerId
          actionId
          createdUser {
            ${userFields}
          }
          createdAt
        }
      }
    `;

    const getAutomationNotesSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomationNotes'
    );

    getAutomationNotesSpy.mockImplementation(() => {
      return [
        {
          _id: faker.random.word(),
          createdAt: new Date(),
          description: faker.random.word(),
          triggerId: faker.random.word(),
          actionId: faker.random.word(),
          createdBy: user._id
        }
      ];
    });

    const response = await graphqlRequest(
      query,
      'automationNotes',
      { automationId: faker.random.word() },
      context
    );
    expect(response.length).toBe(1);
    expect(response[0].createdUser.email).toBe(user.email);

    getAutomationNotesSpy.mockRestore();
  });

  test('Qry Automation Config Prievew Count', async () => {
    const segment = await segmentFactory();

    const fetchSegmentSpy = jest.spyOn(queryBuilder, 'fetchSegment');

    fetchSegmentSpy.mockImplementation(async () => {
      return 0;
    });
    const query = `
      query automationConfigPrievewCount($config: JSON) {
        automationConfigPrievewCount(config: $config)
      }
    `;

    await graphqlRequest(
      query,
      'automationConfigPrievewCount',
      { configs: {} },
      context
    );
    await graphqlRequest(
      query,
      'automationConfigPrievewCount',
      { config: {} },
      context
    );
    await graphqlRequest(
      query,
      'automationConfigPrievewCount',
      { config: { contentId: '' } },
      context
    );
    await graphqlRequest(
      query,
      'automationConfigPrievewCount',
      { config: { contentId: 'fakeId' } },
      context
    );

    const response = await graphqlRequest(
      query,
      'automationConfigPrievewCount',
      { config: { contentId: segment._id } },
      context
    );
    expect(response).toBe(0);

    fetchSegmentSpy.mockRestore();
  });

  test('Qry Automation get total count', async () => {
    const query = `
      query automationsTotalCount($status: String) {
        automationsTotalCount(status: $status) {
          byStatus
          total
        }
      }
    `;

    const getTotalCountSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getTotalCount'
    );

    getTotalCountSpy.mockImplementation(() => {
      return {
        byStatus: 0,
        total: 0
      };
    });

    const response = await graphqlRequest(
      query,
      'automationsTotalCount',
      { status: 'active' },
      context
    );
    expect(response.total).toBe(0);

    getTotalCountSpy.mockRestore();
  });
});
