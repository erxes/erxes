import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendCardsMessage } from '../../../messageBroker';

const generateFilters = async (params: any) => {
  const filter: any = {};
  let createdAt = {};
  let closedAt = {};

  if (params.createdAtFrom) {
    createdAt = { ...createdAt, $gt: params.createdAtFrom };
    filter.createdAt = createdAt;
  }

  if (params.createdAtTo) {
    createdAt = { ...createdAt, $lt: params.createdAtTo };
    filter.createdAt = createdAt;
  }

  if (params.closedAtFrom) {
    closedAt = { ...closedAt, $gt: params.closedAtFrom };
    filter.closedAt = closedAt;
  }

  if (params.closedAtTo) {
    closedAt = { ...closedAt, $lt: params.closedAtTo };
    filter.closedAt = closedAt;
  }

  if (params.status) {
    filter.status = params.status;
  }

  return filter;
};

const RCFAQueries = {
  async rcfaList(_root, params: any, { models }: IContext) {
    const filter = await generateFilters(params);

    const list = paginate(
      models.RCFA.find(filter).sort({ createdAt: -1 }),
      params
    );

    const totalCount = models.RCFA.find(filter).countDocuments();

    return { list, totalCount };
  },

  async rcfaDetail(_root, args, { models }: IContext) {
    const rcfaItem = await models.RCFA.findOne(args);

    if (!rcfaItem) {
      throw new Error('Cannot find RCFA');
    }

    return rcfaItem;
  },

  async checkRCFA(
    _root,
    {
      rcfaId,
      stageIds = [],
      types = []
    }: { rcfaId: string; stageIds: string[]; types: string[] },
    { models, subdomain }: IContext
  ) {
    if (
      !types?.length ||
      !['action', 'task'].some(type => types.includes(type))
    ) {
      throw new Error('Invalid types');
    }

    const rcfa = await models.RCFA.findOne({ _id: rcfaId });

    if (!rcfa) {
      throw new Error('Cannot find RCFA');
    }

    const issues = await models.Issues.find({ rcfaId: rcfa._id });

    let cardIds: string[] = [];

    let totalCardCount = 0;

    for (const issue of issues) {
      for (const type of types) {
        const ids = issue[`${type}Ids`];
        cardIds = [...cardIds, ...ids];
        totalCardCount += ids.length;
      }
    }

    const cards = await sendCardsMessage({
      subdomain,
      action: 'tasks.find',
      data: {
        _id: { $in: cardIds },
        stageId: { $in: stageIds }
      },
      isRPC: true,
      defaultValue: []
    });

    return totalCardCount === cards.length;
  }
};

export default RCFAQueries;
