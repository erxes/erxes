import { Model } from 'mongoose';
import {
  IAdjustClosing,
  IAdjustClosingDocument,
} from '../../@types/adjustClosingEntry';
import { IModels } from '~/connectionResolvers';
import {
  ADJ_CLOSING_STATUSES,
  adjustClosingSchema,
} from '../definitions/adjustClosingEntry';
import {
  getAdjustClosingBeginDate,
  removeClosingTransactions,
} from '../../utils/adjustClosings';

export interface IAdjustClosingEntryModel
  extends Model<IAdjustClosingDocument> {
  getAdjustClosing(selector: any): Promise<IAdjustClosingDocument>;
  createAdjustClosing(doc: IAdjustClosing): Promise<IAdjustClosingDocument>;
  checkAdjustClosingEditable(_id: string): Promise<IAdjustClosingDocument>;
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
  cancelAdjustClosing(
    _id: string,
    userId: string,
  ): Promise<IAdjustClosingDocument>;
  clearAdjustClosingTransactions(
    _id: string,
    userId: string,
  ): Promise<IAdjustClosingDocument>;
}

const getPureDate = (date: Date) => {
  const pureDate = new Date(date);
  pureDate.setHours(0, 0, 0, 0);
  return pureDate;
};

export const loadAdjustClosingClass = (models: IModels, subdomain: string) => {
  class AdjustClosing {
    /**
     *
     * Get Adjust Closing
     */

    public static async getAdjustClosing(selector: any) {
      const adjustClosing = await models.AdjustClosings.findOne(
        selector,
      ).lean();

      if (!adjustClosing) {
        throw new Error('Adjust Closing not found');
      }

      return adjustClosing;
    }

    /**
     * Create Adjust Closing. Every existing closing must be published and
     * dated before the new one; the begin date is derived, never supplied.
     */
    public static async createAdjustClosing(doc: IAdjustClosing) {
      const closingDate = doc?.date ? new Date(doc.date) : new Date();

      const unpublished = await models.AdjustClosings.findOne({
        status: { $ne: ADJ_CLOSING_STATUSES.PUBLISH },
      }).lean();

      if (unpublished) {
        throw new Error('Previous Adjust Closing is not published yet');
      }

      const laterClosing = await models.AdjustClosings.findOne({
        date: { $gte: getPureDate(closingDate) },
      }).lean();

      if (laterClosing) {
        throw new Error('A later closing adjustment already exists.');
      }

      const beginDate = await getAdjustClosingBeginDate(models, closingDate);

      return models.AdjustClosings.create({
        ...doc,
        date: closingDate,
        beginDate,
        status: ADJ_CLOSING_STATUSES.DRAFT,
        createdAt: new Date(),
      });
    }

    /**
     * Only the latest unpublished closing may be edited, recalculated, run,
     * or removed.
     */
    public static async checkAdjustClosingEditable(_id: string) {
      const current = await models.AdjustClosings.getAdjustClosing({ _id });

      if (current.status === ADJ_CLOSING_STATUSES.PUBLISH) {
        throw new Error('Published Adjust Closing cannot be edited');
      }

      const laterClosing = await models.AdjustClosings.findOne({
        _id: { $ne: _id },
        date: { $gt: current.date },
      }).lean();

      if (laterClosing) {
        throw new Error('Only the latest Adjust Closing can be edited');
      }

      return current;
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
      await models.AdjustClosings.checkAdjustClosingEditable(_id);

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
      const current = await models.AdjustClosings.getAdjustClosing({ _id });

      if (current.status === ADJ_CLOSING_STATUSES.PUBLISH) {
        throw new Error('Published Adjust Closing cannot be removed');
      }

      const laterClosing = await models.AdjustClosings.findOne({
        _id: { $ne: _id },
        date: { $gt: current.date },
      }).lean();

      if (laterClosing) {
        throw new Error('Only the latest Adjust Closing can be removed');
      }

      await removeClosingTransactions(models, current);
      await models.AdjustClosings.deleteOne({ _id });
      return 'success delete';
    }

    /**
     * Publish Adjust Closing. Every earlier closing must already be published.
     */
    public static async publishAdjustClosing(_id: string) {
      const current = await models.AdjustClosings.getAdjustClosing({ _id });

      if (current.status !== ADJ_CLOSING_STATUSES.COMPLETE) {
        throw new Error('Only completed Adjust Closing can be published');
      }

      const earlierUnpublished = await models.AdjustClosings.findOne({
        _id: { $ne: _id },
        date: { $lt: current.date },
        status: { $ne: ADJ_CLOSING_STATUSES.PUBLISH },
      }).lean();

      if (earlierUnpublished) {
        throw new Error('Adjust Closing must be published in order');
      }

      await models.AdjustClosings.updateOne(
        { _id },
        {
          $set: { status: ADJ_CLOSING_STATUSES.PUBLISH, updatedAt: new Date() },
        },
      );

      return models.AdjustClosings.getAdjustClosing({ _id });
    }

    /**
     * Reopen a published closing. Blocked while any later closing is
     * published.
     */
    public static async cancelAdjustClosing(_id: string, userId: string) {
      const current = await models.AdjustClosings.getAdjustClosing({ _id });

      if (current.status !== ADJ_CLOSING_STATUSES.PUBLISH) {
        throw new Error('Only published Adjust Closing can be cancelled');
      }

      const laterPublished = await models.AdjustClosings.findOne({
        _id: { $ne: _id },
        date: { $gt: current.date },
        status: ADJ_CLOSING_STATUSES.PUBLISH,
      }).lean();

      if (laterPublished) {
        throw new Error('A later closing adjustment already exists.');
      }

      await models.AdjustClosings.updateOne(
        { _id },
        {
          $set: {
            status: ADJ_CLOSING_STATUSES.COMPLETE,
            modifiedBy: userId,
            updatedAt: new Date(),
          },
        },
      );

      return models.AdjustClosings.getAdjustClosing({ _id });
    }

    /**
     * Remove the transactions generated by a completed closing and return it
     * to `process`, keeping its calculated details.
     */
    public static async clearAdjustClosingTransactions(
      _id: string,
      userId: string,
    ) {
      const current = await models.AdjustClosings.checkAdjustClosingEditable(
        _id,
      );

      if (current.status !== ADJ_CLOSING_STATUSES.COMPLETE) {
        throw new Error(
          'Only completed Adjust Closing transactions can be cleared',
        );
      }

      await removeClosingTransactions(models, current);

      return models.AdjustClosings.updateAdjustClosing(_id, {
        status: 'process',
        closePeriodTrId: '',
        earningTrId: '',
        taxPayableTrId: '',
        taxImpactValue: 0,
        modifiedBy: userId,
      });
    }
  }
  adjustClosingSchema.loadClass(AdjustClosing);

  return adjustClosingSchema;
};
