import { CalendarGroups, Calendars } from '../../db/models';
import {
  ICalendarBoardDocument,
  ICalendarGroupDocument
} from '../../db/models/definitions/calendars';

export const calendarGroup = {
  calendars(group: ICalendarGroupDocument) {
    return Calendars.find({ groupId: group._id });
  }
};

export const calendarBoard = {
  groups(board: ICalendarBoardDocument) {
    return CalendarGroups.find({ boardId: board._id });
  }
};
