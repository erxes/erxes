import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { agentSchema, IAgent, IAgentDocument } from "./definitions/agents";
import { AGENT_STATUSES } from './definitions/constants';

export interface IAgentModel extends Model<IAgentDocument> {
  getAgent(_id: string): Promise<IAgentDocument>;
  createAgent(doc: IAgent): Promise<IAgentDocument>;
  updateAgent(_id: string, doc: IAgent): Promise<IAgentDocument>;
  removeAgent(_id: string): Promise<{ n: number; ok: number }>;
};

// TODO: add more validations on other fields
const validateDoc = (doc: IAgent) => {
  const {
    number,
    status,
    hasReturn,
    returnAmount,
    returnPercent,
    prepaidPercent,
    discountPercent,
    customerIds = [],
    companyIds = []
  } = doc;

  if (!number) {
    throw new Error('Agent number is missing');
  }

  if (!AGENT_STATUSES.ALL.includes(status)) {
    throw new Error('Invalid status value');
  }

  if (hasReturn && !(returnAmount || returnPercent)) {
    throw new Error('Either return amount or percent must be > 0');
  }

  if (!hasReturn && !(prepaidPercent || discountPercent)) {
    throw new Error('Either prepaid or discount percent must be > 0')
  }

  if (customerIds.length > 0 && companyIds.length > 0) {
    throw new Error('Choose only customers or companies at once, not both at the same time');
  }
}

export const loadAgentClass = (models: IModels, _subdomain: string) => {
  class Agent {
    public static async getAgent(_id: string) {
      const agent = await models.Agents.findOne({ _id });

      if (!agent) {
        throw new Error('Agent not found');
      }

      return agent;
    }

    public static async createAgent(doc: IAgent) {
      validateDoc(doc);

      return models.Agents.create(doc);
    }

    public static async updateAgent(_id: string, doc: IAgent) {
      const agent = await models.Agents.getAgent(_id);

      validateDoc(doc);

      await models.Agents.updateOne({ _id: agent._id }, { $set: doc }, { runValidators: true });

      return models.Agents.findOne({ _id });
    }

    // TODO: put relevant checks to remove it or not
    public static async removeAgent(_id: string) {
      const agent = await models.Agents.getAgent(_id);

      return models.Agents.deleteOne({ _id: agent._id });
    }
  }

  agentSchema.loadClass(Agent);

  return agentSchema;
};
