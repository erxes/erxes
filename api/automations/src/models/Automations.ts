import { Model, model } from 'mongoose';
import { automationSchema, IAutomationDocument, IShapeDocument, shapeSchema } from './definitions/Automations';

export interface IAutomationModel extends Model<IAutomationDocument> {}

export interface IShapeModel extends Model<IShapeDocument> {
  getShape(_id: string): Promise<IShapeDocument>;
}

export const loadClass = () => {
  class Automation {}

  automationSchema.loadClass(Automation);

  return automationSchema;
};

export const loadShapeClass = () => {
  // tslint:disable-next-line: max-classes-per-file
  class Shape {
    /*
     * Get a shape
     */
    public static async getShape(_id: string) {
      const shape = await Shapes.findOne({ _id });

      if (!shape) {
        throw new Error('Shape not found');
      }

      return shape;
    }
  }

  shapeSchema.loadClass(Shape);

  return shapeSchema;
};

loadClass();
loadShapeClass();

// tslint:disable-next-line
const Automations = model<IAutomationDocument, IAutomationModel>('automations', automationSchema);

// tslint:disable-next-line
const Shapes = model<IShapeDocument, IShapeModel>('shapes', shapeSchema);

export { Automations, Shapes };
