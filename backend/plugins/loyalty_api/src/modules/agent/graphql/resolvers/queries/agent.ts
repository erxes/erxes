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
  async agents(_root: undefined, params: IAgentParams, { models }: IContext) {
    const filter: FilterQuery<IAgentDocument> = generateFilter(params);

    return await cursorPaginate({
      model: models.Agents,
      params,
      query: filter,
    });
  },

  async agentDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Agents.getAgent(_id);
  },
};
