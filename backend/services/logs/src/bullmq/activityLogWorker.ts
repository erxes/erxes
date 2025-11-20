import { Job } from 'bullmq';
import {
  splitType,
  TActivityLogProducers,
} from 'erxes-api-shared/core-modules';
import {
  getPlugin,
  graphqlPubsub,
  sendCoreModuleProducer,
} from 'erxes-api-shared/utils';
import { TActivityGetterResponse } from 'erxes-api-shared/utils/logs/activityLogTypes';
import { generateModels, IModels } from '~/connectionResolvers';

interface ActivityLogConfig {
  activityType: string;
  updatedFields?: string[];
  removedFields?: string[];
}

type EntityFallback = {
  moduleName: string;
  collectionName: string;
  text: string;
  data?: any;
};

const getActivitiesFromPlugin = async (
  models: IModels,
  subdomain: string,
  contentType: string,
  fullDocument: any,
  updateDescription: any,
): Promise<({ activityType: string } & TActivityGetterResponse)[]> => {
  const [pluginName, moduleName, collectionName] = splitType(contentType);
  const plugin = await getPlugin(pluginName);
  const { activityLog } = plugin?.config?.meta || {};

  const activityLogsConfig =
    activityLog?.rules || ([] as ActivityLogConfig[] | undefined);

  if (!activityLogsConfig.length) {
    return [];
  }

  const { updatedFields = {}, removedFields = [] } = updateDescription || {};
  const updatedFieldNames = Object.keys(updatedFields).filter(
    (field) =>
      ![
        'lastUpdatedUserId',
        'processId',
        'updatedAt',
        'createdAt',
        'modifiedAt',
      ].includes(field),
  );

  const matchedConfigs = activityLogsConfig.filter(
    ({
      updatedFields: updatedFieldsConfig = [],
      removedFields: removedFieldsConfig = [],
    }) => {
      const hasUpdatedField = updatedFieldsConfig.some((field) =>
        updatedFieldNames.includes(field),
      );
      const hasRemovedField = removedFieldsConfig.some((field) =>
        removedFields.includes(field),
      );

      return hasUpdatedField || hasRemovedField;
    },
  );

  if (!matchedConfigs.length) {
    return [];
  }

  const activities: ({ activityType: string } & TActivityGetterResponse)[] = [];

  for (const config of matchedConfigs) {
    const prevLog = await models.Logs.findOne({ docId: fullDocument._id })
      .sort({ createdAt: -1 })
      .lean();

    const producerResult = await sendCoreModuleProducer({
      subdomain,
      pluginName,
      moduleName: 'activityLog',
      producerName: TActivityLogProducers.ACTIVITY_GETTER,
      input: {
        pluginName,
        moduleName,
        collectionName,
        fullDocument,
        prevDocument: prevLog?.payload?.fullDocument,
        updateDescription,
        activityType: config.activityType,
      },
      defaultValue: [],
    }).catch((err) => {
      console.error(err);
    });
    console.log({ producerResult });
    if (Array.isArray(producerResult)) {
      activities.push(
        ...producerResult.map((result) => ({
          ...result,
          activityType: config.activityType,
        })),
      );
    } else if (producerResult) {
      activities.push({ ...producerResult, activityType: config.activityType });
    }
  }

  return activities;
};

export const activityLogWorker = async (job: Job<any>) => {
  const { subdomain, contentType, payload, userId } = job.data;
  const models = await generateModels(subdomain);
  const { fullDocument, ns, updateDescription } = payload || {};
  const lastUpdatedUserId = fullDocument?.lastUpdatedUserId || userId;
  const processId = fullDocument?.processId;

  const user = await models.Users.findOne(
    { _id: lastUpdatedUserId },
    {
      email: 1,
      username: 1,
      detail: 1,
      isOwner: 1,
      isActive: 1,
      role: 1,
      code: 1,
      branchIds: 1,
      departmentIds: 1,
      customFieldsData: 1,
    },
  );

  if (!user) {
    await models.Logs.create({
      source: 'activity',
      payload: {
        data: payload,
        error: `User not found id with: ${lastUpdatedUserId}`,
      },
      createdAt: new Date(),
      status: 'failed',
    });
    return;
  }

  if (!updateDescription) {
    return;
  }

  const activities = await getActivitiesFromPlugin(
    models,
    subdomain,
    contentType,
    fullDocument,
    updateDescription,
  );

  if (!activities.length) {
    return;
  }

  // const [, defaultModuleName, defaultCollectionName] = splitType(contentType);

  // const fallbackText =
  //   fullDocument?.name ||
  //   fullDocument?.title ||
  //   fullDocument?.subject ||
  //   fullDocument?._id?.toString() ||
  //   '';

  // const fallbackEntity: EntityFallback = {
  //   moduleName: defaultModuleName,
  //   collectionName: ns?.coll || defaultCollectionName,
  //   text: fallbackText,
  //   data: fullDocument,
  // };

  for (const {
    target,
    contextType,
    context,
    action,
    changes,
    metadata,
    activityType,
  } of activities) {
    try {
      const targetId = target?.data?._id || fullDocument?._id?.toString();

      const activityLog = await models.ActivityLogs.create({
        activityType: activityType,
        targetType: contentType,
        target: target,
        contextType: contextType || contentType,
        context: context,
        action: action,
        changes: changes || updateDescription,
        metadata: metadata,
        actorType: 'user',
        actor: user,
      });

      // Publish subscription for activity log insertion
      if (targetId && contentType) {
        graphqlPubsub.publish(
          `activityLogInserted:${subdomain}:${contentType}:${targetId}`,
          {
            activityLogInserted: activityLog.toObject(),
          },
        );
      }
    } catch (error) {
      console.error(error.message);
      await models.Logs.create({
        source: 'activity',
        payload: {
          data: payload,
          error: error.message,
        },
        createdAt: new Date(),
        userId: user._id,
        status: 'failed',
        processId,
      });
      continue;
    }
  }
};
