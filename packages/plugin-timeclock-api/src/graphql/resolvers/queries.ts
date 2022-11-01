import { IContext } from '../../connectionResolver';
import { fixDate } from '@erxes/api-utils/src/core';

const templateQueries = {
  absences(
    _root,
    {
      startDate,
      endDate,
      userId
    }: { startDate: Date; endDate: Date; userId: string },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };
    const timeFields = [
      {
        startTime: {
          $gte: fixDate(startDate),
          $lte: fixDate(endDate)
        }
      },
      {
        endTime: {
          $gte: fixDate(startDate),
          $lte: fixDate(endDate)
        }
      }
    ];

    if (startDate && endDate) {
      selector.$or = timeFields;
    }
    if (userId) {
      selector.userId = userId;
    }

    return models.Absences.find(selector);
  },

  timeclocks(
    _root,
    {
      startDate,
      endDate,
      userId
    }: { startDate: Date; endDate: Date; userId: string },
    { models, commonQuerySelector }: IContext
  ) {
    const selector: any = { ...commonQuerySelector };

    const timeFields = [
      {
        shiftStart: {
          $gte: fixDate(startDate),
          $lte: fixDate(endDate)
        }
      },
      {
        shiftEnd: {
          $gte: fixDate(startDate),
          $lte: fixDate(endDate)
        }
      }
    ];

    if (startDate && endDate) {
      selector.$or = timeFields;
    }
    if (userId) {
      selector.userId = userId;
    }

    return models.Templates.find(selector);
  },

  timeclockDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Templates.findOne({ _id });
  }
};

export default templateQueries;
