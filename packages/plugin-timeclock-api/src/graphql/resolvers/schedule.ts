import { IContext } from '../../connectionResolver';
import { IScheduleDocument } from '../../models/definitions/timeclock';

export default {
  shifts(schedule: IScheduleDocument, _args, { models }: IContext) {
    return models.Shifts.find({ scheduleId: schedule._id });
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
