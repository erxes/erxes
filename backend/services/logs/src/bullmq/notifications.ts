import { sendNotification } from 'erxes-api-shared/core-modules';
import { ILogDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export const handleNotifications = ({
  subdomain,
  models,
  logDoc,
}: {
  subdomain: string;
  models: IModels;
  logDoc: ILogDocument;
}) => {
  // sendWelcomeNotification({ subdomain, models, logDoc });
};

const sendWelcomeNotification = async ({
  subdomain,
  models,
  logDoc,
}: {
  subdomain: string;
  models: IModels;
  logDoc: ILogDocument;
}) => {
  const { userId, action, source } = logDoc || {};

  if (source === 'auth' && action === 'login' && userId) {
    const isFirstLogin =
      (await models.Logs.countDocuments({
        source: 'auth',
        status: 'success',
        action: 'login',
        userId,
      })) === 1;
    if (isFirstLogin) {
      sendNotification(subdomain, {
        title: 'Welcome to erxes 🎉',
        message:
          'We’re excited to have you on board! Explore the features, connect with your team, and start growing your business with erxes.',
        type: 'info',
        userIds: [userId],
        priority: 'low',
        kind: 'system',
        metadata: {
          template: 'welcomeMessage',
        },
      });
    }
  }
};
