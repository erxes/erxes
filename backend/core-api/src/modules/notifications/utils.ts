import { sendNotification } from 'erxes-api-shared/core-modules';
import { getAvailablePlugins } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const sendOnboardNotification = async (
  subdomain: string,
  models: IModels,
  userId: string,
) => {
  const user = await models.Users.findOne({ _id: userId }).lean();

  if (!user) return;

  const { onboardedPlugins = [] } = user;

  const pluginNames = await getAvailablePlugins(subdomain);

  const onboarded = new Set(onboardedPlugins);

  for (const pluginName of pluginNames || []) {
    if (onboarded.has(pluginName)) {
      continue;
    }

    if (pluginName === 'core') {
      await sendNotification(subdomain, {
        title: 'Welcome to erxes 🎉',
        message:
          'We’re excited to have you on board! Explore the features, connect with your team, and start growing your business with erxes.',
        type: 'info',
        userIds: [user._id],
        priority: 'low',
        kind: 'system',
        contentType: `${pluginName}:system.welcome`,
      });

      onboarded.add(pluginName);

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

    onboarded.add(pluginName);
  }

  await models.Users.updateOne(
    { _id: user._id },
    { $set: { onboardedPlugins: [...onboarded] } },
  );
};
