import {
  ActivityLogInput,
  resolveRecordReferenceValue,
} from 'erxes-api-shared/core-modules';

type BuildRelationActivityParams = {
  subdomain: string;
  action: 'added' | 'removed';
  contentType: string;
  contentId: string;
  relatedContentType: string;
  relatedContentId: string;
};

const resolveRelationDisplayName = async ({
  subdomain,
  contentType,
  contentId,
}: {
  subdomain: string;
  contentType: string;
  contentId: string;
}) => {
  const value = await resolveRecordReferenceValue({
    subdomain,
    type: contentType,
    targetId: contentId,
    path: 'displayName',
    defaultValue: contentId,
  });

  return String(value || contentId);
};

const getRelationActionDescription = ({
  action,
  relatedDisplayName,
}: {
  action: 'added' | 'removed';
  relatedDisplayName: string;
}) => {
  return action === 'added'
    ? `linked ${relatedDisplayName}`
    : `unlinked ${relatedDisplayName}`;
};

export const buildRelationActivity = async ({
  subdomain,
  action,
  contentType,
  contentId,
  relatedContentType,
  relatedContentId,
}: BuildRelationActivityParams): Promise<ActivityLogInput> => {
  const [targetDisplayName, relatedDisplayName] = await Promise.all([
    resolveRelationDisplayName({ subdomain, contentType, contentId }),
    resolveRelationDisplayName({
      subdomain,
      contentType: relatedContentType,
      contentId: relatedContentId,
    }),
  ]);

  return {
    activityType: `relation.${action}`,
    target: {
      _id: contentId,
      contentType,
      text: targetDisplayName,
    },
    context: {
      moduleName: 'core',
      collectionName: 'relations',
      text: relatedDisplayName,
      data: {
        contentType,
        contentId,
        targetDisplayName,
        relatedContentType,
        relatedContentId,
        relatedDisplayName,
      },
    },
    action: {
      type: `relation.${action}`,
      description: getRelationActionDescription({
        action,
        relatedDisplayName,
      }),
    },
    changes: {
      [action]: {
        contentType: relatedContentType,
        contentId: relatedContentId,
        text: relatedDisplayName,
      },
    },
    metadata: {
      contentType,
      relatedContentType,
    },
  };
};
