import {
  IPurpose,
  IPurposeDocument,
  purposeSchema,
} from './definitions/loanPurpose';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongoose';
import { escapeRegExp } from '@erxes/api-utils/src/core';

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
      const parentCategory = await models.LoanPurpose.findOne({
        _id: doc.parentId,
      }).lean();

      doc.order = await this.generateOrder(parentCategory, doc);

      return models.LoanPurpose.create({ ...doc, createdAt: new Date() });
    }

    /**
     * Update Purpose
     */
    public static async updatePurpose(_id: string, doc: IPurpose) {
      const category = await models.LoanPurpose.getPurpose({
        _id,
      });

      const parentCategory = await models.LoanPurpose.findOne({
        _id: doc.parentId,
      }).lean();

      doc.order = await this.generateOrder(parentCategory, doc);

      const childCategories = await models.LoanPurpose.find({
        $and: [
          { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
          { _id: { $ne: _id } },
        ],
      });

      await models.LoanPurpose.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async (childCategory) => {
        let order = childCategory.order;

        order = order.replace(category.order, doc.order);

        await models.LoanPurpose.updateOne(
          { _id: childCategory._id },
          { $set: { order } }
        );
      });

      return models.LoanPurpose.findOne({ _id });
    }

    /**
     * Remove Purpose
     */
    public static async removePurposes(_ids: string[]) {
      // Step 1: Check if all LoanPurpose entries exist
      const existingPurposes = await models.LoanPurpose.find({
        _id: { $in: _ids },
      });
      if (existingPurposes.length !== _ids.length) {
        throw new Error('Some Loan Purposes do not exist');
      }

      // Step 2: Check if any active Loans reference these purposes
      const count = await models.LoanPurpose.countDocuments({
        parentId: { $in: _ids },
      });

      if (count > 0) {
        throw new Error(
          "Can't remove purposes that are being used in child purposes"
        );
      }

      // Step 3: Delete the purposes
      return models.LoanPurpose.deleteMany({ _id: { $in: _ids } });
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IPurpose | null | undefined,
      doc: IPurpose
    ) {
      const order = parentCategory
        ? `${parentCategory.order}${doc.code}/`
        : `${doc.code}/`;

      return order;
    }
  }

  purposeSchema.loadClass(Purpose);
  return purposeSchema;
};
