import { CalendarGroups, Calendars } from '../../db/models';
import {
  ICalendarBoardDocument,
  ICalendarGroupDocument
} from '../../db/models/definitions/calendars';
import { IContext } from '../types';

export const calendarGroup = {
  calendars(group: ICalendarGroupDocument) {
    return Calendars.find({ groupId: group._id });
  }
};

export const calendarBoard = {
  async groups(board: ICalendarBoardDocument, _args, { user }: IContext) {
    const userId = user._id;

    return CalendarGroups.find({
      boardId: board._id,
      $or: [{ isPrivate: false }, { userId }, { memberIds: userId }]
    });
  }
};
