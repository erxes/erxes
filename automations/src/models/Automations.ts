import { Model, model } from 'mongoose';
import {
  automationSchema,
  IAutomation,
  IAutomationDocument,
  IShape,
  IShapeDocument,
  shapeSchema,
} from './definitions/Automations';
import { AUTOMATION_STATUS } from './definitions/constants';

export interface IAutomationModel extends Model<IAutomationDocument> {
  getAutomation(_id: string): Promise<IAutomationDocument>;
  createAutomation(doc: IAutomation): Promise<IAutomationDocument>;
  updateAutomation(_id: string, doc: IAutomation): Promise<IAutomationDocument>;
  removeAutomation(_id: string): void;
}

export interface IShapeModel extends Model<IShapeDocument> {
  getShape(_id: string): Promise<IShapeDocument>;
  createShape(doc: IShape): Promise<IShapeDocument>;
  updateShape(_id: string, doc: IShape): Promise<IShapeDocument>;
  removeShape(_id: string): void;
}

export const loadClass = () => {
  class Automation {
    /*
     * Get a automation
     */
    public static async getAutomation(_id: string) {
      const automation = await Automations.findOne({ _id });

      if (!automation) {
        throw new Error('Automation not found');
      }

      return automation;
    }

    /**
     * Create a automation
     */
    public static async createAutomation(doc: IAutomation) {
      const automation = await Automations.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
        status: AUTOMATION_STATUS.DRAFT,
      });
      return automation;
    }

    /**
     * Update a automation
     */
    public static async updateAutomation(_id: string, doc: IAutomation) {
      await Automations.updateOne(
        { _id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
          },
        },
      );

      return Automations.findOne({ _id });
    }

    /**
     * Remove a automation
     */
    public static async removeAutomation(_id: string) {
      return Automations.deleteOne({ _id });
    }
  }

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

    /**
     * Create a shape
     */
    public static async createShape(doc: IShape) {
      const shape = await Shapes.create(doc);
      return shape;
    }

    /**
     * Update a shape
     */
    public static async updateShape(_id: string, doc: IShape) {
      await Shapes.updateOne({ _id }, { $set: doc });

      return Shapes.findOne({ _id });
    }

    /**
     * Remove a shape
     */
    public static async removeShape(_id: string) {
      return Shapes.deleteOne({ _id });
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
