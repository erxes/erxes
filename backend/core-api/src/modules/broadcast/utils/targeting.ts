import { FilterQuery } from 'mongoose';
import { ICustomer } from 'erxes-api-shared/core-types';

export const customerTargetFilter = (
  targetType: string,
  targetIds: string[],
): FilterQuery<ICustomer> => {
  if (!targetIds?.length) {
    return { _id: { $in: [] } };
  }

  if (targetType === 'tag') {
    return { tagIds: { $in: targetIds } };
  }

  if (targetType === 'segment') {
    return { segmentIds: { $in: targetIds } };
  }

  if (targetType === 'customer') {
    return { _id: { $in: targetIds } };
  }

  return { _id: { $in: [] } };
};
