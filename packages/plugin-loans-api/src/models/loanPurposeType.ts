import {
  IPurposeType,
  IPurposeTypeDocument,
  purposeTypeSchema,
} from './definitions/loanPurposeType';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongoose';

export interface IPurposeTypeModel extends Model<IPurposeType> {}

export const loadPurposeTypeClass = (models: IModels) => {
  class PurposeType {
    /**
     * @param selector
     * @returns
     */
    public static async getPurposeType(
      selector: FilterQuery<IPurposeType>,
    ): Promise<IPurposeTypeDocument> {
      const purposeType = await models.LoanPurposeType.findOne(selector);

      if (!purposeType) throw new Error('PurposeType not found');

      return purposeType;
    }
  }

  purposeTypeSchema.loadClass(PurposeType);
  return purposeTypeSchema;
};
