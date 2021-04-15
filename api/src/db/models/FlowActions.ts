import { Model, model } from 'mongoose';
import { flowActionSchema, IFlowAction, IFlowActionDocument } from './definitions/flowActions';

export interface IFlowActionModel extends Model<IFlowActionDocument> {
  getFlowAction(_id: string): IFlowActionDocument;
  createFlowAction(doc: IFlowAction): IFlowActionDocument;
  updateFlowAction(_id: string, fields: IFlowAction): IFlowActionDocument;
  removeFlowAction(_id: string): IFlowActionDocument;
}

export const loadClass = () => {
  class FlowAction {
    /*
     * Get a FlowAction
     */
    public static async getFlowAction(_id: string) {
      const flowAction = await FlowActions.findOne({ _id });

      if (!flowAction) {
        throw new Error('FlowAction not found');
      }

      return flowAction;
    }

    public static async createFlowAction(doc: IFlowAction) {
      // generate code automatically
      // if there is no flowAction code defined
      return FlowActions.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    public static async updateFlowAction(_id: string, fields: IFlowAction) {
      await FlowActions.updateOne({ _id }, { $set: { ...fields } });
      return FlowActions.findOne({ _id });
    }

    public static async removeFlowAction(_id) {
      const flowActionObj = await FlowActions.findOne({ _id });

      if (!flowActionObj) {
        throw new Error(`FlowAction not found with id ${_id}`);
      }

      return flowActionObj.remove();
    }
  }

  flowActionSchema.loadClass(FlowAction);
};

loadClass();

// tslint:disable-next-line
const FlowActions = model<IFlowActionDocument, IFlowActionModel>('flow_actions', flowActionSchema);

export default FlowActions;
