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

describe('Test calendars mutations', () => {
  let calendar;
  let group;
  let board;
  let dataSources;
  let user;

  beforeEach(async () => {
    // Creating test data
    dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    user = await userFactory({});
    board = await calendarBoardFactory({});
    group = await calendarGroupFactory({ boardId: board._id });
    calendar = await calendarFactory({
      groupId: group._id
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Calendars.deleteMany({});
    await CalendarGroups.deleteMany({});
    await CalendarBoards.deleteMany({});
  });

  const commonGroupParamDefs = `
    $boardId: String!,
    $name: String!,
    $isPrivate: Boolean,
    $memberIds: [String]
  `;

  const commonGroupParams = `
    boardId: $boardId,
    name: $name,
    isPrivate: $isPrivate
    memberIds: $memberIds,
  `;

  const commonParamDefs = `
    $groupId: String!,
    $color: String
  `;

  const commonParams = `
    groupId: $groupId
    color: $color
  `;

  const removeCalendar = async () => {
    const mutation = `
      mutation calendarsDelete($_id: String!, $accountId: String!) {
        calendarsDelete(_id: $_id, accountId: $accountId)
      }
    `;

    const deleteCalendarSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'deleteCalendars'
    );

    deleteCalendarSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'calendarsDelete',
      {
        _id: calendar._id,
        accountId: 'erxesApiId'
      },
      {
        dataSources
      }
    );
    deleteCalendarSpy.mockRestore();
  };

  const removeGroup = async () => {
    await removeCalendar();

    const mutation = `
      mutation calendarGroupsDelete($_id: String!) {
        calendarGroupsDelete(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'calendarGroupsDelete', { _id: group._id });
  };

  test('Connect calendars', async () => {
    await removeCalendar();

    const args = {
      uid: 'nylasAccountId',
      groupId: group._id
    };

    const mutation = `
      mutation calendarsAdd($uid: String, ${commonParamDefs}) {
        calendarsAdd(uid: $uid, ${commonParams}) {
          _id
          name
          color
        }
      }
    `;

    try {
      await graphqlRequest(mutation, 'calendarsAdd', args, { dataSources: {} });
    } catch (e) {
      expect(e).toBeDefined();
    }

    const addCalendarSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'connectCalendars'
    );

    addCalendarSpy.mockImplementation(() =>
      Promise.resolve({
        accountId: 'integrationAccountId',
        email: 'email@gmail.com'
      })
    );

    const createdCalendar = await graphqlRequest(
      mutation,
      'calendarsAdd',
      args,
      { dataSources }
    );

    // expect(createdCalendar.name).toEqual('email@gmail.com');
    expect(createdCalendar.color).toBeDefined();
    addCalendarSpy.mockRestore();
  });

  test('Edit calendar', async () => {
    const args = {
      _id: calendar._id,
      accountId: 'erxesApiId',
      groupId: group._id,
      color: '#fff'
    };

    const mutation = `
      mutation calendarsEdit($_id: String!, ${commonParamDefs}) {
        calendarsEdit(_id: $_id, ${commonParams}) {
          _id
          name
          color
        }
      }
    `;

    const updatedCalendar = await graphqlRequest(
      mutation,
      'calendarsEdit',
      args
    );

    expect(updatedCalendar.color).toBeDefined();
    expect(updatedCalendar.color).toEqual(args.color);
  });

  test('Remove calendar', async () => {
    const mutation = `
      mutation calendarsDelete($_id: String!, $accountId: String!) {
        calendarsDelete(_id: $_id, accountId: $accountId)
      }
    `;

    try {
      await graphqlRequest(mutation, 'calendarsDelete', {
        _id: calendar._id,
        accountId: 'erxesApiId'
      });
    } catch (e) {
      expect(e).toBeDefined();
    }

    await removeCalendar();

    expect(await Calendars.countDocuments({})).toBe(0);
  });

  test('Create group', async () => {
    const args = {
      name: group.name,
      boardId: board._id
    };

    const mutation = `
      mutation calendarGroupsAdd(${commonGroupParamDefs}) {
        calendarGroupsAdd(${commonGroupParams}) {
          _id
          name
          isPrivate
        }
      }
    `;

    const createdGroup = await graphqlRequest(
      mutation,
      'calendarGroupsAdd',
      args
    );

    expect(createdGroup.name).toEqual(args.name);
    expect(createdGroup.isPrivate).toEqual(false);
    expect(await CalendarGroups.countDocuments({})).toEqual(2);
  });

  test('Edit group', async () => {
    const args = {
      _id: group._id,
      boardId: board._id,
      name: `${group.name}-updated`,
      isPrivate: true
    };

    const mutation = `
      mutation calendarGroupsEdit($_id: String!, ${commonGroupParamDefs}) {
        calendarGroupsEdit(_id: $_id, ${commonGroupParams}) {
          _id
          name
          isPrivate
        }
      }
    `;

    const updatedGroup = await graphqlRequest(
      mutation,
      'calendarGroupsEdit',
      args
    );

    expect(updatedGroup.name).toEqual(`${group.name}-updated`);
    expect(updatedGroup.isPrivate).not.toEqual(group.isPrivate);
  });

  test('Remove group', async () => {
    await removeGroup();

    expect(await CalendarGroups.countDocuments({})).toBe(0);
  });

  test('Create board', async () => {
    const args = {
      name: board.name
    };

    const mutation = `
      mutation calendarBoardsAdd($name: String!) {
        calendarBoardsAdd(name: $name) {
          _id
          name
        }
      }
    `;

    const createdBoard = await graphqlRequest(
      mutation,
      'calendarBoardsAdd',
      args
    );

    expect(createdBoard.name).toEqual(args.name);
    expect(await CalendarBoards.countDocuments({})).toEqual(2);
  });

  test('Edit board', async () => {
    const args = {
      _id: board._id,
      name: `${board.name}-updated`
    };

    const mutation = `
      mutation calendarBoardsEdit($_id: String!, $name: String!) {
        calendarBoardsEdit(_id: $_id, name: $name) {
          _id
          name
        }
      }
    `;

    const updatedBoard = await graphqlRequest(
      mutation,
      'calendarBoardsEdit',
      args
    );

    expect(updatedBoard.name).toEqual(`${board.name}-updated`);
  });

  test('Remove board', async () => {
    await removeGroup();

    const mutation = `
      mutation calendarBoardsDelete($_id: String!) {
        calendarBoardsDelete(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'calendarBoardsDelete', { _id: board._id });

    expect(await CalendarBoards.countDocuments({})).toBe(0);
  });

  const eventParamDefs = `
    $accountId: String!,
    $calendarId: String!,
    $title: String!,
    $description: String,
    $start: String,
    $end: String

    $participants: [Participant],
    $rrule: String,
    $timezone: String,
    $location: String,
    $busy: Boolean,
  `;

  const eventParams = `
    accountId: $accountId,
    calendarId: $calendarId,
    title: $title,
    description: $description,
    start: $start,
    end: $end

    participants: $participants,
    rrule: $rrule,
    timezone: $timezone,
    location: $location,
    busy: $busy,
  `;

  const eventArgs = {
    accountId: 'accountId',
    calendarId: 'cl',
    title: 'New Calendar'
  };

  test('Create calendar event', async () => {
    const mutation = `
      mutation createCalendarEvent(${eventParamDefs}) {
        createCalendarEvent(${eventParams})
      }
    `;

    const createEventSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'createCalendarEvent'
    );

    createEventSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'createCalendarEvent',
      {
        memberIds: [user._id],
        ...eventArgs
      },
      {
        dataSources
      }
    );
    createEventSpy.mockRestore();
  });

  test('Update calendar event', async () => {
    const mutation = `
      mutation editCalendarEvent($_id: String!, ${eventParamDefs}) {
        editCalendarEvent(_id: $_id, ${eventParams})
      }
    `;

    const createEventSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'editCalendarEvent'
    );

    createEventSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'editCalendarEvent',
      { _id: 'eventId', ...eventArgs },
      {
        dataSources
      }
    );
    createEventSpy.mockRestore();
  });

  test('Delete calendar event', async () => {
    const mutation = `
      mutation deleteCalendarEvent($_id: String!, $accountId: String!) {
        deleteCalendarEvent(_id: $_id, accountId: $accountId)
      }
    `;

    const createEventSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'deleteCalendarEvent'
    );

    createEventSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'deleteCalendarEvent',
      { _id: 'eventId', accountId: 'accountId' },
      {
        dataSources
      }
    );
    createEventSpy.mockRestore();
  });

  test('Update account calendar', async () => {
    const mutation = `
      mutation editAccountCalendar($_id: String!, $name: String, $color: String, $show: Boolean) {
        editAccountCalendar(_id: $_id, name: $name, color: $color, show: $show)
      }
    `;

    const editCalendarSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'editCalendar'
    );

    editCalendarSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'editCalendar',
      { _id: 'eventId', color: '#fff' },
      {
        dataSources
      }
    );
    editCalendarSpy.mockRestore();
  });

  const pageParamsDef = `
    $accountId: String!,
    $appearance: ScheduleAppearance,
    $calendarIds: [String],
    $booking: ScheduleBooking
    $event: ScheduleEvent!,
    $timezone: String!,
    $name: String!,
    $slug: String!
  `;

  const pageParams = `
    accountId: $accountId,
    appearance: $appearance,
    calendarIds: $calendarIds,
    booking: $booking,
    event: $event,
    timezone: $timezone,
    name: $name,
    slug: $slug,
  `;

  const pageDoc = {
    name: 'New schedule page',
    slug: 'join-me',
    accountId: 'accountId',
    timezone: 'UlanBator',
    event: {
      title: 'Event title',
      location: 'Mongolia',
      duration: 30
    }
  };

  test('Create schedule page', async () => {
    const mutation = `
      mutation createSchedulePage(${pageParamsDef}) {
        createSchedulePage(${pageParams})
      }
    `;

    const createPageSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'createSchedulePage'
    );

    createPageSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(mutation, 'createSchedulePage', pageDoc, {
      dataSources
    });

    createPageSpy.mockRestore();
  });

  test('Update schedule page', async () => {
    const mutation = `
      mutation editSchedulePage($_id: String!, ${pageParamsDef}) {
        editSchedulePage(_id: $_id, ${pageParams})
      }
    `;

    const updatePageSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'editSchedulePage'
    );

    updatePageSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'editSchedulePage',
      { _id: 'pageId', ...pageDoc },
      {
        dataSources
      }
    );

    updatePageSpy.mockRestore();
  });

  test('Delete schedule page', async () => {
    const mutation = `
      mutation deleteSchedulePage($pageId: String!) {
        deleteSchedulePage(pageId: $pageId)
      }
    `;

    const deleteCalendarSpy = jest.spyOn(
      dataSources.IntegrationsAPI,
      'deleteSchedulePage'
    );

    deleteCalendarSpy.mockImplementation(() => Promise.resolve());

    await graphqlRequest(
      mutation,
      'deleteSchedulePage',
      { pageId: 'pageId' },
      {
        dataSources
      }
    );
    deleteCalendarSpy.mockRestore();
  });
});
