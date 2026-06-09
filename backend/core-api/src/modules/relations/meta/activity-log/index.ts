import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { buildRelationActivity } from './builders';

export const generateRelationActivityLogs = async ({
  subdomain,
  createActivityLog,
  contentType,
  contentId,
  relatedContentType,
  addedRelationIds,
  removedRelationIds,
}: {
  subdomain: string;
  createActivityLog: EventDispatcherReturn['createActivityLog'];
  contentType: string;
  contentId: string;
  relatedContentType: string;
  addedRelationIds: string[];
  removedRelationIds: string[];
}) => {
  if (!addedRelationIds.length && !removedRelationIds.length) {
    return;
  }

  const activities = await Promise.all([
    ...addedRelationIds.map((relatedContentId) =>
      buildRelationActivity({
        subdomain,
        action: 'added',
        contentType,
        contentId,
        relatedContentType,
        relatedContentId,
      }),
    ),
    ...removedRelationIds.map((relatedContentId) =>
      buildRelationActivity({
        subdomain,
        action: 'removed',
        contentType,
        contentId,
        relatedContentType,
        relatedContentId,
      }),
    ),
  ]);

  if (activities.length) {
    createActivityLog(activities);
  }
};
