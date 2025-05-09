import { IContext } from "../../../connectionResolver";

interface IListParams {
  number?: string;
  status?: string;
  hasReturn?: boolean;
  customerIds?: string[];
  companyIds?: string[];
}

interface IDetailParam {
  _id: string
}

const agentQueries = {
  agents: async (_root, params: IListParams, { models }: IContext) => {
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

    return models.Agents.find(filter).lean();
  },
  agentDetail: async (_root, { _id }: IDetailParam, { models }: IContext) => {
    const agent = await models.Agents.getAgent(_id);

    return agent;
  },
  agentsMain: async (_root, params, { models }: IContext) => {
    
  }
};

export default agentQueries;
