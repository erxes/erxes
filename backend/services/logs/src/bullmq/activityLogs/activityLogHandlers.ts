import { graphqlPubsub } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';

export const activityLogHandler = async (data: any) => {
  const { subdomain, reqContext, inputData } = data;
  const { userId } = reqContext;

  const activities = Array.isArray(inputData) ? inputData : [inputData];

  for (const {
    activityType,
    target,
    contextType,
    context,
    action,
    changes,
    metadata,
    pluginName,
    moduleName,
    collectionName,
  } of activities) {
    const targetId = target?._id;
    const targetType = `${pluginName}:${moduleName}.${collectionName}`;
    const models = await generateModels(subdomain);
    const user = await models.Users.findOne({ _id: userId });

    const activityLog = await models.ActivityLogs.create({
      activityType,
      targetType,
      target,
      contextType,
      context,
      action,
      changes,
      metadata,
      actorType: user?.role || 'user',
      actor: user,
    });

    // Publish subscription for activity log insertion
    if (targetId) {
      graphqlPubsub.publish(`activityLogInserted:${subdomain}:${targetId}`, {
        activityLogInserted: activityLog.toObject(),
      });
    }
  }
};
