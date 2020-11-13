import { graphqlRequest } from '../db/connection';
import {
  calendarFactory,
  calnedarGroupFactory,
  userFactory
} from '../db/factories';
import { CalendarGroups, Calendars, Users } from '../db/models';

import './setup.ts';

describe('calendarQueries', () => {
  let _calendar;
  let _group;
  let _user;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _group = await calnedarGroupFactory();
    _calendar = await calendarFactory({ groupId: _group._id });
  });

  afterEach(async () => {
    // Clearing test data
    await Calendars.deleteMany({});
    await CalendarGroups.deleteMany({});
    await Users.deleteMany({});
  });

  test('Calendar groups', async () => {
    await calnedarGroupFactory({ userId: _user._id, isPrivate: true });
    await calnedarGroupFactory({ userId: _user._id });

    const qry = `
      query calendarGroups {
        calendarGroups {
          _id
          name
        }
      }
    `;

    let response = await graphqlRequest(qry, 'calendarGroups');

    expect(response.length).toBe(2);

    response = await graphqlRequest(qry, 'calendarGroups', null, {
      user: _user
    });

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
    await calnedarGroupFactory();
    await calnedarGroupFactory();

    const qry = `
      query calendarGroupCounts {
        calendarGroupCounts
      }
    `;

    const totalCount = await graphqlRequest(qry, 'calendarGroupCounts');

    expect(totalCount).toBe(3);
  });

  test('Calendars', async () => {
    const secondGroup = await calnedarGroupFactory();
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
});
