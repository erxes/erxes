import { sendTRPCMessage } from 'erxes-api-shared/utils';
import type { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { IPipelineDocument } from '~/modules/sales/@types';
import { SALES_STATUSES } from '~/modules/sales/constants';

/**
 * The active pipelines a user may open: public ones, private ones they are a
 * member, creator or department of; every one for an owner.
 */
export const visiblePipelinesQuery = async (
  subdomain: string,
  user: IContext['user'],
): Promise<FilterQuery<IPipelineDocument>> => {
  const query: FilterQuery<IPipelineDocument> = user.isOwner
    ? {}
    : {
        $or: [
          { visibility: 'public' },
          {
            $and: [
              { visibility: 'private' },
              {
                $or: [{ memberIds: { $in: [user._id] } }, { userId: user._id }],
              },
            ],
          },
        ],
      };

  query.status = { $ne: SALES_STATUSES.ARCHIVED };

  if (user.isOwner) {
    return query;
  }

  const userDetail = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'findOne',
    input: { query: { _id: user._id } },
    defaultValue: {},
  });

  const departmentIds = userDetail?.departmentIds || [];

  if (departmentIds.length > 0) {
    query.$or?.push({
      $and: [
        { visibility: 'private' },
        { departmentIds: { $in: departmentIds } },
      ],
    });
  }

  return query;
};
