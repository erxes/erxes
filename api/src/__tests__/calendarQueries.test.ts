import { IntegrationsAPI } from '../data/dataSources';
import { graphqlRequest } from '../db/connection';
import {
  calendarBoardFactory,
  calendarFactory,
  calendarGroupFactory,
  userFactory
} from '../db/factories';
import { CalendarBoards, CalendarGroups, Calendars, Users } from '../db/models';

import './setup.ts';

describe('calendarQueries', () => {
  let _calendar;
  let _group;
  let _user;
  let _board;
  let dataSources;

  beforeEach(async () => {
    // Creating test data
    dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    _user = await userFactory({});
    _board = await calendarBoardFactory();
    _group = await calendarGroupFactory({
      boardId: _board._id,
      memberIds: [_user._id]
    });
    _calendar = await calendarFactory({ groupId: _group._id });
  });

  afterEach(async () => {
    // Clearing test data
    await Calendars.deleteMany({});
    await CalendarGroups.deleteMany({});
    await CalendarBoards.deleteMany({});
    await Users.deleteMany({});
  });

  test('Calendar groups', async () => {
    const boardId = _board._id;
    await calendarGroupFactory({
      boardId,
      userId: _user._id,
      isPrivate: true
    });
    await calendarGroupFactory({ boardId });

    const qry = `
      query calendarGroups($boardId: String) {
        calendarGroups(boardId: $boardId) {
          _id
          name
        }
      }
    `;

    let response = await graphqlRequest(qry, 'calendarGroups', {
      boardId
    });

    expect(response.length).toBe(2);

    response = await graphqlRequest(
      qry,
      'calendarGroups',
      { boardId },
      {
        user: _user
      }
    );

    expect(response.length).toBe(3);
  });

  test('Calendar group detail', async () => {
    const qry = `
      query calendarGroupDetail($_id: String!) {
        calendarGroupDetail(_id: $_id) {
          _id,
          name,
          isPrivate,

          calendars {
            _id
          }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'calendarGroupDetail', {
      _id: _group._id
    });

    expect(response).toBeDefined();
    expect(response._id).toEqual(_group._id);
    expect(response.name).toEqual(_group.name);
    expect(response.isPrivate).toEqual(_group.isPrivate);
    expect(response.calendars[0]._id).toEqual(_calendar._id);
  });

  test('Calendar group get last', async () => {
    const qry = `
      query calendarGroupGetLast {
        calendarGroupGetLast {
          _id,
          name,
          isPrivate
        }
      }
    `;

    const response = await graphqlRequest(qry, 'calendarGroupGetLast');

    expect(response).toBeDefined();
    expect(response._id).toEqual(_group._id);
  });

  test('Calendar group total count', async () => {
    await calendarGroupFactory();
    await calendarGroupFactory();

    const qry = `
      query calendarGroupCounts {
        calendarGroupCounts
      }
    `;

    const totalCount = await graphqlRequest(qry, 'calendarGroupCounts');

    expect(totalCount).toBe(3);
  });

  test('Calendars', async () => {
    const secondGroup = await calendarGroupFactory();
    await calendarFactory({ groupId: secondGroup._id });

    const qry = `
      query calendars($groupId: String, $page: Int, $perPage: Int) {
        calendars(groupId: $groupId, page: $page, perPage: $perPage) {
          _id,
          name,
          color,
        }
      }
    `;

    let response = await graphqlRequest(qry, 'calendars');

    expect(response.length).toBe(2);

    response = await graphqlRequest(qry, 'calendars', { perPage: 1, page: 1 });

    expect(response.length).toBe(1);

    response = await graphqlRequest(qry, 'calendars', { groupId: _group._id });

    expect(response.length).toBe(1);
  });

  test('Calendar detail', async () => {
    const qry = `
      query calendarDetail($_id: String!) {
        calendarDetail(_id: $_id) {
          _id,
          name
        }
      }
    `;

    const response = await graphqlRequest(qry, 'calendarDetail', {
      _id: _calendar._id
    });

    expect(response).toBeDefined();
    expect(response._id).toEqual(_calendar._id);
    expect(response.name).toEqual(_calendar.name);
  });

  test('Calendar boards', async () => {
    const qry = `
      query calendarBoards {
        calendarBoards {
          _id
          name
        }
      }
    `;

    const response = await graphqlRequest(qry, 'calendarBoards');

    expect(response.length).toBe(1);
    expect(response[0].name).toBe(_board.name);
  });

  test('Calendar board detail', async () => {
    const qry = `
      query calendarBoardDetail($_id: String!) {
        calendarBoardDetail(_id: $_id) {
          _id,
          name,

          groups {
            _id
            name
          }
        }
      }
    `;

    const response = await graphqlRequest(qry, 'calendarBoardDetail', {
      _id: _board._id
    });

    expect(response).toBeDefined();
    expect(response._id).toEqual(_board._id);
    expect(response.name).toEqual(_board.name);
    expect(response.groups[0]._id).toEqual(_group._id);
  });

  test('Calendar board get last', async () => {
    const qry = `
      query calendarBoardGetLast {
        calendarBoardGetLast {
          _id,
          name
        }
      }
    `;

    const response = await graphqlRequest(qry, 'calendarBoardGetLast');

    expect(response).toBeDefined();
    expect(response._id).toEqual(_board._id);
  });

  test('Calendar accounts', async () => {
    const qry = `
      query calendarAccounts($groupId: String) {
        calendarAccounts(groupId: $groupId) {
          _id
          name
          color
          accountId
      
          calendars {
            _id
            providerCalendarId
            accountUid
            name
            description
            readOnly
          }
        }
      }
    `;

    const getCalendarsSpy = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');

    getCalendarsSpy.mockImplementation(() =>
      Promise.resolve([{ _id: 'calendarId', name: 'test calendar' }])
    );

    const response = await graphqlRequest(
      qry,
      'calendarAccounts',
      {
        groupId: _group._id
      },
      {
        dataSources
      }
    );

    expect(response).toBeDefined();
    expect(response[0]._id).toEqual(_calendar._id);
    expect(response[0].name).toEqual(_calendar.name);

    getCalendarsSpy.mockImplementation(() => {
      throw new Error('Account not found');
    });

    await graphqlRequest(
      qry,
      'calendarAccounts',
      {
        groupId: _group._id
      },
      {
        dataSources
      }
    );

    const calendar = await Calendars.findOne({ _id: _calendar._id });

    expect(calendar).toBeNull();
  });
});
