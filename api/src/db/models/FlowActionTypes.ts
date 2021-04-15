import { Model, model } from 'mongoose';
import { flowActionTypeSchema, IFlowActionType, IFlowActionTypeDocument } from './definitions/flowActionTypes';

export interface IFlowActionTypeModel extends Model<IFlowActionTypeDocument> {
  getFlowActionType(_id: string): IFlowActionTypeDocument;
  createFlowActionType(doc: IFlowActionType): IFlowActionTypeDocument;
  updateFlowActionType(_id: string, fields: IFlowActionType): IFlowActionTypeDocument;
  removeFlowActionType(_id: string): IFlowActionTypeDocument;
}

export const loadClass = () => {
  class FlowActionType {
    /*
     * Get a FlowActionType
     */
    public static async getFlowActionType(_id: string) {
      const flowActionType = await FlowActionTypes.findOne({ _id });

      if (!flowActionType) {
        throw new Error('FlowActionType not found');
      }

      return flowActionType;
    }

    public static async createFlowActionType(doc: IFlowActionType) {
      // generate code automatically
      // if there is no flowActionType code defined
      return FlowActionTypes.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    public static async updateFlowActionType(_id: string, fields: IFlowActionType) {
      await FlowActionTypes.updateOne({ _id }, { $set: { ...fields } });
      return FlowActionTypes.findOne({ _id });
    }

    public static async removeFlowActionType(_id) {
      const flowActionTypeObj = await FlowActionTypes.findOne({ _id });

      if (!flowActionTypeObj) {
        throw new Error(`FlowActionType not found with id ${_id}`);
      }

      return flowActionTypeObj.remove();
    }
  }

  flowActionTypeSchema.loadClass(FlowActionType);
};

loadClass();

// tslint:disable-next-line
const FlowActionTypes = model<IFlowActionTypeDocument, IFlowActionTypeModel>('flow_action_types', flowActionTypeSchema);

export default FlowActionTypes;
