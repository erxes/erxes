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
    const date = new Date(user.details[fieldName]);
    const userYear = date.getFullYear();

    feeds.push({
      title: 'Ceremony',
      contentType,
      recipientIds: [user._id],
      ceremonyData: {
        startedDate: user.details[fieldName],
        willDate: new Date(
          moment(user.details[fieldName])
            .add(year - userYear, 'years')
            .toISOString()
        ),
        howManyYear: year - userYear,
        year
      },
      createdAt: new Date(),
      createdBy: user._id
    });
  }

  return feeds;
};

export const createCeremonies = async models => {
  console.log('starting to create ceremonies');

  const now = new Date();
  const year = now.getFullYear();

  const usersHasBirthday = await models.Users.find({
    'details.birthDate': { $exists: true }
  });

  const usersHasWorkAnniversary = await models.Users.find({
    'details.workStartedDate': { $exists: true }
  });

  await models.ExmFeed.deleteMany({
    contentType: {
      $in: [FEED_CONTENT_TYPES.BIRTHDAY, FEED_CONTENT_TYPES.WORK_ANNIVARSARY]
    },
    'ceremonyData.year': year
  });

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
    await models.ExmFeed.insertMany(feeds);
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
    schedule: '00 13 * * *',
    handler: async ({ models }) => {
      await createCeremonies(models);
    }
  }
];
