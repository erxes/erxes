import { Document, Model, model, Schema } from 'mongoose';

export type IActionsMap = { [key: string]: IAction };

export interface IAction {
  id: string;
  type: string;
  nextActionId?: string;
  config?: any;
  style?: any;
}

export interface ITrigger {
  id: string;
  type: string;
  actionId?: string;
  config?: any;
  style?: any;
}

export interface IAutomation {
  name: string;
  status: string;
  triggers: ITrigger[];
  actions: IAction[];
}

export interface IAutomationDocument extends IAutomation, Document {
  _id: string;
}

export const triggerSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  actionId: {type: String},
  config: { type: Object },
  style: { type: Object },
}, { _id: false });

export const actionSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  nextActionId: { type: String },
  config: { type: Object },
  style: { type: Object },
}, { _id: false });

export const automationSchema = new Schema({
  name: { type: String, required: true },
  status: { type: String, default: 'draft' },
  triggers: { type: [triggerSchema] },
  actions: { type: [actionSchema] },
});

export interface IAutomationModel extends Model<IAutomationDocument> {
  getAutomation(selector: any): IAutomationDocument
}

export const loadClass = () => {
  class Automation {
    public static async getAutomation(selector) {
      return Automations.findOne(selector).lean();
    }
  }

  automationSchema.loadClass(Automation);

  return automationSchema;
};

loadClass();

// tslint:disable-next-line
const Automations = model<IAutomationDocument, IAutomationModel>('automations', automationSchema);

export default Automations;