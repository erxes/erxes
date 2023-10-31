import { Model, model } from 'mongoose';
import { ICover, ICoverDocument, coverSchema } from './definitions/covers';

export interface ICoverModel extends Model<ICoverDocument> {
  getCover(_id: string): Promise<ICoverDocument>;
  createCover(doc: ICover): Promise<ICoverDocument>;
  updateCover(_id: string, doc: ICover): Promise<ICoverDocument>;
  deleteCover(_id: string): Promise<any>;
}

export const loadCoverClass = models => {
  class Cover {
    public static async getCover(_id: string) {
      const cover = await models.Covers.findOne({ _id }).lean();

      if (!cover) {
        throw new Error(`Cover not found with id: ${_id}`);
      }

      return cover;
    }

    public static async updateCover(_id: string, doc: ICover) {
      await models.Covers.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return models.Covers.findOne({ _id }).lean();
    }

    public static async deleteCover(_id: string) {
      return models.Covers.deleteOne({ _id });
    }
  }

  coverSchema.loadClass(Cover);
  return coverSchema;
};
