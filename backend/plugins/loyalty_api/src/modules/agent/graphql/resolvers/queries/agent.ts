import { IAgentDocument, IAgentParams } from '@/agent/@types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: IAgentParams) => {
  const {
    number,
    status,
    hasReturn,
    customerIds = [],
    companyIds = [],
  } = params;

  const filter: FilterQuery<IAgentDocument> = {};

  if (number) {
    const escapedNumber = number.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.number = new RegExp(escapedNumber, 'gi');
  }

  if (status) {
    filter.status = status;
  }

  if (typeof hasReturn === 'boolean') {
    filter.hasReturn = hasReturn;
  }

  if (customerIds.length > 0) {
    filter.customerIds = { $in: customerIds };
  }

  if (companyIds.length > 0) {
    filter.companyIds = { $in: companyIds };
  }

  return filter;
};

export const agentQueries = {
  async agents(_root: undefined, params: IAgentParams, { models, checkPermission }: IContext) {
    await checkPermission('agentView');
    const filter: FilterQuery<IAgentDocument> = generateFilter(params);
    return await cursorPaginate({
      model: models.Agents,
      params,
      query: filter,
    });
  },

  async agentsMain(
    _root: undefined,
    params: IAgentParams & { page?: number; perPage?: number },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('agentView');
    const { page = 1, perPage = 20 } = params;
    const filter = generateFilter(params);

    const totalCount = await models.Agents.countDocuments(filter);
    const list = await models.Agents.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return { list, totalCount };
  },

  async agentDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('agentView');
    return models.Agents.getAgent(_id);
  },
};