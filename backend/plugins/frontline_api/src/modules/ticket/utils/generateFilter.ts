import { ITicketDocument } from '@/ticket/@types/ticket';
import { FilterQuery } from 'mongoose';

export const generateFilter = (filter: any) => {
  const filterQuery: FilterQuery<ITicketDocument> = {};

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

  if (filterQuery.startDate) {
    filterQuery.startDate = { $gte: filter.startDate };
  }

  if (filterQuery.targetDate) {
    filterQuery.targetDate = { $gte: filter.targetDate };
  }

  if (filterQuery.createdAt) {
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
