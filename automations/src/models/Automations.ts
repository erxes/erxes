import { Document, Model, model, Schema } from 'mongoose';

export interface IAction {
   id: string;
   type: string;
   data: any;
   prevActionId?: string;
   nextActionId?: string;
}
export interface ITrigger {
   id: string;
   type: string;
   data?: any;
}
export interface IAutomation {
  name: string;
  triggers: ITrigger[];
  actions: IAction[];
}

export interface IAutomationDocument extends IAutomation, Document {
  _id: string;
}

export const triggerSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  data: { type: Object },
}, { _id: false });

export const actionSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  data: { type: Object },
  prevActionId: { type: String },
  nextActionId: { type: String },
}, { _id: false });

export const automationSchema = new Schema({
  name: { type: String, required: true },
  triggers: { type: [triggerSchema] },
  actions: { type: [actionSchema] },
});

export interface IAutomationModel extends Model<IAutomationDocument> {
}

export const loadClass = () => {
  class Automation {
    public static async getAutomation(selector) {
      return Automations.findOne(selector);
    }
  }

  automationSchema.loadClass(Automation);

  return automationSchema;
};

loadClass();

// tslint:disable-next-line
const Automations = model<IAutomationDocument, IAutomationModel>('automations', automationSchema);

export default Automations;