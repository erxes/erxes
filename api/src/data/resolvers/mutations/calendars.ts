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
  _id?: string;
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
   * Update a new calendar event
   */
  async editCalendarEvent(_root, doc: IEvent, { dataSources }: IContext) {
    return dataSources.IntegrationsAPI.editCalendarEvent(doc);
  },

  /**
   * Delete a new calendar event
   */
  async deleteCalendarEvent(
    _root,
    doc: { erxesApiId: string; _id: string },
    { dataSources }: IContext
  ) {
    return dataSources.IntegrationsAPI.deleteCalendarEvent(doc);
  },

  /**
   * Create a new calendar
   */
  async calendarsAdd(_root, doc: ICalendar, { user, dataSources }: IContext) {
    const calendar = await Calendars.createCalendar({
      ...doc,
      userId: user._id
    });

    const beforeConnected = await Calendars.findOne({
      integrationId: doc.integrationId
    });

    if (!beforeConnected) {
      try {
        await dataSources.IntegrationsAPI.connectCalendars({
          integrationId: doc.integrationId
        });
      } catch (e) {
        await Calendars.removeCalendar(calendar._id);
        debugExternalApi(e.message);

        throw new Error(e.message);
      }
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
    const calendars = await Calendars.find({
      integrationId: doc.integrationId
    });

    if (calendars.length === 1) {
      try {
        await dataSources.IntegrationsAPI.deleteCalendars({
          integrationId: doc.integrationId
        });
      } catch (e) {
        debugExternalApi(e.message);

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
  }
};

moduleRequireLogin(calendarMutations);

checkPermission(calendarMutations, 'calendarsAdd', 'calendarsAdd');
checkPermission(calendarMutations, 'calendarsEdit', 'calendarsEdit');
checkPermission(calendarMutations, 'calendarsDelete', 'calendarsRemove');

export default calendarMutations;
