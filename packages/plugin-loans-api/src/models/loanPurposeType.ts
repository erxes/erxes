import {
  IPurposeTypeDocument,
  purposeTypeSchema
} from './definitions/loanPurposeType';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';

export interface IPurposeTypeModel extends Model<IPurposeTypeDocument> {}

export const loadPurposeTypeClass = (models: IModels) => {
  class PurposeType {
    /**
     * @param selector
     * @returns
     */
    public static async getPurposeType(
      selector: FilterQuery<IPurposeTypeDocument>
    ): Promise<IPurposeTypeDocument> {
      const purposeType = await models.LoanPurposeType.findOne(selector);

      if (!purposeType) throw new Error('PurposeType not found');

      return purposeType;
    }
  }

  purposeTypeSchema.loadClass(PurposeType);
  return purposeTypeSchema;
};
