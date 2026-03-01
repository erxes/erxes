import { ITicketDocument } from '@/ticket/@types/ticket';
import { FilterQuery } from 'mongoose';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export const generateFilter = async (
  filter: any,
  user: IUserDocument,
  models: IModels,
) => {
  const filterQuery: FilterQuery<ITicketDocument> = {};

  if (filter.pipelineId) {
    const pipeline = await models.Pipeline.findOne({
      _id: filter.pipelineId,
    });

    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    // Check pipeline visibility
    if (pipeline.visibility === 'private') {
      const hasAccess = (pipeline.memberIds || []).includes(user._id);
      if (!hasAccess) {
        throw new Error(
          'Access denied: You do not have permission to view this pipeline',
        );
      }
    }
  }
  if (filter.name) {
    filterQuery.name = { $regex: filter.name, $options: 'i' };
  }

  if (filter.status) {
    filterQuery.status = filter.status;
  }

  if (filter.statusId) {
    filterQuery.statusId = filter.statusId;
  }
  if (filter.statusType) {
    filterQuery.statusType = filter.statusType;
  }

  if (filter.priority) {
    filterQuery.priority = filter.priority;
  }

  if (filter.startDate) {
    filterQuery.startDate = { $gte: filter.startDate };
  }

  if (filter.targetDate) {
    filterQuery.targetDate = { $gte: filter.targetDate };
  }

  if (filter.createdAt) {
    filterQuery.createdAt = { $gte: filter.createdAt };
  }

  if (filter.assigneeId) {
    filterQuery.assigneeId = filter.assigneeId;
  }

  if (filter.channelId) filterQuery.channelId = filter.channelId;
  if (filter.pipelineId) filterQuery.pipelineId = filter.pipelineId;
  if (filter.userId && !filter.channelId && !filter.assigneeId) {
    filterQuery.assigneeId = filter.userId;
  }

  switch (filter.state) {
    case 'active':
      filterQuery.$or = [{ state: 'active' }, { state: { $exists: false } }];
      break;
    case 'archived':
      filterQuery.state = 'archived';
      break;
    case 'deleted':
      filterQuery.state = 'deleted';
      break;
    default:
      filterQuery.$or = [{ state: 'active' }, { state: { $exists: false } }];
      break;
  }

  return filterQuery;
};
