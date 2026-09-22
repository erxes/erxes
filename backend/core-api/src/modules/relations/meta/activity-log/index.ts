import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { getPlugin, sendTRPCMessage } from 'erxes-api-shared/utils';
import { buildRelationActivity } from './builders';

export type RelationEntity = {
  contentType: string;
  contentId: string;
};

export type RelationEntityPair = [RelationEntity, RelationEntity];

type GenerateRelationActivityLogsParams = {
  subdomain: string;
  userId?: string;
  createActivityLog: EventDispatcherReturn['createActivityLog'];
  added: RelationEntityPair[];
  removed: RelationEntityPair[];
};

// Builds the activity for one pair on both entities' timelines
const buildPairActivities = (
  subdomain: string,
  action: 'added' | 'removed',
  [entity, relatedEntity]: RelationEntityPair,
) =>
  Promise.all([
    buildRelationActivity({
      subdomain,
      action,
      contentType: entity.contentType,
      contentId: entity.contentId,
      relatedContentType: relatedEntity.contentType,
      relatedContentId: relatedEntity.contentId,
    }),
    buildRelationActivity({
      subdomain,
      action,
      contentType: relatedEntity.contentType,
      contentId: relatedEntity.contentId,
      relatedContentType: entity.contentType,
      relatedContentId: entity.contentId,
    }),
  ]);

const notifyOwner = async ({
  subdomain,
  userId,
  ownEntity,
  otherEntity,
}: {
  subdomain: string;
  userId?: string;
  ownEntity: RelationEntity;
  otherEntity: RelationEntity;
}) => {
  const [pluginName] = ownEntity.contentType.split(':');

  if (!pluginName || pluginName === 'core') {
    return;
  }

  const plugin = await getPlugin(pluginName);
  const subscribedTypes: string[] =
    plugin?.config?.meta?.relations?.subscribedTypes || [];

  if (!subscribedTypes.includes(ownEntity.contentType)) {
    return;
  }

  await sendTRPCMessage({
    subdomain,
    pluginName,
    method: 'mutation',
    module: 'relation',
    action: 'onRelationAdded',
    input: { ownEntity, otherEntity, userId },
    defaultValue: null,
  });
};

// Fire-and-forget: relation creation must not fail or slow down because a
// subscribed plugin's handler is unavailable.
const notifyRelationOwners = (
  subdomain: string,
  userId: string | undefined,
  addedPairs: RelationEntityPair[],
) => {
  for (const [entity, relatedEntity] of addedPairs) {
    notifyOwner({
      subdomain,
      userId,
      ownEntity: entity,
      otherEntity: relatedEntity,
    }).catch((error) => {
      console.error(
        `[${subdomain}] notifyRelationOwners ${entity.contentType}:`,
        error,
      );
    });

    notifyOwner({
      subdomain,
      userId,
      ownEntity: relatedEntity,
      otherEntity: entity,
    }).catch((error) => {
      console.error(
        `[${subdomain}] notifyRelationOwners ${relatedEntity.contentType}:`,
        error,
      );
    });
  }
};

export const generateRelationActivityLogs = async ({
  subdomain,
  userId,
  createActivityLog,
  added,
  removed,
}: GenerateRelationActivityLogsParams) => {
  if (!added.length && !removed.length) {
    return;
  }

  const activities = (
    await Promise.all([
      ...added.map((pair) => buildPairActivities(subdomain, 'added', pair)),
      ...removed.map((pair) => buildPairActivities(subdomain, 'removed', pair)),
    ])
  ).flat();

  if (activities.length) {
    createActivityLog(activities);
  }

  notifyRelationOwners(subdomain, userId, added);
};
