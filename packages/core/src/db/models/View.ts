import { IUser } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../../connectionResolver';
import { IView, IViewDocument, viewSchema } from './definitions/views';

export interface IViewModel extends Model<IViewDocument> {
  getView(_id: string): Promise<IViewDocument>;
  createView(doc: IView, user: IUser): Promise<IViewDocument>;
  updateView(_id: string, doc: IView, user: IUser): Promise<IViewDocument>;
  removeView(_id: string): object;
}

export const loadViewClass = (models: IModels, subdomain: string) => {
  class View {
    public static async getView(_id: string) {
      const view = await models.Views.findOne({ _id });

      if (!view) {
        throw new Error('View not found');
      }

      return view;
    }

    // create
    public static async createView(doc, user) {
      const view = await models.Views.create({
        ...doc,
        createdAt: new Date(),
        createdBy: user._id,
      });

      return view;
    }
    // update
    public static async updateView(_id: string, doc, user: any) {
      const view = await models.Views.findByIdAndUpdate(
        { _id },
        {
          $set: {
            ...doc,
            updatedAt: new Date(),
            updatedBy: user._id,
          },
        },
      );

      return view;
    }
    // remove
    public static async removeView(_id: string) {
      return await models.Views.deleteOne({ _id });
    }
  }
  viewSchema.loadClass(View);

  return viewSchema;
};
