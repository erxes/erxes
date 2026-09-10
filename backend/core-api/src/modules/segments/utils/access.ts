import { IUserDocument } from 'erxes-api-shared/core-types';
import { ISegmentDocument } from '../db/definitions/segments';

export const visibleTo = (user?: IUserDocument): Record<string, unknown> => {
  if (user?.isOwner) {
    return {};
  }

  return {
    $or: [
      { visibility: { $ne: 'private' } },
      ...(user?._id ? [{ ownerId: user._id }] : []),
    ],
  };
};

export const canEditSegment = (
  segment: Pick<ISegmentDocument, 'ownerId'>,
  user?: IUserDocument,
): boolean =>
  Boolean(user?.isOwner || (user?._id && segment.ownerId === user._id));

export const assertCanEditSegment = (
  segment: Pick<ISegmentDocument, 'ownerId' | 'name'>,
  user?: IUserDocument,
) => {
  if (!canEditSegment(segment, user)) {
    throw new Error(
      `"${segment.name}" belongs to someone else. Ask its owner to change it, or have it transferred to you.`,
    );
  }
};
