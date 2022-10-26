import { IContext } from '../../connectionResolver';
import { fixDate } from '@erxes/api-utils/src/core';

// interface IDateFilter {
//   [key: string]: {
//     $gte: Date;
//     $lte: Date;
//   };
// }

// interface IOR {
//   $or: IDateFilter[];
// }

// const dateFilter = (startDate: string, endDate: string): IDateFilter[] => {
//   return [
//     {
//       shiftStart: {
//         $gte: fixDate(startDate),
//         $lte: fixDate(endDate)
//       }
//     },
//     {
//       shiftEnd: {
//         $gte: fixDate(startDate),
//         $lte: fixDate(endDate)
//       }
//     }
//   ];
// };

const templateQueries = {
  timeclocks(
    _root,
    {
      startDate,
      endDate,
      userId
    }: { startDate: string; endDate: string; userId: string },
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
    console.log('blabla', fixDate(startDate), endDate, userId);

    // return models.Templates.find({});
    return models.Templates.find(selector);
  }
};

export default templateQueries;
