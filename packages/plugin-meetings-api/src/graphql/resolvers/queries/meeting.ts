import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../messageBroker';

const generateFilter = async (params, user) => {
  const {
    participantIds,
    dealIds,
    companyId,
    createdAtFrom,
    createdAtTo,
    userId,
    isPreviousSession,
    searchValue
  } = params;

  const selector: any = { participantIds: { $in: [user._id] } };

  if (
    participantIds &&
    participantIds.length > 0 &&
    !participantIds.includes('')
  ) {
    selector.participantIds = { $in: [user._id, ...participantIds] };
  }
  if (userId) {
    selector.createdBy = userId;
  }
  if (dealIds) {
    selector.dealIds = { $in: dealIds };
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

  if (searchValue) {
    selector.title = {
      $in: [new RegExp(`.*${searchValue}.*`, 'i')]
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
  },
  async meetingsTotalCount(_root, {}, { models, user }: IContext) {
    const filter = await generateFilter({ isPreviousSession: true }, user);

    return models.Meetings.find(filter).countDocuments();
  }
};

export default meetingQueries;
