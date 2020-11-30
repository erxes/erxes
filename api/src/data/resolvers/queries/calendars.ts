import { CalendarBoards, CalendarGroups, Calendars } from '../../../db/models';
import {
  checkPermission,
  moduleRequireLogin
} from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

/**
 * Common helper for groups
 */
const generateFilterQuery = (userId: string) => {
  return { $or: [{ isPrivate: false }, { userId }, { memberIds: userId }] };
};

const calendarQueries = {
  /**
   *  CalendarGroups list
   */
  calendarGroups(_root, { boardId }, { user }: IContext) {
    return CalendarGroups.find({ boardId, ...generateFilterQuery(user._id) });
  },

  /**
   *  CalendarGroup detail
   */
  calendarGroupDetail(_root, { _id }: { _id: string }, { user }: IContext) {
    return CalendarGroups.findOne({ _id, ...generateFilterQuery(user._id) });
  },

  /**
   * Get last calendarGroups
   */
  calendarGroupGetLast(_root, {}, { user }: IContext) {
    return CalendarGroups.findOne(generateFilterQuery(user._id)).sort({
      createdAt: -1
    });
  },

  /**
   * Get all calendar group count. We will use it in pager
   */
  calendarGroupCounts(_root, {}, { user }: IContext) {
    return CalendarGroups.countDocuments(generateFilterQuery(user._id));
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
  },

  /**
   *  CalendarBoards list
   */
  calendarBoards(_root) {
    return CalendarBoards.find().sort({
      createdAt: -1
    });
  },

  /**
   *  CalendarBoard detail
   */
  calendarBoardDetail(_root, { _id }: { _id: string }) {
    return CalendarBoards.findOne({ _id });
  },

  /**
   * Get last calendarBoards
   */
  calendarBoardGetLast(_root) {
    return CalendarBoards.findOne().sort({
      createdAt: -1
    });
  },

  /**
   *  Full Calendar list
   */
  async calendarAccounts(
    _root,
    { groupId }: { groupId: string },
    { dataSources }: IContext
  ) {
    const accounts = await Calendars.find({ groupId });

    const result: any = [];

    for (const account of accounts) {
      const calendars = await dataSources.IntegrationsAPI.fetchApi(
        '/nylas/get-calendars',
        {
          accountId: account.accountId,
          show: true
        }
      );

      result.push({
        ...account.toJSON(),
        calendars
      });
    }

    return result;
  }
};

moduleRequireLogin(calendarQueries);

checkPermission(calendarQueries, 'calendars', 'showCalendars');
checkPermission(calendarQueries, 'calendarGroups', 'showCalendarGroups');

export default calendarQueries;
