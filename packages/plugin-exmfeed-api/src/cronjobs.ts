import { generateModels } from './connectionResolver';
import {
  sendCoreMessage,
  sendEXMFeedMessage,
  sendNotification
} from './messageBroker';
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

const generateSendData = async (
  userList: any,
  receivers: any,
  type: string,
  subdomain: string
) => {
  const date = new Date();

  const sendFunction = (user: any, title: string) => {
    sendNotification(subdomain, {
      createdUser: receivers[0],
      title: `${title} notification`,
      notifType: 'plugin',
      action: `${title} notification`,
      content: `${getUserInfo(user)}'s ${title}`,
      link: `/settings/team/details/${user._id}`,
      receivers
    });

    sendCoreMessage({
      subdomain,
      action: 'sendMobileNotification',
      data: {
        title: `${title} notification`,
        body: `${getUserInfo(user)}'s ${title}`,
        receivers
      }
    });
  };

  for (const user of userList) {
    if (
      type === 'birthday' &&
      moment(user.details.birthDate).format('MM-DD-YYYY') ===
        moment(date).format('MM-DD-YYYY')
    ) {
      sendFunction(user, 'birthday');
    }

    if (
      type === 'workAnniversary' &&
      moment(user.details.workStartedDate).format('MM-DD-YYYY') ===
        moment(date).format('MM-DD-YYYY')
    ) {
      sendFunction(user, 'Work Anniversary');
    }
  }
};

const generateSendEventData = async (exmList, type, subdomain) => {
  const date = new Date();

  const sendFunction = (exm: any, receivers: any) => {
    sendNotification(subdomain, {
      createdUser: receivers[0],
      title: 'Event notification',
      notifType: 'plugin',
      action: 'event notification',
      content: `${exm.title} is today`,
      link: `/erxes-plugin-exm-feed/list`,
      receivers
    });

    sendCoreMessage({
      subdomain,
      action: 'sendMobileNotification',
      data: {
        title: 'Event notification',
        body: `${exm.title} is today`,
        receivers
      }
    });
  };

  for (const exm of exmList) {
    if (
      type === 'event' &&
      moment(exm.eventData.startDate).format('MM-DD-YYYY') ===
        moment(date).format('MM-DD-YYYY')
    ) {
      const unit = await sendCoreMessage({
        subdomain,
        action: 'units.findOne',
        data: {
          _id: exm.unitId
        },
        isRPC: true,
        defaultValue: []
      });

      const receivers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {
          query: {
            $or: [
              {
                departmentIds: {
                  $in: exm?.departmentIds || []
                }
              },
              {
                branchIds: {
                  $in: exm?.branchIds || []
                }
              },
              { _id: { $in: unit?.userIds || [] } },
              { _id: { $in: exm?.recipientIds || [] } }
            ]
          }
        },
        isRPC: true,
        defaultValue: []
      });
      sendFunction(exm, receivers);
    }

    if (
      type === 'publicHoliday' &&
      moment(exm.createdAt).format('MM-DD-YYYY') ===
        moment(date).format('MM-DD-YYYY')
    ) {
      const receivers = await sendCoreMessage({
        subdomain,
        action: 'users.find',
        data: {},
        isRPC: true,
        defaultValue: []
      });

      sendFunction(exm, receivers);
    }
  }
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

  feeds = generateData(feeds, newUsers, FEED_CONTENT_TYPES.WELCOME);

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

export const sendCeremonyNotification = async (subdomain: string) => {
  console.log('starting to send notification');

  const models = await generateModels(subdomain);

  const allUsers = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {},
    isRPC: true,
    defaultValue: []
  });

  const receivers = allUsers.map(r => r._id);

  const usersHasBirthday = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        'details.birthDate': {
          $exists: true
        }
      }
    },
    isRPC: true,
    defaultValue: []
  });

  console.log('usersHasBirthday', usersHasBirthday.length);

  await generateSendData(usersHasBirthday, receivers, 'birthday', subdomain);

  const usersHasWorkAnniversary = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        'details.workStartedDate': {
          $exists: true
        }
      }
    },
    isRPC: true,
    defaultValue: []
  });

  await generateSendData(
    usersHasBirthday,
    receivers,
    'workAnniversary',
    subdomain
  );

  console.log('usersHasWorkAnniversary', usersHasWorkAnniversary.length);

  const eventData = await models.ExmFeed.find({
    contentType: 'event'
  });

  await generateSendEventData(eventData, 'event', subdomain);

  const holidayData = await models.ExmFeed.find({
    contentType: 'publicHoliday'
  });

  await generateSendEventData(holidayData, 'publicHoliday', subdomain);

  console.log('send notification done');
};

export default {
  handleDailyJob: async ({ subdomain }) => {
    await createCeremonies(subdomain);
    await sendCeremonyNotification(subdomain);
  }
};
