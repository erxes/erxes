import {
  IPurpose,
  IPurposeDocument,
  purposeSchema,
} from './definitions/loanPurpose';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongoose';

export interface IPurposeModel extends Model<IPurposeDocument> {
  getPurpose(selector: FilterQuery<IPurposeDocument>);
  createPurpose(doc: IPurpose);
  updatePurpose(_id: string, doc: IPurpose);
  removePurposes(_ids: string[]);
}

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

    /**
     * Create a Purpose
     */
    public static async createPurpose(doc: IPurpose) {
      return models.LoanPurpose.create(doc);
    }

    /**
     * Update Purpose
     */
    public static async updatePurpose(_id: string, doc: IPurpose) {
      await models.LoanPurpose.updateOne({ _id }, { $set: doc });

      return models.LoanPurpose.findOne({ _id });
    }

    /**
     * Remove Purpose
     */
    public static async removePurposes(_ids: string[]) {
      return models.LoanPurpose.deleteMany({ _id: { $in: _ids } });
    }
  }

  purposeSchema.loadClass(Purpose);
  return purposeSchema;
};
