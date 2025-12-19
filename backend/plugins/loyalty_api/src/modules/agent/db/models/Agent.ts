import { IAgent, IAgentDocument } from '@/agent/@types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { AGENT_STATUSES } from '../../constants';
import { agentSchema } from '../definitions/agent';

export interface IAgentModel extends Model<IAgentDocument> {
  getAgent(_id: string): Promise<IAgentDocument>;
  createAgent(doc: IAgent): Promise<IAgentDocument>;
  updateAgent(_id: string, doc: IAgent): Promise<IAgentDocument>;
  removeAgent(AgentId: string): Promise<{ ok: number }>;
}

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
    companyIds = [],
  } = doc;

  if (!number) {
    throw new Error('Agent number is missing');
  }

  if (!AGENT_STATUSES.ALL.includes(status)) {
    throw new Error('Invalid status value');
  }

  if (
    hasReturn &&
    !(
      (typeof returnAmount === 'number' && returnAmount > 0) ||
      (typeof returnPercent === 'number' && returnPercent > 0)
    )
  ) {
    throw new Error('Either return amount or percent must be > 0');
  }

  if (
    !hasReturn &&
    !(
      (typeof prepaidPercent === 'number' && prepaidPercent > 0) ||
      (typeof discountPercent === 'number' && discountPercent > 0)
    )
  ) {
    throw new Error('Either prepaid or discount percent must be > 0');
  }

  if (customerIds.length > 0 && companyIds.length > 0) {
    throw new Error(
      'Choose only customers or companies at once, not both at the same time',
    );
  }
};

export const loadAgentClass = (models: IModels) => {
  class Agent {
    public static async getAgent(_id: string) {
      const agent = await models.Agent.findOne({ _id });

      if (!agent) {
        throw new Error('Agent not found');
      }

      return agent;
    }

    public static async createAgent(doc: IAgent) {
      validateDoc(doc);

      return models.Agent.create(doc);
    }

    public static async updateAgent(_id: string, doc: IAgent) {
      const agent = await models.Agent.getAgent(_id);

      validateDoc(doc);

      await models.Agent.updateOne(
        { _id: agent._id },
        { $set: doc },
        { runValidators: true },
      );

      return models.Agent.findOne({ _id });
    }

    // TODO: put relevant checks to remove it or not
    public static async removeAgent(_id: string) {
      const agent = await models.Agent.getAgent(_id);

      return models.Agent.deleteOne({ _id: agent._id });
    }
  }

  agentSchema.loadClass(Agent);

  return agentSchema;
};
