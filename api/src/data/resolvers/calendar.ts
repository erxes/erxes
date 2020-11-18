import { Calendars } from '../../db/models';
import { ICalendarGroupDocument } from '../../db/models/definitions/calendars';

export default {
  calendars(group: ICalendarGroupDocument) {
    return Calendars.find({ groupId: group._id });
  }
};
