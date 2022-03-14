import { Model, model } from 'mongoose';
import { automationSchema, IAutomationDocument } from './definitions/automaions';

export interface IAutomationModel extends Model<IAutomationDocument> {
  getAutomation(_id: string): IAutomationDocument;
}

export const loadClass = () => {
  class Automation {
    public static async getAutomation(_id) {
      return Automations.findOne({ _id }).lean();
    }
  }

  automationSchema.loadClass(Automation);

  return automationSchema;
};

loadClass();

// tslint:disable-next-line
const Automations = model<IAutomationDocument, IAutomationModel>(
  'automations',
  automationSchema
);

export default Automations;
