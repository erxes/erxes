import { IntegrationsAPI } from '../data/dataSources';
import { graphqlRequest } from '../db/connection';
import { calendarFactory, calnedarGroupFactory } from '../db/factories';
import { CalendarGroups, Calendars } from '../db/models';

import './setup.ts';

describe('Test calendars mutations', () => {
  let calendar;
  let group;
  let dataSources;

  beforeEach(async () => {
    // Creating test data
    dataSources = { IntegrationsAPI: new IntegrationsAPI() };

    group = await calnedarGroupFactory();
    calendar = await calendarFactory({
      groupId: group._id
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Calendars.deleteMany({});
    await CalendarGroups.deleteMany({});
  });

  const commonGroupParamDefs = `
    $name: String!,
    $isPrivate: Boolean,
    $assignedUserIds: [String]
  `;

  const commonGroupParams = `
    name: $name
    isPrivate: $isPrivate
    assignedUserIds: $assignedUserIds,
  `;

  const commonParamDefs = `
    $groupId: String!,
    $name: String!,
    $color: String
  `;

  const commonParams = `
    groupId: $groupId
    name: $name
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
  };

  test('Connect calendars', async () => {
    await removeCalendar();

    const args = {
      name: calendar.name,
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
      Promise.resolve({ accountId: 'integrationAccountId' })
    );

    const createdCalendar = await graphqlRequest(
      mutation,
      'calendarsAdd',
      args,
      { dataSources }
    );

    expect(createdCalendar.name).toEqual(args.name);
    expect(createdCalendar.color).toBeDefined();
  });

  test('Edit calendar', async () => {
    const args = {
      _id: calendar._id,
      name: `${calendar.name}-updated`,
      accountId: 'erxesApiId',
      groupId: group._id
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

    expect(updatedCalendar.name).toEqual(args.name);
    expect(updatedCalendar.color).toBeDefined();
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
      name: group.name
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
    await removeCalendar();

    const mutation = `
      mutation calendarGroupsDelete($_id: String!) {
        calendarGroupsDelete(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'calendarGroupsDelete', { _id: group._id });

    expect(await CalendarGroups.countDocuments({})).toBe(0);
  });

  const eventParamDefs = `
    $accountId: String!,
    $calendarId: String!,
    $title: String!,
    $description: String,
    $start: String,
    $end: String
  `;

  const eventParams = `
    accountId: $accountId,
    calendarId: $calendarId,
    title: $title,
    description: $description,
    start: $start,
    end: $end
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

    await graphqlRequest(mutation, 'createCalendarEvent', eventArgs, {
      dataSources
    });
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
  });
});
