import { Model } from 'mongoose';
import {
  xypDataSchema,
  IXypconfigDocument,
  IXypData,
} from './definitions/xypdata';

export interface IXypDataModel extends Model<IXypconfigDocument> {
  getXypData(doc: any): IXypconfigDocument;
  createXypData(doc: any, user?: any): IXypconfigDocument;
  updateXypData(_id: string, doc: any, user: any): IXypconfigDocument;
  removeXypData(_id: string): IXypconfigDocument;
  createOrUpdateXypData(doc: any): IXypconfigDocument;
}

export const loadxypConfigClass = (models) => {
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
        ...doc,
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
            ...doc,
          },
        },
      );
      return models.XypData.findOne({ _id });
    }
    /*
     * Update comment
     */
    public static async createOrUpdateXypData(doc: any, user: any) {
      const { contentType, contentTypeId, data } = doc;
      const xypdataObj = await models.XypData.findOne({
        contentType,
        contentTypeId,
      });
      if (xypdataObj) {
        const unique = xypdataObj?.data.filter(
          (d) => d.wsOperationName !== data.wsOperationName,
        );
        await models.XypData.updateOne(
          { _id: xypdataObj._id },
          {
            $set: {
              updatedAt: new Date(),
              data: [...unique, data],
            },
          },
        );
      } else {
        const ret = await models.XypData.create({
          // createdBy: user._id,
          createdAt: new Date(),
          contentType,
          contentTypeId,
          data: [data],
        });
      }
      const xypdata = await models.XypData.findOne({
        contentType,
        contentTypeId,
      });

      return xypdata;
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
