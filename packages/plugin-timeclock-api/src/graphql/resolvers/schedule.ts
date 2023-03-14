import { IContext } from '../../connectionResolver';
import { IScheduleDocument } from '../../models/definitions/timeclock';
import { fixDate } from '@erxes/api-utils/src';
import { customFixDate } from '../../utils';

export default {
  async shifts(
    schedule: IScheduleDocument,
    {},
    { models }: IContext,
    { variableValues }
  ) {
    const { startDate, endDate } = variableValues;

    const scheduleSelector = { scheduleId: schedule._id };

    const timeFields = {
      shiftStart: {
        $gte: fixDate(startDate),
        $lte: customFixDate(endDate)
      },
      shiftEnd: {
        $gte: fixDate(startDate),
        $lte: customFixDate(endDate)
      }
    };

    const selector = { ...timeFields, ...scheduleSelector };

    return models.Shifts.find(selector).sort({ shiftStart: -1 });
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
