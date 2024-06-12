import {
  ICollateralType,
  ICollateralTypeDocument,
  collateralTypeSchema
} from './definitions/collateralType';
import { FilterQuery } from 'mongoose';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface ICollateralTypeModel extends Model<ICollateralTypeDocument> {
  getCollateralType(
    selector: FilterQuery<ICollateralTypeDocument>
  ): Promise<ICollateralTypeDocument>;
  createCollateralType(doc: ICollateralType): Promise<ICollateralTypeDocument>;
  updateCollateralType(
    _id,
    doc: ICollateralType
  ): Promise<ICollateralTypeDocument>;
  removeCollateralType(collateralType: ICollateralTypeDocument);
}

export const loadCollateralTypeClass = (models: IModels) => {
  class CollateralType {
    /**
     *
     * Get CollateralType
     */

    public static async getCollateralType(
      selector: FilterQuery<ICollateralTypeDocument>
    ): Promise<ICollateralTypeDocument> {
      const collateralType = await models.CollateralTypes.findOne(selector);

      if (!collateralType) {
        throw new Error('CollateralType not found');
      }

      return collateralType;
    }

    public static async createCollateralType(
      doc: ICollateralType
    ): Promise<ICollateralTypeDocument> {
      const collateralType = await models.CollateralTypes.create(doc);

      return collateralType;
    }
    public static async updateCollateralType(
      _id,
      doc: ICollateralType
    ): Promise<ICollateralTypeDocument | null> {
      await models.CollateralTypes.updateOne({ _id }, { $set: doc });

      const collateralType = await models.CollateralTypes.findOne({ _id });

      return collateralType;
    }
    public static async removeCollateralType(
      collateralType: ICollateralTypeDocument
    ) {
      const registeredCollaterals = await models.Contracts.aggregate([
        { $unwind: '$collateralsData' },
        { $match: {collateralTypeId:collateralType._id} },
      ]);

      if(registeredCollaterals.length > 0)
        throw new Error('Can not delete used collateral type')

      return await models.CollateralTypes.deleteOne({
        _id: collateralType._id
      });
    }
  }
  collateralTypeSchema.loadClass(CollateralType);
  return collateralTypeSchema;
};
