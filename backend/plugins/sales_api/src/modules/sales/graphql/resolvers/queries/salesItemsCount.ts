import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  CLOSE_DATE_TYPES,
  PRIORITIES,
  SALES_STATUSES,
} from '@/sales/db/definitions/constants';
import { getCloseDateByType } from '@/sales/utils';
import { IPipelineLabelDocument } from '@/sales/@types';
import { IStageDocument } from '@/sales/@types/stages';

/**
 * Get sales items count grouped by assigned user
 * This query aggregates deal counts by different grouping criteria (priority, label, dueDate, stage)
 * and organizes them by assigned users.
 * 
 * @param pipelineId - The pipeline ID to filter deals
 * @param stackBy - Grouping criteria: 'priority', 'label', 'dueDate', or 'stage' (default)
 * @returns Object containing usersWithInfo array and groups array
 */
export const salesItemsCountByAssignedUser = async (
  _root: undefined,
  { pipelineId, stackBy }: { pipelineId: string; stackBy: string },
  { models, subdomain }: IContext,
) => {
  const { Stages, PipelineLabels } = models;

  let groups: Array<{ _id?: string; name: string; color?: string; value?: string }>;
  let detailFilter: (item: any) => any;

  const stages = await Stages.find({ pipelineId });

  if (stages.length === 0) {
    return {};
  }

  const stageIds = stages.map((stage) => stage._id);

  const filter: any = {
    stageId: { $in: stageIds },
    status: SALES_STATUSES.ACTIVE,
  };

  switch (stackBy) {
    case 'priority': {
      groups = PRIORITIES.ALL;

      filter.priority = { $in: PRIORITIES.ALL.map((p) => p.name) };

      detailFilter = ({ name }: { name: string }) => ({
        priority: name,
        stageId: { $in: stageIds },
      });

      break;
    }

    case 'label': {
      const labels = await PipelineLabels.find({ pipelineId });
      groups = labels.map((label) => ({
        _id: label._id,
        name: label.name,
        color: label.colorCode,
      }));

      filter.labelIds = { $in: labels.map((g) => g._id) };

      detailFilter = (label: IPipelineLabelDocument) => ({
        labelIds: { $in: [label._id] },
        stageId: { $in: stageIds },
      });

      break;
    }

    case 'dueDate': {
      groups = CLOSE_DATE_TYPES.ALL;

      detailFilter = ({ value }: { value: string }) => ({
        closeDate: getCloseDateByType(value),
        stageId: { $in: stageIds },
      });

      break;
    }

    // when stage
    default: {
      groups = stages.map((stage) => ({
        _id: stage._id,
        name: stage.name,
      }));

      detailFilter = (stage: IStageDocument) => ({ stageId: stage._id });
    }
  }

  const assignedUserIds = await models.Deals.find(filter).distinct(
    'assignedUserIds',
  );

  if (assignedUserIds.length === 0) {
    return {};
  }

  const users = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'find',
    input: {
      query: {
        _id: { $in: assignedUserIds },
      },
    },
    defaultValue: [],
  });

  const usersWithInfo: Array<{ name: string; [key: string]: any }> = [];
  const countsByGroup: Record<string, any[]> = {};

  for (const groupItem of groups) {
    const countsByGroupItem = await models.Deals.find({
      'assignedUserIds.0': { $exists: true },
      status: SALES_STATUSES.ACTIVE,
      ...detailFilter(groupItem),
    });

    countsByGroup[groupItem.name || ''] = countsByGroupItem;
  }

  for (const user of users) {
    const groupWithCount: Record<string, number> = {};

    for (const groupItem of groups) {
      groupWithCount[groupItem.name || ''] = countsByGroup[
        groupItem.name || ''
      ].filter((item) =>
        (item.assignedUserIds || []).includes(user._id),
      ).length;
    }

    usersWithInfo.push({
      name: user.details
        ? user.details.fullName || user.email || 'No name'
        : 'No name',
      ...groupWithCount,
    });
  }

  return {
    usersWithInfo,
    groups,
  };
};

