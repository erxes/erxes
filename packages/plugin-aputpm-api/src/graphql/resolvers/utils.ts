import { sendCardsMessage, sendCoreMessage } from '../../messageBroker';

const generateDateFilter = value => {
  let filter: any = {};
  if (value?.from) {
    filter = { $gte: new Date(value.from) };
  }
  if (value.to) {
    filter = { ...filter, lte: new Date(value.to) };
  }
  return filter;
};

const queryBuilderCards = async ({ subdomain, params }) => {
  let filter: any = { status: { $ne: 'archived' } };

  const {
    stageIds,
    stageCodes,
    branchIds,
    departmentIds,
    assignedUserIds,
    searchValue,
    labelIds,
    createdAt,
    startedAt,
    closedAt,
    pipelineIds,
    boardId
  } = params || {};

  if (boardId) {
    const pipelines = await sendCardsMessage({
      subdomain,
      action: 'pipelines.find',
      data: {
        boardId
      },
      isRPC: true,
      defaultValue: null
    });

    const stages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        pipelineId: { $in: pipelines.map(pipeline => pipeline._id) }
      },
      isRPC: true,
      defaultValue: null
    });

    filter.stageId = { $in: stages.map(stage => stage._id) };
  }

  if (!!pipelineIds?.length) {
    const stages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        pipelineId: { $in: pipelineIds }
      },
      isRPC: true,
      defaultValue: null
    });

    const stageIds = stages.map(stage => stage._id);
    filter.stageId = { $in: stageIds };
  }

  if (!!stageIds?.length) {
    filter.stageId = { $in: stageIds };
  }

  if (!!stageCodes?.length) {
    const stages = await sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        code: { $in: stageCodes }
      },
      isRPC: true,
      defaultValue: []
    });

    filter.stageId = { $in: stages.map(stage => stage._id) };
  }

  if (!!branchIds?.length) {
    filter.branchIds = { $in: branchIds };
  }

  if (!!departmentIds?.length) {
    filter.departmentIds = { $in: departmentIds };
  }

  if (!!assignedUserIds?.length) {
    filter.assignedUserIds = { $in: assignedUserIds };
  }

  if (searchValue) {
    filter.name = { $regex: new RegExp(`^${searchValue}$`, 'i') };
  }

  if (!!labelIds?.length) {
    filter.labelIds = { $in: labelIds };
  }

  if (createdAt) {
    filter.createdAt = generateDateFilter(createdAt);
  }

  if (startedAt) {
    filter.startedAt = generateDateFilter(startedAt);
  }
  if (closedAt) {
    filter.closedAt = generateDateFilter(closedAt);
  }
  return filter;
};

const queryBuilderUsers = params => {
  let filter: any = { isActive: true };

  const { branchIds, departmentIds } = params || {};

  if (!!branchIds?.length) {
    filter.branchIds = { $in: branchIds };
  }

  if (!!departmentIds?.length) {
    filter.departmentIds = { $in: departmentIds };
  }
  return filter;
};

const getCardsTypeMBAction = cardType => {
  let action = `tickets.find`;

  if (cardType === 'tickets') return action;

  if (cardType === 'tasks') {
    action = 'tasks.find';
  }

  if (cardType === 'deals') {
    action = 'deals.find';
  }
  return action;
};

export const generateCreatedUsersCards = async ({ subdomain, params }) => {
  const query = await queryBuilderCards({ subdomain, params: params });

  const cards = await sendCardsMessage({
    subdomain,
    action: getCardsTypeMBAction(params.cardType),
    data: query,
    isRPC: true,
    defaultValue: []
  });

  const createdUserIds = cards
    .map(card => card.userId)
    .filter(cardId => cardId);

  const users = await sendCoreMessage({
    subdomain,
    action: 'users.find',
    data: {
      query: {
        ...queryBuilderUsers(params),
        _id: { $in: [...new Set(createdUserIds)] }
      }
    },
    isRPC: true,
    defaultValue: []
  });
  return users;
};
