import { CalendarBoards, CalendarGroups, Calendars } from '../../../db/models';
import {
  ICalendar,
  ICalendarBoard,
  ICalendarBoardDocument,
  ICalendarDocument,
  ICalendarGroup,
  ICalendarGroupDocument
} from '../../../db/models/definitions/calendars';
import { debugError } from '../../../debuggers';
import {
  checkPermission,
  moduleRequireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';

type Participant = {
  name?: string;
  email?: string;
  status?: string;
  comment?: string;
};

type Event = {
  _id?: string;
  title?: string;
  description?: string;
  start: string;
  end: string;
  accountId?: string;

  participants?: Participant[];
  rrule: string;
  timezone: string;
  location: string;
  busy: boolean;
};

const calendarMutations = {
  /**
   * Create a new schedule page
   */
  async createSchedulePage(_root, doc: object, { dataSources }: IContext) {
    return dataSources.IntegrationsAPI.createSchedulePage(doc);
  },

  /**
   * Edit a schedule page
   */
  async editSchedulePage(_root, doc: object, { dataSources }: IContext) {
    return dataSources.IntegrationsAPI.editSchedulePage(doc);
  },

  /**
   * Delete schedule page
   */
  async deleteSchedulePage(
    _root,
    doc: { pageId: string },
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.deleteSchedulePage(doc);
  },

  /**
   * Create a new calendar event
   */
  async createCalendarEvent(_root, doc: Event, { dataSources }: IContext) {
    return dataSources.IntegrationsAPI.createCalendarEvent(doc);
  },

  /**
   * Update a new calendar event
   */
  async editCalendarEvent(_root, doc: Event, { dataSources }: IContext) {
    return dataSources.IntegrationsAPI.editCalendarEvent(doc);
  },

  /**
   * Delete a new calendar event
   */
  async deleteCalendarEvent(
    _root,
    doc: { accountId: string; _id: string },
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.deleteCalendarEvent(doc);
  },

  /**
   * Update a account calendar
   */
  async editAccountCalendar(
    _root,
    doc: { _id: string; name?: string; show?: boolean; color?: string },
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.editCalendar(doc);
  },

  /**
   * Create a new calendar
   */
  async calendarsAdd(
    _root,
    { uid, ...doc }: { uid: string } & ICalendar,
    { user, dataSources }: IContext
  ) {
    const calendar = await Calendars.createCalendar({
      ...doc,
      userId: user._id
    });

    try {
      const {
        accountId,
        email
      } = await dataSources.IntegrationsAPI.connectCalendars({
        uid
      });

      await Calendars.updateOne(
        { _id: calendar._id },
        { $set: { accountId, name: email } }
      );
    } catch (e) {
      await Calendars.removeCalendar(calendar._id);

      debugError(e.message);

      throw new Error(e.message);
    }

    return calendar;
  },

  /**
   * Update a calendar
   */
  async calendarsEdit(_root, { _id, ...doc }: ICalendarDocument) {
    return Calendars.updateCalendar(_id, doc);
  },

  /**
   * Remove a calendar
   */
  async calendarsDelete(
    _root,
    doc: { _id: string; accountId: string },
    { dataSources }: IContext
  ) {
    const { accountId } = doc;
    const calendars = await Calendars.find({ accountId });

    if (calendars.length === 1) {
      try {
        await dataSources.IntegrationsAPI.deleteCalendars({ accountId });
      } catch (e) {
        debugError(e.message);

        throw new Error(e.message);
      }
    }

    return Calendars.removeCalendar(doc._id);
  },

  /**
   * Create a new calendar group
   */
  async calendarGroupsAdd(_root, doc: ICalendarGroup, { user }: IContext) {
    return CalendarGroups.createCalendarGroup({ ...doc, userId: user._id });
  },

  /**
   * Update a calendar group
   */
  async calendarGroupsEdit(_root, { _id, ...doc }: ICalendarGroupDocument) {
    return CalendarGroups.updateCalendarGroup(_id, doc);
  },

  /**
   * Remove a calendar group
   */
  async calendarGroupsDelete(_root, _id: string) {
    return CalendarGroups.removeCalendarGroup(_id);
  },

  /**
   * Create a new calendar board
   */
  async calendarBoardsAdd(_root, doc: ICalendarBoard, { user }: IContext) {
    return CalendarBoards.createCalendarBoard({ ...doc, userId: user._id });
  },

  /**
   * Update a calendar board
   */
  async calendarBoardsEdit(_root, { _id, ...doc }: ICalendarBoardDocument) {
    return CalendarBoards.updateCalendarBoard(_id, doc);
  },

  /**
   * Remove a calendar board
   */
  async calendarBoardsDelete(_root, _id: string) {
    return CalendarBoards.removeCalendarBoard(_id);
  }
};

moduleRequireLogin(calendarMutations);

checkPermission(calendarMutations, 'calendarsAdd', 'calendarsAdd');
checkPermission(calendarMutations, 'calendarsEdit', 'calendarsEdit');
checkPermission(calendarMutations, 'calendarsDelete', 'calendarsRemove');
checkPermission(calendarMutations, 'calendarGroupsAdd', 'calendarGroupsAdd');
checkPermission(calendarMutations, 'calendarGroupsEdit', 'calendarGroupsEdit');
checkPermission(
  calendarMutations,
  'calendarGroupsDelete',
  'calendarGroupsRemove'
);

export default calendarMutations;
