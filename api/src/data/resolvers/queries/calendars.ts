import { CalendarGroups, Calendars } from '../../../db/models';
import {
  moduleRequireLogin,
  checkPermission
} from '../../permissions/wrappers';
import { paginate } from '../../utils';

const calendarQueries = {
  /**
   *  CalendarGroups list
   */
  calendarGroups(_root) {
    return CalendarGroups.find({});
  },

  /**
   *  CalendarGroup detail
   */
  calendarGroupDetail(_root, { _id }: { _id: string }) {
    return CalendarGroups.findOne({ _id });
  },

  /**
   * Get last calendarGroups
   */
  calendarGroupGetLast(_root) {
    return CalendarGroups.findOne().sort({
      createdAt: -1
    });
  },

  /**
   *  Calendar list
   */
  calendars(
    _root,
    {
      groupId,
      ...queryParams
    }: { groupId: string; page: number; perPage: number }
  ) {
    const query: any = {};
    const { page, perPage } = queryParams;

    if (groupId) {
      query.groupId = groupId;
    }

    if (page && perPage) {
      return paginate(Calendars.find(query), queryParams);
    }

    return Calendars.find(query);
  },

  /**
   *  Calendar detail
   */
  calendarDetail(_root, { _id }: { _id: string }) {
    return Calendars.findOne({ _id });
  }
};

checkPermission(calendarQueries, 'calendars', 'showCalendars');

moduleRequireLogin(calendarQueries);

export default calendarQueries;
