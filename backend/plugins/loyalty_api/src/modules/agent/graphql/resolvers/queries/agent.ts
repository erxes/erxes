import { IAgentListParams } from '@/agent/@types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: IAgentListParams) => {
  const {
    number,
    status,
    hasReturn,
    customerIds = [],
    companyIds = [],
  } = params;
  const filter: any = {};

  if (number) {
    filter.number = new RegExp(number, 'gi');
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
  getAgent: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    const agent = await models.Agent.getAgent(_id);

    return agent;
  },
  getAgents: async (
    _root: undefined,
    params: IAgentListParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return await cursorPaginate({
      model: models.Agent,
      params,
      query: filter,
    });
  },
};
