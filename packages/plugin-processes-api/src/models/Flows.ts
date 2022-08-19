import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { IFlow, IFlowDocument, flowSchema } from './definitions/flows';

export interface IFlowModel extends Model<IFlowDocument> {
  getFlow(_id: string): Promise<IFlowDocument>;
  createFlow(doc: IFlow): Promise<IFlowDocument>;
  updateFlow(_id: string, doc: IFlow): Promise<IFlowDocument>;
  removeFlow(_id: string): void;
  removeFlows(flowIds: string[]): void;
}

export const loadFlowClass = (models: IModels) => {
  class Flow {
    /*
     * Get a flow
     */
    public static async getFlow(_id: string) {
      const flow = await models.Flows.findOne({ _id });

      if (!flow) {
        throw new Error('Flow not found');
      }

      return flow;
    }

    /**
     * Create a flow
     */
    public static async createFlow(doc: IFlow) {
      const flow = await models.Flows.create({
        ...doc,
        createdAt: new Date()
      });

      return flow;
    }

    /**
     * Update Flow
     */
    public static async updateFlow(_id: string, doc: IFlow) {
      await models.Flows.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Flows.getFlow(_id);

      return updated;
    }

    /**
     * Remove Flow
     */
    public static async removeFlow(_id: string) {
      await models.Flows.getFlow(_id);
      return models.Flows.deleteOne({ _id });
    }

    /**
     * Remove Flows
     */
    public static async removeFlows(flowIds: string[]) {
      await models.Flows.deleteMany({ _id: { $in: flowIds } });

      return 'deleted';
    }
  }

  flowSchema.loadClass(Flow);

  return flowSchema;
};
