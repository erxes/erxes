import { Model, model } from 'mongoose';
import { Integrations } from './';
import { flowSchema, IFlow, IFlowDocument } from './definitions/flows';
import { IIntegrationDocument } from './definitions/integrations';

export interface IFlowModel extends Model<IFlowDocument> {
  getFlow(_id: string): IFlowDocument;
  createFlow(doc: IFlow): IFlowDocument;
  updateFlow(_id: string, fields: IFlow): IFlowDocument;
  removeFlow(_id: string): IFlowDocument;

  manageIntegrations({ _id, integrationIds }: { _id: string; integrationIds: string[] }): IIntegrationDocument[];
}

export const loadClass = () => {
  class Flow {
    /*
     * Get a Flow
     */
    public static async getFlow(_id: string) {
      const flow = await Flows.findOne({ _id });

      if (!flow) {
        throw new Error('Flow not found');
      }

      return flow;
    }

    public static async createFlow(doc: IFlow) {
      // generate code automatically
      // if there is no flow code defined
      return Flows.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    public static async updateFlow(_id: string, fields: IFlow) {
      await Flows.updateOne({ _id }, { $set: { ...fields } });
      return Flows.findOne({ _id });
    }

    public static async removeFlow(_id) {
      const flowObj = await Flows.findOne({ _id });

      if (!flowObj) {
        throw new Error(`Flow not found with id ${_id}`);
      }

      return flowObj.remove();
    }

    public static async manageIntegrations({ _id, integrationIds }: { _id: string; integrationIds: string[] }) {
      await Integrations.updateMany({ _id: { $in: integrationIds } }, { $set: { flowId: _id } }, { multi: true });

      return Integrations.findIntegrations({ _id: { $in: integrationIds } });
    }
  }

  flowSchema.loadClass(Flow);
};

loadClass();

// tslint:disable-next-line
const Flows = model<IFlowDocument, IFlowModel>('flows', flowSchema);

export default Flows;
