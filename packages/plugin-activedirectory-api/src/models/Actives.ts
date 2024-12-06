import { activeSchema, IActiveDocument, IActive } from './definitions/active';

import { Model } from 'mongoose';

export interface IActiveModel extends Model<IActiveDocument> {
  createAD(doc: IActive, user: any): Promise<IActiveDocument>;
  updateAD(_id: string, doc: IActive): Promise<IActiveDocument>;
  removeADs(carIds: string[]): Promise<IActiveDocument>;
}

export const loadActiveDirectoryClass = (models) => {
  class ActiveDirectory {
    /**
     * Create a ad
     */
    public static async createAD(doc, user) {
      // Checking duplicated fields of ad

      const ad = await models.ActiveDirectory.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });

      return ad;
    }

    /**
     * Update ad
     */
    public static async updateAD(_id, doc) {
      await models.ActiveDirectory.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } }
      );

      return models.ActiveDirectory.findOne({ _id });
    }

    /**
     * Remove ad
     */
    public static async removeADs(carIds) {
      return models.ActiveDirectory.deleteMany({ _id: { $in: carIds } });
    }
  }

  activeSchema.loadClass(ActiveDirectory);

  return activeSchema;
};
