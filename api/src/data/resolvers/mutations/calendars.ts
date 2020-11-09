import { CalendarGroups, Calendars } from '../../../db/models';
import {
  ICalendar,
  ICalendarDocument,
  ICalendarGroup,
  ICalendarGroupDocument
} from '../../../db/models/definitions/calendars';
import { debugExternalApi } from '../../../debuggers';
import {
  checkPermission,
  moduleRequireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';

interface IEvent {
  title?: string;
  description?: string;
  start: string;
  end: string;
}

const calendarMutations = {
  /**
   * Create a new calendar event
   */
  async createCalendarEvent(_root, doc: IEvent, { dataSources }: IContext) {
    return dataSources.IntegrationsAPI.createCalendarEvent(doc);
  },

  /**
   * Create a new calendar
   */
  async calendarsAdd(_root, doc: ICalendar, { user, dataSources }: IContext) {
    const calendar = await Calendars.createCalendar({
      ...doc,
      userId: user._id
    });

    try {
      await dataSources.IntegrationsAPI.connectCalendars({
        integrationId: doc.integrationId
      });
    } catch (e) {
      await Calendars.removeCalendar(calendar._id);
      debugExternalApi(e.message);

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
    doc: { _id: string; integrationId: string },
    { dataSources }: IContext
  ) {
    try {
      await dataSources.IntegrationsAPI.deleteCalendars(doc);
    } catch (e) {
      debugExternalApi(e.message);

      throw new Error(e.message);
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
  }
};

moduleRequireLogin(calendarMutations);

checkPermission(calendarMutations, 'calendarsAdd', 'calendarsAdd');
checkPermission(calendarMutations, 'calendarsEdit', 'calendarsEdit');
checkPermission(calendarMutations, 'calendarsDelete', 'calendarsRemove');

export default calendarMutations;
