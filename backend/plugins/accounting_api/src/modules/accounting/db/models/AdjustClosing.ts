import { Model, Types } from 'mongoose';
import {
  IAdjustClosing,
  IAdjustClosingDetail,
  IAdjustClosingDocument,
  IAdjustClosingEntry,
  IClosingDetailEntry,
} from '../../@types/adjustClosingEntry';
import { IModels } from '~/connectionResolvers';
import { adjustClosingSchema } from '../definitions/adjustClosingEntry';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { TR_SIDES } from '../../@types/constants';

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
      const [branches, departments, tempAccounts] = await Promise.all([
        sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'branches',
          action: 'find',
          input: {},
          defaultValue: [],
        }),
        sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'departments',
          action: 'find',
          input: {},
          defaultValue: [],
        }),
        models.Accounts.find({ isTemp: true }).lean(),
      ]);

      const tempAccountIds = tempAccounts.map((a) => a._id);

      if (!tempAccountIds.length || !branches.length || !departments.length) {
        await models.AdjustClosings.updateOne(
          { _id: adj._id },
          { $set: { details: [] } },
        );
        return;
      }

      const balances = await models.Transactions.aggregate([
        {
          $match: {
            date: { $gte: adj.beginDate, $lte: adj.date },
            'details.accountId': { $in: tempAccountIds },
          },
        },
        { $unwind: '$details' },
        {
          $match: {
            'details.accountId': { $in: tempAccountIds },
          },
        },
        {
          $group: {
            _id: {
              branchId: '$details.branchId',
              departmentId: '$details.departmentId',
              accountId: '$details.accountId',
            },
            balance: {
              $sum: {
                $cond: [
                  { $eq: ['$side', TR_SIDES.DEBIT] },
                  '$details.amount',
                  { $multiply: ['$details.amount', -1] },
                ],
              },
            },
          },
        },
        { $match: { balance: { $ne: 0 } } },
      ]);

      const balanceMap: Record<string, number> = {};
      for (const row of balances) {
        const { branchId, departmentId, accountId } = row._id;
        const key = `${branchId}-${departmentId}-${accountId}`;
        balanceMap[key] = row.balance;
      }

      const details: IAdjustClosingDetail[] = [];

      for (const branch of branches) {
        for (const department of departments) {
          const entries: IClosingDetailEntry[] = [];

          for (const account of tempAccounts) {
            const key = `${branch._id}-${department._id}-${account._id}`;
            const balance = balanceMap[key];

            if (balance && balance !== 0) {
              entries.push({
                _id: new Types.ObjectId().toString(),
                accountId: account._id,
                balance,
                percent: 100,
              });
            }
          }

          if (entries.length > 0) {
            details.push({
              _id: new Types.ObjectId().toString(),
              branchId: branch._id,
              departmentId: department._id,
              entries,
              createdAt: new Date(),
            });
          }
        }
      }

      await models.AdjustClosings.updateOne(
        { _id: adj._id },
        { $set: { details } },
      );
    }
    /**
     * Create Adjust Closing
     */
    public static async createAdjustClosing(doc: IAdjustClosing) {
      const lastEntry = await models.AdjustClosings.findOne({})
        .sort({ date: -1 })
        .lean();

      const closingDate = doc?.date ? new Date(doc.date) : new Date();
      const beginDate = doc?.beginDate
        ? new Date(doc.beginDate)
        : lastEntry?.date
        ? new Date(lastEntry.date)
        : new Date('2000-01-01');

      if (lastEntry && lastEntry.status !== 'complete') {
        throw new Error('Previous Adjust Closing is not published yet');
      }

      const adj = await models.AdjustClosings.create({
        ...doc,
        beginDate,
        date: closingDate,
        status: 'draft',
        createdAt: new Date(),
      });

      const adjPlain: IAdjustClosing = {
        ...adj.toObject(),
        _id: adj._id,
        beginDate,
        date: closingDate,
      };

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
