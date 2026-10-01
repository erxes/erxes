import { ILoyaltyLotDocument, TLoyaltyLotStatus } from '@/score/@types/lot';
import { loyaltyLotSchema } from '@/score/db/definitions/lot';
import { fixScoreNumber } from '@/score/services/scoreLedger';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

// Lots that never expire are spent last.
export const NO_EXPIRY_SORT = new Date('9999-12-31T00:00:00.000Z');

type TLotRef = { accountId: string; key: string };

export interface ILoyaltyLotModel extends Model<ILoyaltyLotDocument> {
  addLot(
    args: TLotRef & {
      amount: number;
      pending: boolean;
      availableAt: Date;
      expiresAt?: Date;
      sourceLogId?: string;
    },
  ): Promise<void>;
  take(
    args: TLotRef & {
      amount: number;
      status: Exclude<TLoyaltyLotStatus, 'closed'>;
      prefer?: { sourceLogId?: string; lotId?: string };
      onlyPreferred?: boolean;
    },
  ): Promise<number>;
  sumOpen(
    ref: TLotRef,
    status: Exclude<TLoyaltyLotStatus, 'closed'>,
    filter?: Record<string, unknown>,
  ): Promise<number>;
  reconcileAvailable(
    args: TLotRef & { target: number; expiresAt?: Date },
  ): Promise<void>;
  retime(key: string, expiresAt?: Date): Promise<void>;
}

export const loadLoyaltyLotClass = (models: IModels) => {
  class LoyaltyLot {
    public static async addLot({
      accountId,
      key,
      amount,
      pending,
      availableAt,
      expiresAt,
      sourceLogId,
    }: TLotRef & {
      amount: number;
      pending: boolean;
      availableAt: Date;
      expiresAt?: Date;
      sourceLogId?: string;
    }) {
      const value = fixScoreNumber(amount);

      if (value <= 0) {
        return;
      }

      await models.LoyaltyLots.create({
        accountId,
        key,
        sourceLogId,
        amount: value,
        remaining: value,
        availableAt,
        expiresAt,
        sortAt: expiresAt || NO_EXPIRY_SORT,
        status: pending ? 'pending' : 'available',
      });
    }

    // Soonest-expiring, then oldest first; preferred lots (the earning being
    // refunded or expired) go before the rest. Each step is one atomic
    // pipeline update (MongoDB 4.2+), so concurrent spenders never take the
    // same points twice. Returns how much was taken.
    public static async take({
      accountId,
      key,
      amount,
      status,
      prefer,
      onlyPreferred,
    }: TLotRef & {
      amount: number;
      status: Exclude<TLoyaltyLotStatus, 'closed'>;
      prefer?: { sourceLogId?: string; lotId?: string };
      onlyPreferred?: boolean;
    }) {
      const preferred = prefer?.lotId
        ? { _id: prefer.lotId }
        : prefer?.sourceLogId
        ? { sourceLogId: prefer.sourceLogId }
        : null;
      const scopes = [
        ...(preferred ? [preferred] : []),
        ...(onlyPreferred && preferred ? [] : [{}]),
      ];
      let left = fixScoreNumber(amount);
      let taken = 0;

      for (const scope of scopes) {
        while (left > 0) {
          const before = await models.LoyaltyLots.findOneAndUpdate(
            { accountId, key, status, remaining: { $gt: 0 }, ...scope },
            [
              {
                $set: {
                  remaining: { $max: [0, { $subtract: ['$remaining', left] }] },
                },
              },
              {
                $set: {
                  status: {
                    $cond: [{ $gt: ['$remaining', 0] }, '$status', 'closed'],
                  },
                },
              },
            ],
            { sort: { sortAt: 1, createdAt: 1 }, new: false },
          ).lean();

          if (!before) {
            break;
          }

          const step = Math.min(before.remaining, left);

          taken = fixScoreNumber(taken + step);
          left = fixScoreNumber(left - step);
        }
      }

      return taken;
    }

    public static async sumOpen(
      { accountId, key }: TLotRef,
      status: Exclude<TLoyaltyLotStatus, 'closed'>,
      filter: Record<string, unknown> = {},
    ) {
      const [result] = await models.LoyaltyLots.aggregate([
        { $match: { accountId, key, status, ...filter } },
        { $group: { _id: null, total: { $sum: '$remaining' } } },
      ]);

      return fixScoreNumber(result?.total || 0);
    }

    // Brings spendable lots in line with a balance that was set from the
    // ledger (repair) or drifted; a negative balance is debt, backed by none.
    public static async reconcileAvailable({
      accountId,
      key,
      target,
      expiresAt,
    }: TLotRef & { target: number; expiresAt?: Date }) {
      const backed = await models.LoyaltyLots.sumOpen(
        { accountId, key },
        'available',
      );
      const diff = fixScoreNumber(Math.max(0, target) - backed);

      if (diff > 0) {
        await models.LoyaltyLots.addLot({
          accountId,
          key,
          amount: diff,
          pending: false,
          availableAt: new Date(),
          expiresAt,
        });
      } else if (diff < 0) {
        await models.LoyaltyLots.take({
          accountId,
          key,
          amount: -diff,
          status: 'available',
        });
      }
    }

    // An expiry policy change applies to open lots too: turning rolling
    // expiry on dates the lots that had none, turning it off clears dates.
    public static async retime(key: string, expiresAt?: Date) {
      const open = { key, status: { $ne: 'closed' } };

      if (expiresAt) {
        await models.LoyaltyLots.updateMany(
          { ...open, expiresAt: { $exists: false } },
          { $set: { expiresAt, sortAt: expiresAt } },
        );
        return;
      }

      await models.LoyaltyLots.updateMany(
        { ...open, expiresAt: { $exists: true } },
        { $unset: { expiresAt: '' }, $set: { sortAt: NO_EXPIRY_SORT } },
      );
    }
  }

  loyaltyLotSchema.loadClass(LoyaltyLot);

  return loyaltyLotSchema;
};
