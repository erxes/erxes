import { IContext } from '../../connectionResolver';
import { IScheduleDocument } from '../../models/definitions/timeclock';
import { fixDate } from '@erxes/api-utils/src';

export default {
  async shifts(
    schedule: IScheduleDocument,
    {},
    { models }: IContext,
    { variableValues }
  ) {
    const { startDate, endDate } = variableValues;

    const scheduleSelector = { scheduleId: schedule._id };
    let dateGiven: boolean = false;

    const timeFields = [
      {
        shiftStart:
          startDate && endDate
            ? {
                $gte: fixDate(startDate),
                $lte: fixDate(endDate)
              }
            : startDate
            ? {
                $gte: fixDate(startDate)
              }
            : { $lte: fixDate(endDate) },
        shiftEnd:
          startDate && endDate
            ? {
                $gte: fixDate(startDate),
                $lte: fixDate(endDate)
              }
            : startDate
            ? {
                $gte: fixDate(startDate)
              }
            : { $lte: fixDate(endDate) }
      }
    ];

    if (startDate || endDate) {
      dateGiven = true;
    }

    let returnModel: any = [];

    if (dateGiven) {
      returnModel.push(
        ...(await models.Shifts.find({
          $and: [...timeFields, scheduleSelector]
        }).sort({ shiftStart: -1 }))
      );
    }

    // if no date filter is given, return everything
    else {
      returnModel = models.Shifts.find(scheduleSelector).sort({
        shiftStart: -1
      });
    }

    return returnModel;
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
