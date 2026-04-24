import { Model } from 'mongoose';
import {
  IAdjustClosing,
  IAdjustClosingDocument,
} from '../../@types/adjustClosingEntry';
import { IModels } from '~/connectionResolvers';
import { adjustClosingSchema } from '../definitions/adjustClosingEntry';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export interface IAdjustClosingEntryModel
  extends Model<IAdjustClosingDocument> {
  getAdjustClosing(selector: any): Promise<IAdjustClosingDocument>;
  getAdjustClosings(params: {
    beginDate: Date;
    date: Date;
  }): Promise<IAdjustClosingDocument[]>;
  createAdjustClosing(doc: IAdjustClosing): Promise<IAdjustClosingDocument>;
  updateAdjustClosing(
    _id: string,
    doc: IAdjustClosing,
  ): Promise<IAdjustClosingDocument>;
  removeAdjustClosing(_id: string): Promise<{ n: number; ok: number }>;
  publishAdjustClosing(_id: string): Promise<IAdjustClosingDocument>;
}

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
     * Хаалтын дэлгэрэнгүйг салбар хэлтэс болон дансны үлдэгдлээр тооцож үүсгэх
     */
    public static async initDetails(subdomain: string, adj: IAdjustClosing) {
      const tempAccounts = await models.Accounts.find({ isTemp: true }).lean();
      const tempAccountIds = tempAccounts.map((a) => a._id);

      if (tempAccountIds.length === 0) return;

      const balances = await models.Transactions.aggregate([
        {
          $match: {
            accountId: { $in: tempAccountIds },
            date: { $gte: adj.beginDate, $lte: adj.date },
          },
        },
        {
          $group: {
            _id: {
              branchId: '$branchId',
              departmentId: '$departmentId',
              accountId: '$accountId',
            },
            balance: {
              $sum: {
                $cond: [
                  { $eq: ['$side', 'debit'] },
                  '$amount',
                  { $multiply: ['$amount', -1] },
                ],
              },
            },
          },
        },
        { $match: { balance: { $ne: 0 } } },
      ]);

      if (balances.length === 0) return;

      const detailsMap: { [key: string]: any } = {};

      for (const row of balances) {
        const { branchId, departmentId, accountId } = row._id;
        const key = `${branchId || 'none'}-${departmentId || 'none'}`;

        if (!detailsMap[key]) {
          detailsMap[key] = {
            _id: Math.random().toString(36).substr(2, 9),
            branchId,
            departmentId,
            entries: [],
            createdAt: new Date(),
          };
        }

        detailsMap[key].entries.push({
          _id: Math.random().toString(36).substr(2, 9),
          accountId: accountId,
          balance: row.balance,
          percent: 100,
        });
      }

      const details = Object.values(detailsMap);

      await models.AdjustClosings.updateOne(
        { _id: adj._id },
        { $set: { details } },
      );
    }

    /**
     * Create Adjust Closing
     */
    public static async createAdjustClosing(
      subdomain: string,
      doc: IAdjustClosing,
    ) {
      const lastEntry = await models.AdjustClosings.findOne({})
        .sort({ date: -1 })
        .lean();

      // if (lastEntry && lastEntry.status !== 'complete') {
      //   throw new Error('Previous Adjust Closing is not published yet');
      // }

      const beginDate = lastEntry ? lastEntry.date : Date();

      const adj = await models.AdjustClosings.create({
        ...doc,
        beginDate,
        status: 'draft',
        createdAt: new Date(),
      });

      const adjPlain = adj.toObject() as IAdjustClosing;

      try {
        await this.initDetails(subdomain, adjPlain);
      } catch (error) {
        await models.AdjustClosings.deleteOne({ _id: adj._id });
        throw error;
      }

      return models.AdjustClosings.findById(adj._id).lean();
    }

    /**
     * Update Adjust Closing
     */
    public static async updateAdjustClosing(_id: string, doc: IAdjustClosing) {
      const lastEntry = await models.AdjustClosings.findOne({})
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

      const result = await models.AdjustClosings.findByIdAndUpdate(
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
      const lastEntry = await models.AdjustClosings.findOne({})
        .sort({ createdAt: -1 })
        .lean();

      if (!lastEntry) {
        throw new Error('No Adjust Closing found');
      }

      if (lastEntry._id.toString() !== _id) {
        throw new Error('Only the latest Adjust Closing can be removed');
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
        { $set: { status: 'complete', publishedAt: new Date() } },
      );

      return 'published';
    }
    /**
     * Get Adjust Closings
     */

    public static async getAdjustClosings({
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
  adjustClosingSchema.loadClass(AdjustClosing);

  return adjustClosingSchema;
};
