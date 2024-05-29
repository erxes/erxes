import { IContext } from '../../connectionResolver';
import { IScheduleDocument } from '../../models/definitions/timeclock';

export default {
  shifts(schedule: IScheduleDocument, {}, { models }: IContext, {}) {
    return models.Shifts.find({
      _id: schedule.shiftIds,
      scheduleId: schedule._id
    }).sort({
      shiftStart: -1
    });
  },

  user(schedule: IScheduleDocument) {
    return (
      schedule.userId && {
        __typename: 'User',
        _id: schedule.userId
      }
    );
  }
};
