import { generateModels } from './connectionResolver';
import { sendCoreMessage, sendEXMFeedMessage } from './messageBroker';
import { FEED_CONTENT_TYPES } from './models/definitions/exm';
import * as moment from 'moment';

const getUserInfo = user => {
  const details = user.details;

  if (!details) {
    return '';
  }

  return details.fullName || user.email || '';
};

const generateData = (
  feeds,
  userList,
  contentType: string,
  fieldName?: string,
  year?: number
) => {
  for (const user of userList) {
    let ceremonyData = {};
    let title = `Welcome to our company, ${getUserInfo(user)}`;

    if (fieldName && user && year) {
      title = 'Ceremony';

      const date = new Date(user.details[fieldName]);
      const userYear = date.getFullYear();

      ceremonyData = {
        startedDate: user.details[fieldName],
        willDate: new Date(
          moment(user.details[fieldName])
            .add(year - userYear, 'years')
            .toISOString()
        ),
        howManyYear: year - userYear,
        year
      };
    }

    feeds.push({
      title,
      contentType,
      recipientIds: [user._id],
      ceremonyData,
      createdAt: new Date(),
      createdBy: user._id
    });
  }

  return feeds;
};

export const createCeremonies = async (subdomain: string) => {
  console.log('starting to create ceremonies');

  const models = await generateModels(subdomain);

  const now = new Date();
  const year = now.getFullYear();

  const usersHasBirthday = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        'details.birthDate': { $exists: true }
      }
    },
    isRPC: true,
    defaultValue: []
  });

  console.log('usersHasBirthday', usersHasBirthday.length);

  const usersHasWorkAnniversary = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        'details.workStartedDate': { $exists: true }
      }
    },
    isRPC: true,
    defaultValue: []
  });

  console.log('usersHasWorkAnniversary', usersHasWorkAnniversary.length);

  const yesterday = moment()
    .add(-1, 'days')
    .format('YYYY-MM-DD');

  const newUsers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        createdAt: { $gte: new Date(yesterday) }
      }
    },
    isRPC: true,
    defaultValue: []
  });

  console.log('newUsers', newUsers.length);

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

  feeds = generateData(feeds, newUsers, FEED_CONTENT_TYPES.POST);

  if (feeds.length > 0) {
    await models.ExmFeed.insertMany(feeds);
  }

  console.log('ending to create ceremonies');

  const tomorrow = moment()
    .add(+1, 'days')
    .format('YYYY-MM-DD');

  const todayEvent = await sendEXMFeedMessage({
    subdomain,
    action: 'ExmFeed.find',
    data: {
      'eventData.startDate': {
        $lte: new Date(tomorrow),
        $gt: new Date(yesterday)
      }
    },
    isRPC: true,
    defaultValue: []
  });

  if (todayEvent?.length > 0) {
    const userWithDeviceTokens = await sendCoreMessage({
      subdomain,
      action: 'users.find',
      data: {
        query: {
          deviceTokens: { $exists: true }
        }
      },
      isRPC: true,
      defaultValue: []
    });
    const receivers = userWithDeviceTokens.map((user: any) => user._id);

    for (const event of todayEvent || []) {
      sendCoreMessage({
        subdomain: subdomain,
        action: 'sendMobileNotification',
        data: {
          title: `${event.title} is today.`,
          body: `Location is ${event?.eventDate?.where}.`,
          receivers
        }
      });
    }
  }
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await createCeremonies(subdomain);
  }
};
