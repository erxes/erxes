import { Model } from 'mongoose';
import {
  IAdjustClosing,
  IAdjustClosingDocument,
} from '../../@types/adjustClosingEntry';
import { IModels } from '~/connectionResolvers';
import { ACCOUNT_STATUSES } from '../../@types/constants';
import { adjustClosingSchema } from '../definitions/adjustClosingEntry';

export interface IAdjustClosingEntryModel
  extends Model<IAdjustClosingDocument> {
  getAdjustClosingEntry(selector: any): Promise<IAdjustClosingDocument>;
  createAdjustClosingEntry(
    doc: IAdjustClosing,
  ): Promise<IAdjustClosingDocument>;
  updateAdjustClosingEntry(
    _id: string,
    doc: IAdjustClosing,
  ): Promise<IAdjustClosingDocument>;
  removeAdjustClosing(_ids: string[]): Promise<{ n: number; ok: number }>;
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
     * Create a accounting
     */
    public static async createAdjustClosingEntry(doc: IAdjustClosing) {
      return models.AdjustClosingEntries.create({
        ...doc,
        createdAt: new Date(),
      });
    }

    /**
     * Update Accounting
     */
    public static async updateAdjustClosingEntry(
      _id: string,
      doc: IAdjustClosing,
    ) {
      const result = await models.AdjustClosingEntries.findByIdAndUpdate(
        _id,
        { $set: doc },
        { new: true },
      ).lean<IAdjustClosingDocument>();

      if (!result) {
        throw new Error(`Adjust Closing Entry with id ${_id} not found`);
      }

      return result;
    }

    /**
     * Remove accountings
     */
    public static async removeAdjustClosing(_ids: string[]) {
      await models.AdjustClosingEntries.deleteMany({ _id: { $in: _ids } });
      return 'success delete';
    }
  }
  adjustClosingSchema.loadClass(AdjustClosingEntry);

  return adjustClosingSchema;
};
