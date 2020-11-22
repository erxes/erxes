import {
  calendarBoardFactory,
  calendarFactory,
  calendarGroupFactory,
  userFactory
} from '../db/factories';
import { CalendarBoards, CalendarGroups, Calendars, Users } from '../db/models';

import './setup.ts';

describe('Calendars db', () => {
  let _calendar;
  let _group;
  let _user;
  let _board;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _board = await calendarBoardFactory({});
    _group = await calendarGroupFactory({ boardId: _board._id });
    _calendar = await calendarFactory({ groupId: _group._id });
  });

  afterEach(async () => {
    // Clearing test data
    await Calendars.deleteMany({});
    await CalendarBoards.deleteMany({});
    await CalendarGroups.deleteMany({});
    await Users.deleteMany({});
  });

  test('Create calendar', async () => {
    const args: any = {
      name: _calendar.name,
      code: _calendar.code,
      groupId: _group._id
    };

    const calendarObj = await Calendars.createCalendar(args);

    expect(calendarObj).toBeDefined();
    expect(calendarObj.name).toEqual(_calendar.name);
    expect(calendarObj.color).toEqual(_calendar.color);

    const calendarCount = await Calendars.countDocuments({});
    expect(calendarCount).toBe(2);
  });

  test('Update calendar', async () => {
    const args: any = {
      name: `${_calendar.name}-updated`,
      userId: _user._id
    };

    const calendarObj = await Calendars.updateCalendar(_calendar._id, args);

    expect(calendarObj).toBeDefined();
    expect(calendarObj.name).toEqual(`${_calendar.name}-updated`);
    expect(calendarObj.name).not.toEqual(_calendar.name);
    expect(calendarObj.userId).toEqual(_user._id);

    const calendarCount = await Calendars.countDocuments({});
    expect(calendarCount).toBe(1);
  });

  test('Remove calendar', async () => {
    await Calendars.removeCalendar(_calendar._id);

    expect(await Calendars.countDocuments({})).toBe(0);
  });

  test('Create calendar group', async () => {
    const args: any = {
      name: _group.name
    };

    const groupObj = await CalendarGroups.createCalendarGroup(args);

    expect(groupObj).toBeDefined();
    expect(groupObj.name).toEqual(_group.name);
    expect(groupObj.isPrivate).toEqual(false);

    const groupCount = await CalendarGroups.countDocuments({});
    expect(groupCount).toBe(2);
  });

  test('Update calendar group', async () => {
    const args: any = {
      isPrivate: true
    };

    const groupObj = await CalendarGroups.updateCalendarGroup(_group._id, args);

    expect(groupObj).toBeDefined();
    expect(groupObj.isPrivate).not.toEqual(_calendar.isPrivate);
  });

  test('Remove calendar group', async () => {
    try {
      await CalendarGroups.removeCalendarGroup(_group._id);
    } catch (e) {
      expect(e.message).toBe("Can't remove a calendar group");
    }

    await Calendars.removeCalendar(_calendar._id);
    await CalendarGroups.removeCalendarGroup(_group._id);

    expect(await CalendarGroups.countDocuments({})).toBe(0);
  });

  test('Create calendar board', async () => {
    const args: { name: string } = {
      name: _board.name
    };

    const boardObj = await CalendarBoards.createCalendarBoard(args);

    expect(boardObj).toBeDefined();
    expect(boardObj.name).toEqual(_board.name);

    const boardCount = await CalendarBoards.countDocuments({});
    expect(boardCount).toBe(2);
  });

  test('Update calendar board', async () => {
    const args: { name: string } = {
      name: `${_board.name}-updated`
    };

    const boardObj = await CalendarBoards.updateCalendarBoard(_board._id, args);

    expect(boardObj).toBeDefined();
    expect(`${_board.name}-updated`).toEqual(boardObj.name);
  });

  test('Remove calendar board', async () => {
    try {
      await CalendarBoards.removeCalendarBoard(_board._id);
    } catch (e) {
      expect(e.message).toBe("Can't remove a calendar board");
    }

    await Calendars.removeCalendar(_calendar._id);
    await CalendarGroups.removeCalendarGroup(_group._id);
    await CalendarBoards.removeCalendarBoard(_board._id);

    expect(await CalendarBoards.countDocuments({})).toBe(0);
  });
});
