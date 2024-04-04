import { IPurposeDocument, purposeSchema } from './definitions/loanPurpose';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
export interface IPurposeModel extends Model<IPurposeDocument> {}
export const loadPurposeClass = (models: IModels) => {
  class Purpose {
    /**
     * @param selector
     * @returns
     */
    public static async getPurpose(
      selector: FilterQuery<IPurposeDocument>
    ): Promise<IPurposeDocument> {
      const purpose = await models.LoanPurpose.findOne(selector);

      if (!purpose) throw new Error('Purpose not found');

      return purpose;
    }
  }

  purposeSchema.loadClass(Purpose);
  return purposeSchema;
};
