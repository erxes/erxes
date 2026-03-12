import { Model } from 'mongoose';
import {
  IAdjustClosing,
  IAdjustClosingDocument,
} from '../../@types/adjustClosingEntry';
import { IModels } from '~/connectionResolvers';
import { adjustClosingSchema } from '../definitions/adjustClosingEntry';

export interface IAdjustClosingEntryModel
  extends Model<IAdjustClosingDocument> {
  getAdjustClosingEntry(selector: any): Promise<IAdjustClosingDocument>;
  getAdjustClosingEntries(params: {
    beginDate: Date;
    date: Date;
  }): Promise<IAdjustClosingDocument[]>;
  createAdjustClosingEntry(
    doc: IAdjustClosing,
  ): Promise<IAdjustClosingDocument>;
  updateAdjustClosingEntry(
    _id: string,
    doc: IAdjustClosing,
  ): Promise<IAdjustClosingDocument>;
  removeAdjustClosing(_id: string): Promise<{ n: number; ok: number }>;
  publishAdjustClosing(_id: string): Promise<IAdjustClosingDocument>;
}

export const loadAdjustClosingEntryClass = (
  models: IModels,
  subdomain: string,
) => {
  class AdjustClosingEntry {
    /**
     *
     * Get Adjust Closing
     */

    public static async getAdjustClosingEntry(selector: any) {
      const adjustClosing = await models.AdjustClosingEntries.findOne(
        selector,
      ).lean();

      if (!adjustClosing) {
        throw new Error('Adjust Closing not found');
      }

      return adjustClosing;
    }

    /**
     * Create Adjust Closing
     */
    public static async createAdjustClosingEntry(doc: IAdjustClosing) {
      const lastEntry = await models.AdjustClosingEntries.findOne({})
        .sort({ createdAt: -1 })
        .lean();

      if (lastEntry && lastEntry.status !== 'complete') {
        throw new Error('Previous Adjust Closing is not published yet');
      }

      return models.AdjustClosingEntries.create({
        ...doc,
        status: 'draft',
        createdAt: new Date(),
      });
    }

    /**
     * Update Adjust Closing
     */
    public static async updateAdjustClosingEntry(
      _id: string,
      doc: IAdjustClosing,
    ) {
      const lastEntry = await models.AdjustClosingEntries.findOne({})
        .sort({ createdAt: -1 })
        .lean();

      if (!lastEntry) {
        throw new Error('No Adjust Closing found');
      }

      if (lastEntry._id.toString() !== _id) {
        throw new Error('Only the latest Adjust Closing can be edited');
      }

      if (lastEntry.status === 'complete') {
        throw new Error('Published Adjust Closing cannot be edited');
      }

      const result = await models.AdjustClosingEntries.findByIdAndUpdate(
        _id,
        { $set: doc },
        { new: true },
      ).lean();

      return result;
    }

    /**
     * Remove Adjust Closings
     */
    public static async removeAdjustClosing(_id: string) {
      const lastEntry = await models.AdjustClosingEntries.findOne({})
        .sort({ createdAt: -1 })
        .lean();

      if (!lastEntry) {
        throw new Error('No Adjust Closing found');
      }

      if (lastEntry._id.toString() !== _id) {
        throw new Error('Only the latest Adjust Closing can be removed');
      }

      await models.AdjustClosingEntries.deleteOne({ _id });

      return 'success delete';
    }
    /**
     * Publish Adjust Closing
     */

    public static async publishAdjustClosing(_id: string) {
      const lastPublished = await models.AdjustClosingEntries.findOne({
        status: 'complete',
      })
        .sort({ createdAt: -1 })
        .lean();

      const current = await models.AdjustClosingEntries.findById(_id).lean();

      if (!current || !current.createdAt) {
        throw new Error('Adjust Closing not found or missing createdAt');
      }

      if (lastPublished && current.createdAt! < lastPublished.createdAt!) {
        throw new Error('Adjust Closing must be published in order');
      }

      await models.AdjustClosingEntries.updateOne(
        { _id },
        { $set: { status: 'complete', publishedAt: new Date() } },
      );

      return 'published';
    }

    /**
     * Get Adjust Closings
     */

    public static async getAdjustClosingEntries({
      beginDate,
      date,
    }: {
      beginDate: Date;
      date: Date;
    }) {
      const accounts = await models.Accounts.find({ isTemp: true })
        .select({ _id: 1 })
        .lean();

      if (!accounts.length) {
        return [];
      }

      const accountIds = accounts.map((acc) => acc._id);

      const detailResult = await models.Transactions.aggregate([
        {
          $match: {
            date: { $gt: beginDate, $lte: date },
            'details.accountId': { $in: accountIds },
          },
        },
        { $unwind: '$details' },
        { $match: { 'details.accountId': { $in: accountIds } } },
        {
          $project: {
            accountId: '$details.accountId',
            balance: { $subtract: ['$details.debit', '$details.credit'] },
          },
        },
      ]);

      if (!detailResult?.length) return [];

      return detailResult.map((r) => ({
        accountId: r.accountId,
        side: r.balance > 0 ? 'debit' : 'credit',
        amount: Math.abs(r.balance),
      }));
    }
  }
  adjustClosingSchema.loadClass(AdjustClosingEntry);

  return adjustClosingSchema;
};
