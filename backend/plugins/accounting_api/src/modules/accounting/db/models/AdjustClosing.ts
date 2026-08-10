import { Model } from 'mongoose';
import {
  IAdjustClosing,
  IAdjustClosingDocument,
} from '../../@types/adjustClosingEntry';
import { IModels } from '~/connectionResolvers';
import { adjustClosingSchema } from '../definitions/adjustClosingEntry';

export interface IAdjustClosingEntryModel extends Model<IAdjustClosingDocument> {
  getAdjustClosing(selector: any): Promise<IAdjustClosingDocument>;
  createAdjustClosing(doc: IAdjustClosing): Promise<IAdjustClosingDocument>;
  updateAdjustClosing(
    _id: string,
    doc: Partial<IAdjustClosing> & {
      detailId?: string;
      entryId?: string;
      percent?: number;
    },
  ): Promise<IAdjustClosingDocument>;
  removeAdjustClosing(_id: string): Promise<string>;
  publishAdjustClosing(_id: string): Promise<IAdjustClosingDocument>;
}

export const loadAdjustClosingClass = (models: IModels, subdomain: string) => {
  class AdjustClosing {
    /**
     *
     * Get Adjust Closing
     */

    public static async getAdjustClosing(selector: any) {
      const adjustClosing =
        await models.AdjustClosings.findOne(selector).lean();

      if (!adjustClosing) {
        throw new Error('Adjust Closing not found');
      }

      return adjustClosing;
    }

    /**
     * Create Adjust Closing
     */
    public static async createAdjustClosing(doc: IAdjustClosing) {
      const lastEntry = await models.AdjustClosings.findOne({})
        .sort({ date: -1 })
        .lean();

      const closingDate = doc?.date ? new Date(doc.date) : new Date();

      if (
        lastEntry &&
        !['complete', 'publish'].includes(lastEntry.status || '')
      ) {
        throw new Error('Previous Adjust Closing is not published yet');
      }

      return models.AdjustClosings.create({
        ...doc,
        date: closingDate,
        status: 'draft',
        createdAt: new Date(),
      });
    }

    /**
     * Update Adjust Closing
     */
    public static async updateAdjustClosing(
      _id: string,
      doc: Partial<IAdjustClosing> & {
        detailId?: string;
        entryId?: string;
        percent?: number;
      },
    ) {
      const lastEntry = await models.AdjustClosings.findOne({})
        .sort({ createdAt: -1 })
        .lean();

      if (!lastEntry) {
        throw new Error('No Adjust Closing found');
      }

      if (lastEntry._id.toString() !== _id) {
        throw new Error('Only the latest Adjust Closing can be edited');
      }

      if (lastEntry.status === 'publish') {
        throw new Error('Published Adjust Closing cannot be edited');
      }

      const { detailId, entryId, percent, ...setDoc } = doc;

      if (detailId && entryId && typeof percent === 'number') {
        await models.AdjustClosings.updateOne(
          { _id, 'details._id': detailId, 'details.entries._id': entryId },
          {
            $set: {
              'details.$[detail].entries.$[entry].percent': percent,
              updatedAt: new Date(),
            },
          },
          {
            arrayFilters: [
              { 'detail._id': detailId },
              { 'entry._id': entryId },
            ],
          },
        );

        return models.AdjustClosings.getAdjustClosing({ _id });
      }

      const result = await models.AdjustClosings.findByIdAndUpdate(
        _id,
        { $set: { ...setDoc, updatedAt: new Date() } },
        { new: true },
      ).lean();

      return result;
    }

    /**
     * Remove Adjust Closings
     */
    public static async removeAdjustClosing(_id: string) {
      const lastEntry = await models.AdjustClosings.findOne({})
        .sort({ createdAt: -1 })
        .lean();

      if (!lastEntry) {
        throw new Error('No Adjust Closing found');
      }

      if (lastEntry._id.toString() !== _id) {
        throw new Error('Only the latest Adjust Closing can be removed');
      }

      const parentIds = [
        lastEntry.closePeriodTrId,
        lastEntry.earningTrId,
        lastEntry.taxPayableTrId,
      ].filter((parentId): parentId is string => Boolean(parentId));

      for (const parentId of parentIds) {
        const oldTransaction = await models.Transactions.findOne({
          parentId,
        }).lean();

        if (oldTransaction) {
          await models.Transactions.removePTransaction({ parentId });
        }
      }

      await models.AdjustClosings.deleteOne({ _id });
      return 'success delete';
    }
    /**
     * Publish Adjust Closing
     */

    public static async publishAdjustClosing(_id: string) {
      const lastPublished = await models.AdjustClosings.findOne({
        status: 'complete',
      })
        .sort({ createdAt: -1 })
        .lean();

      const current = await models.AdjustClosings.findById(_id).lean();

      if (!current?.createdAt) {
        throw new Error('Adjust Closing not found or missing createdAt');
      }

      if (lastPublished && current.createdAt < lastPublished.createdAt!) {
        throw new Error('Adjust Closing must be published in order');
      }

      await models.AdjustClosings.updateOne(
        { _id },
        { $set: { status: 'publish', updatedAt: new Date() } },
      );

      return models.AdjustClosings.getAdjustClosing({ _id });
    }
  }
  adjustClosingSchema.loadClass(AdjustClosing);

  return adjustClosingSchema;
};
