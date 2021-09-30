import { FEED_CONTENT_TYPES } from './definitions';
import * as moment from 'moment';

const generateData = (
  feeds,
  userList,
  contentType: string,
  fieldName: string,
  year: number
) => {
  for (const user of userList) {
    feeds.push({
      updateOne: {
        filter: {
          recipientIds: { $in: [user._id] },
          year,
          contentType
        },
        update: {
          title: 'Ceremony',
          contentType,
          recipientIds: [user._id],
          ceremonyData: {
            startedDate: user.details[fieldName],
            willDate: new Date(
              moment(user.details[fieldName])
                .add(year - user.year, 'years')
                .toISOString()
            ),
            howManyYear: year - user.year,
            year
          },
          createdAt: new Date(),
          createdBy: user._id
        },
        upsert: true
      }
    });
  }

  return feeds;
};

const getUsers = (
  models,
  fieldName: string,
  year: number,
  month: number,
  day: number
) => {
  return models.Users.aggregate([
    {
      $project: {
        _id: 1,
        details: 1,
        year: { $year: `$details.${fieldName}` },
        month: { $month: `$details.${fieldName}` },
        day: { $dayOfMonth: `$details.${fieldName}` }
      }
    },
    {
      $match: {
        year: { $lt: year },
        $or: [
          {
            month: { $gt: month }
          },
          {
            month: { $gte: month },
            day: { $gte: day }
          }
        ]
      }
    }
  ]);
};

export const createCeremonies = async models => {
  console.log('starting to create ceremonies');

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const usersHasBirthday = await getUsers(
    models,
    'birthDate',
    year,
    month,
    day
  );

  const usersHasWorkAnniversary = await getUsers(
    models,
    'workStartedDate',
    year,
    month,
    day
  );

  let feeds = generateData(
    [],
    usersHasBirthday,
    FEED_CONTENT_TYPES.BIRTHDAY,
    'birthDate',
    year
  );

  feeds = generateData(
    feeds,
    usersHasWorkAnniversary,
    FEED_CONTENT_TYPES.WORK_ANNIVARSARY,
    'workStartedDate',
    year
  );

  if (feeds.length > 0) {
    await models.ExmFeed.bulkWrite(feeds);
  }

  console.log('ending to create ceremonies');
};

/**
 * *    *    *    *    *    *
 * ┬    ┬    ┬    ┬    ┬    ┬
 * │    │    │    │    │    |
 * │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 * │    │    │    │    └───── month (1 - 12)
 * │    │    │    └────────── day of month (1 - 31)
 * │    │    └─────────────── hour (0 - 23)
 * │    └──────────────────── minute (0 - 59)
 * └───────────────────────── second (0 - 59, OPTIONAL)
 */

// 20:00
export default [
  {
    schedule: '*/10 * * * * *',
    handler: async ({ models }) => {
      await createCeremonies(models);
    }
  }
];
