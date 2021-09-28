import { FEED_CONTENT_TYPES } from './definitions';

const getUserInfo = (user: any) => {
  const details = user.details || {};

  if (details.firstName && details.lastName) {
    return `${details.firstName} ${details.firstName}`;
  }

  return details.firstName || user.email;
};

export const createCeremonies = async models => {
  console.log('starting to create ceremonies');

  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const usersHasBirthday = await models.Users.aggregate([
    {
      $project: {
        _id: 1,
        details: 1,
        birthMonth: { $month: '$details.birthDate' },
        birthDay: { $dayOfMonth: '$details.birthDate' }
      }
    },
    {
      $match: {
        birthMonth: { $gte: month },
        birthDay: { $gte: day }
      }
    }
  ]);

  const feeds = [];

  for (const user of usersHasBirthday) {
    feeds.push({
      updateOne: {
        filter: {
          recipientIds: { $in: [user._id] },
          'birthdayData.year': year
        },
        update: {
          title: 'Birthday',
          description: `Happy birthday to ${getUserInfo(user)}`,
          contentType: FEED_CONTENT_TYPES.BIRTHDAY,
          recipientIds: [user._id],
          birthdayData: {
            birthDate: user.details.birthDate,
            year
          }
        },
        upsert: true
      }
    });
  }

  const usersHasWorkAnniversary = await models.Users.aggregate([
    {
      $project: {
        _id: 1,
        details: 1,
        birthMonth: { $month: '$details.workStartedDate' },
        birthDay: { $dayOfMonth: '$details.workStartedDate' }
      }
    },
    {
      $match: {
        birthMonth: { $gte: month },
        birthDay: { $gte: day }
      }
    }
  ]);

  for (const user of usersHasWorkAnniversary) {
    feeds.push({
      updateOne: {
        filter: {
          recipientIds: { $in: [user._id] },
          'workAnniversaryData.year': year
        },
        update: {
          title: 'Work anniversary',
          description: `Work anniversary to ${getUserInfo(user)}`,
          contentType: FEED_CONTENT_TYPES.WORK_ANNIVARSARY,
          recipientIds: [user._id],
          workAnniversaryData: {
            birthDate: user.details.birthDate,
            year
          }
        },
        upsert: true
      }
    });
  }

  await models.ExmFeed.bulkWrite(feeds);

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
    schedule: '00 20 * * *',
    handler: async ({ models }) => {
      await createCeremonies(models);
    }
  }
];
