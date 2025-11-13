import { sendNotification } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { getAvailablePlugins } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const sendOnboardNotification = async (
  subdomain: string,
  models: IModels,
  user: IUserDocument,
) => {
  const { onboardedPlugins = [] } = user || {};

  const pluginNames = await getAvailablePlugins(subdomain);

  for (const pluginName of pluginNames) {
    if (onboardedPlugins.includes(pluginName)) {
      continue;
    }

    if (pluginName === 'core') {
      sendNotification(subdomain, {
        title: 'Welcome to erxes 🎉',
        message:
          'We’re excited to have you on board! Explore the features, connect with your team, and start growing your business with erxes.',
        type: 'info',
        userIds: [user._id],
        priority: 'low',
        kind: 'system',
        contentType: `${pluginName}:system.welcome`,
      });

      await models.Users.updateOne(
        { _id: user._id },
        { $addToSet: { onboardedPlugins: pluginName } },
      );

      continue;
    }

    sendNotification(subdomain, {
      title: `Get Started with ${pluginName}`,
      message: `Excited to introduce ${pluginName}! Dive in to explore its features and see how it can help your business thrive.`,
      type: 'info',
      userIds: [user._id],
      priority: 'low',
      kind: 'system',
      contentType: `${pluginName}:system.welcome`,
    });

    await models.Users.updateOne(
      { _id: user._id },
      { $addToSet: { onboardedPlugins: pluginName } },
    );
  }
};
