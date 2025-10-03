import {
  defaultPaginate,
  regexSearchText,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';

import { IContext } from '~/connectionResolvers';
import { SALES_STATUSES } from '~/modules/sales/constants';
import { moduleRequireLogin } from 'erxes-api-shared/core-modules';

export const stageQueries = {
  /**
   *  Stages list
   */
  async salesStages(
    _root,
    {
      pipelineId,
      pipelineIds,
      isNotLost,
      isAll,
    }: {
      pipelineId: string;
      pipelineIds: string[];
      isNotLost: boolean;
      isAll: boolean;
    },
    { user, models }: IContext,
  ) {
    const filter: any = {};

    filter.pipelineId = pipelineId;

    if (pipelineIds) {
      filter.pipelineId = { $in: pipelineIds };
    }

    if (isNotLost) {
      filter.probability = { $ne: 'Lost' };
    }

    if (!isAll) {
      filter.status = { $ne: SALES_STATUSES.ARCHIVED };

      filter.$or = [
        { visibility: { $in: ['public', null] } },
        {
          $and: [{ visibility: 'private' }, { memberIds: { $in: [user._id] } }],
        },
      ];

      const userDetail = await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: {},
      });

      const departmentIds = userDetail?.departmentIds || [];
      if (departmentIds.length > 0) {
        filter.$or.push({
          $and: [
            { visibility: 'private' },
            { departmentIds: { $in: departmentIds } },
          ],
        });
      }
    }

    return models.Stages.find(filter).sort({ order: 1, createdAt: -1 }).lean();
  },

  /**
   *  Stage detail
   */
  async salesStageDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Stages.findOne({ _id }).lean();
  },

  /**
   *  Archived stages
   */

  async salesArchivedStages(
    _root,
    {
      pipelineId,
      search,
      ...listArgs
    }: { pipelineId: string; search?: string; page?: number; perPage?: number },
    { models }: IContext,
  ) {
    const filter: any = { pipelineId, status: SALES_STATUSES.ARCHIVED };

    if (search) {
      Object.assign(filter, regexSearchText(search, 'name'));
    }

    return defaultPaginate(
      models.Stages.find(filter).sort({ createdAt: -1 }),
      listArgs,
    );
  },

  async salesArchivedStagesCount(
    _root,
    { pipelineId, search }: { pipelineId: string; search?: string },
    { models }: IContext,
  ) {
    const filter: any = { pipelineId, status: SALES_STATUSES.ARCHIVED };

    if (search) {
      Object.assign(filter, regexSearchText(search, 'name'));
    }

    return models.Stages.countDocuments(filter);
  },
};

// moduleRequireLogin(stageQueries);
