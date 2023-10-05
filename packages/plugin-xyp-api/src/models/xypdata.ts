import { Model } from 'mongoose';
import {
  xypDataSchema,
  IXypconfigDocument,
  IXypData
} from './definitions/xypdata';

export interface IXypDataModel extends Model<IXypconfigDocument> {
  getXypData(doc: any): IXypconfigDocument;
  createXypData(doc: any, user?: any): IXypconfigDocument;
  updateXypData(_id: string, doc: any, user: any): IXypconfigDocument;
  removeXypData(_id: string): IXypconfigDocument;
}

export const loadxypConfigClass = models => {
  class XypData {
    /*
     * Create new comment
     */
    public static async getXypData(doc: any) {
      const xypdataObj = await models.XypData.findOne(doc);
      if (!xypdataObj) {
        throw new Error('XypData not found');
      }
      return xypdataObj;
    }
    /*
     * Create new comment
     */
    public static async createXypData(doc: any, user: any) {
      const config = await models.XypData.create({
        // createdBy: user._id,
        createdAt: new Date(),
        ...doc
      });
      return config;
    }
    /*
     * Update comment
     */
    public static async updateXypData(_id: string, doc: any, user: any) {
      const ret = await models.XypData.updateOne(
        { _id },
        {
          $set: {
            updatedBy: user._id,
            updatedAt: new Date(),
            ...doc
          }
        }
      );
      return models.XypData.findOne({ _id });
    }
    /*
     * Remove comment
     */
    public static async removeXypData(_id: string) {
      return models.XypData.deleteOne({ _id });
    }
  }
  xypDataSchema.loadClass(XypData);
  return xypDataSchema;
};
