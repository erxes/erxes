import { IUserDocument } from 'erxes-api-shared/core-types';
import { getStructureUserContext } from 'erxes-api-shared/core-modules';
import { FilterQuery } from 'mongoose';
import { IIntegrationDocument } from '@/inbox/@types/integrations';

export const visibleIntegrationsFilter = async (
  subdomain: string,
  user: Pick<IUserDocument, '_id' | 'isOwner'>,
): Promise<FilterQuery<IIntegrationDocument>> => {
  if (user.isOwner) {
    return {};
  }

  const { principalEntityIds } = await getStructureUserContext(
    subdomain,
    user._id,
  );

  return {
    $or: [
      { visibility: { $exists: false } },
      { visibility: 'public' },
      {
        visibility: 'private',
        $or: [
          { createdUserId: user._id },
          { sharedEntityIds: { $in: principalEntityIds } },
        ],
      },
    ],
  };
};
