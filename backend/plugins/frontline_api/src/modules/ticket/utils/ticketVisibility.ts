import { ITicketDocument } from '@/ticket/@types/ticket';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { getStructureUserContext } from 'erxes-api-shared/core-modules';
import { FilterQuery } from 'mongoose';

export interface IVisibilityPipeline {
  isCheckUser?: boolean;
  isCheckEntity?: boolean;
  isCheckDate?: boolean;
  excludeCheckUserIds?: string[];
}

type TVisibilityUser = Pick<IUserDocument, '_id' | 'role' | 'isOwner'>;

const startOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
};

export const canSeeAllPipelineTickets = (
  pipeline: IVisibilityPipeline,
  user: TVisibilityUser,
): boolean =>
  user.role === 'system' ||
  !!user.isOwner ||
  (pipeline.excludeCheckUserIds || []).includes(user._id);

export const isPipelineRestricted = (pipeline: IVisibilityPipeline): boolean =>
  !!(pipeline.isCheckUser || pipeline.isCheckEntity);

export const buildVisibilityCondition = (
  pipeline: IVisibilityPipeline,
  user: TVisibilityUser | undefined,
  visibleEntityIds: string[] = [],
): FilterQuery<ITicketDocument> | null => {
  const userId = user?._id;

  if (!user || !userId) {
    return null;
  }

  const conditions: FilterQuery<ITicketDocument>[] = [];

  if (
    isPipelineRestricted(pipeline) &&
    !canSeeAllPipelineTickets(pipeline, user)
  ) {
    const orClauses: FilterQuery<ITicketDocument>[] = [
      { createdBy: userId },
      { assigneeId: userId },
    ];

    if (pipeline.isCheckUser) {
      orClauses.push(
        { subscribedUserIds: userId },
        {
          assigneeId: { $in: [null, ''] },
          'subscribedUserIds.0': { $exists: false },
        },
      );
    }

    if (pipeline.isCheckEntity && visibleEntityIds.length) {
      orClauses.push({ entityIds: { $in: visibleEntityIds } });
    }

    conditions.push({ $or: orClauses });
  }

  if (pipeline.isCheckDate) {
    conditions.push({ createdAt: { $gte: startOfToday() } });
  }

  if (!conditions.length) {
    return null;
  }

  return conditions.length === 1 ? conditions[0] : { $and: conditions };
};

export const getVisibleEntityIds = async (
  subdomain: string,
  userId: string,
): Promise<string[]> => {
  const { entityIds, boundaryEntityIds } = await getStructureUserContext(
    subdomain,
    userId,
  );

  return [...new Set([...entityIds, ...boundaryEntityIds])];
};

export interface IPipelineAccess {
  visibility?: string;
  userId?: string;
  memberIds?: string[];
  sharedEntityIds?: string[];
}

export const getPrincipalEntityIds = async (
  subdomain: string | undefined,
  userId: string,
): Promise<string[]> =>
  subdomain
    ? (await getStructureUserContext(subdomain, userId)).principalEntityIds
    : [];

export const canUsePipeline = (
  pipeline: IPipelineAccess,
  userId: string | undefined,
  principalEntityIds: string[],
): boolean =>
  pipeline.visibility !== 'private' ||
  (!!userId &&
    (pipeline.userId === userId ||
      (pipeline.memberIds || []).includes(userId) ||
      (pipeline.sharedEntityIds || []).some((id) =>
        principalEntityIds.includes(id),
      )));

export const usablePipelinesFilter = (
  userId: string,
  principalEntityIds: string[],
) => ({
  $or: [
    { visibility: { $ne: 'private' } },
    { userId },
    { memberIds: userId },
    { sharedEntityIds: { $in: principalEntityIds } },
  ],
});

export const getCreatorEntityIds = async (
  subdomain: string,
  userId: string,
): Promise<string[]> => {
  const { primaryEntityId } = await getStructureUserContext(subdomain, userId);

  return primaryEntityId ? [primaryEntityId] : [];
};
