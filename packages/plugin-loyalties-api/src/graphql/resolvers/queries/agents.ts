import { moduleRequireLogin } from "@erxes/api-utils/src/permissions";
import { IContext } from "../../../connectionResolver";
import { paginate } from "@erxes/api-utils/src";

interface IPaginationParams {
  page?: number;
  perPage?: number;
}

interface IListParams extends IPaginationParams {
  number?: string;
  status?: string;
  hasReturn?: boolean;
  customerIds?: string[];
  companyIds?: string[];
}

interface IDetailParam {
  _id: string
}

const generateFilter = (params: IListParams) => {
  const { number, status, hasReturn, customerIds = [], companyIds = [] } = params;
  const filter: any = {};

  if (number) {
    filter.number = new RegExp(number, 'gi');
  }
  if (status) {
    filter.status = status;
  }
  if (typeof hasReturn === "boolean") {
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

const agentQueries = {
  agents: async (_root, params: IListParams, { models }: IContext) => {
    const filter = generateFilter(params);

    return models.Agents.find(filter).lean();
  },
  agentDetail: async (_root, { _id }: IDetailParam, { models }: IContext) => {
    const agent = await models.Agents.getAgent(_id);

    return agent;
  },
  agentsMain: async (_root, params: IListParams, { models }: IContext) => {
    const filter = generateFilter(params);
    const list = await paginate(models.Agents.find(filter), params);
    const totalCount = await models.Agents.countDocuments(filter);

    return { list, totalCount };
  }
};

moduleRequireLogin(agentQueries);

export default agentQueries;
