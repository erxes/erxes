import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { layoutsSchema } from '@/layouts/db/definitions/layouts';
import { ILayouts, ILayoutsDocument } from '@/layouts/@types/layouts';

export interface ILayoutsModel extends Model<ILayoutsDocument> {
  getLayouts(_id: string): Promise<ILayoutsDocument>;
  getLayoutss(): Promise<ILayoutsDocument[]>;
  createLayouts(doc: ILayouts): Promise<ILayoutsDocument>;
  updateLayouts(_id: string, doc: ILayouts): Promise<ILayoutsDocument>;
  removeLayouts(layoutIds: string[]): Promise<{ ok?: number }>;
}

export const loadLayoutsClass = (models: IModels) => {
  class Layouts {
    public static async getLayouts(_id: string) {
      const layout = await models.Layouts.findOne({ _id }).lean();

      if (!layout) {
        throw new Error('Layout not found');
      }

      return layout;
    }

    public static async getLayoutss(): Promise<ILayoutsDocument[]> {
      return models.Layouts.find().sort({ createdAt: -1 }).lean();
    }

    public static async createLayouts(doc: ILayouts): Promise<ILayoutsDocument> {
      return models.Layouts.create(doc);
    }

    public static async updateLayouts(_id: string, doc: ILayouts) {
      return models.Layouts.findOneAndUpdate(
        { _id },
        { $set: { ...doc } },
        { new: true },
      );
    }

    public static async removeLayouts(layoutIds: string[]) {
      return models.Layouts.deleteMany({ _id: { $in: layoutIds } });
    }
  }

  layoutsSchema.loadClass(Layouts);

  return layoutsSchema;
};
