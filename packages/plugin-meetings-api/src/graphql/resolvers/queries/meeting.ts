import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../messageBroker';

const generateFilter = async (params, user) => {
  const {
    participantIds,
    companyId,
    createdAtFrom,
    createdAtTo,
    userId,
    isPreviousSession
  } = params;

  const selector: any = { participantIds: { $in: [user._id] } };

  if (
    participantIds &&
    participantIds.length > 0 &&
    !participantIds.includes('')
  ) {
    selector.participantIds = { $in: participantIds };
  }
  if (userId) {
    selector.createdBy = userId;
  }

  if (companyId || companyId === null) {
    selector.companyId = companyId;
  }
  if (isPreviousSession) {
    selector.status = 'completed';
  }

  if (createdAtFrom) {
    selector.createdAt = { $gt: new Date(createdAtFrom) };
  }
  if (createdAtTo) {
    selector.createdAt = {
      ...selector.createdAt,
      $lt: new Date(createdAtTo)
    };
  }
  return selector;
};

const generateSort = (sortField, sortDirection) => {
  let sort: any = { createdAt: -1 };

  if (sortField && sortDirection) {
    sort = {};
    sort = { [sortField]: sortDirection };
  }
  return sort;
};

const meetingQueries = {
  async meetings(_root, args, { models, user }: IContext) {
    const { sortField, sortDirection } = args;
    const filter = await generateFilter(args, user);

    const sort = generateSort(sortField, sortDirection);

    return await paginate(models.Meetings.find(filter).sort(sort), args);
  },
  async meetingDetail(_root, { _id }, { models, user }: IContext) {
    if (!_id) {
      return [];
    }
    if (!user) {
      return [];
    }

    return await models.Meetings.meetingDetail(_id, user._id);
  }
};

export default meetingQueries;
