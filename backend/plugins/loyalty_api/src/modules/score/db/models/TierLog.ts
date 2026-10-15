import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { ILoyaltyTier } from '@/score/@types/accountType';
import {
  ILoyaltyTierLogDocument,
  TTierChangeVia,
} from '@/score/@types/tierLog';
import { loyaltyTierLogSchema } from '@/score/db/definitions/tierLog';
import { tierDirection } from '@/score/services/tierChanged';
import { IModels } from '~/connectionResolvers';
import { TLoyaltyAccountOwnerType } from '@/score/@types/account';

const TIER_ACTIVITY = 'loyalty.tier.change';
const MAX_LOGS = 100;

export interface ILoyaltyTierLogModel extends Model<ILoyaltyTierLogDocument> {
  record(args: {
    account: {
      _id: string;
      ownerType: TLoyaltyAccountOwnerType;
      ownerId: string;
    };
    accountType: { _id: string; name: string; tiers?: ILoyaltyTier[] };
    from: string | null;
    to: string | null;
    via?: TTierChangeVia;
  }): Promise<ILoyaltyTierLogDocument>;
  getTierLogs(args: {
    accountId?: string;
    targetId?: string;
    accountTypeId?: string;
    limit?: number;
  }): Promise<ILoyaltyTierLogDocument[]>;
}

const tierName = (tiers: ILoyaltyTier[], key: string | null) =>
  key ? tiers.find((tier) => tier.key === key)?.name || key : 'no tier';

export const loadLoyaltyTierLogClass = (
  models: IModels,
  { createActivityLog }: EventDispatcherReturn,
) => {
  class LoyaltyTierLog {
    /**
     * Keeps the change and tells the owner's timeline, and the record it
     * came from, about it. Without an actor core drops the activity, so
     * only the history line is kept then.
     */
    public static async record({
      account,
      accountType,
      from,
      to,
      via = {},
    }: Parameters<ILoyaltyTierLogModel['record']>[0]) {
      const tiers = accountType.tiers || [];
      const direction = tierDirection(tiers, from, to);
      const log = await models.LoyaltyTierLogs.create({
        accountId: account._id,
        ownerType: account.ownerType,
        ownerId: account.ownerId,
        accountTypeId: accountType._id,
        fromTier: from,
        toTier: to,
        direction,
        ...via,
      });

      const actorId = via.createdBy || via.createdVia?.actorId;

      if (actorId) {
        const description = `moved ${
          accountType.name
        } tier ${direction} from ${tierName(tiers, from)} to ${tierName(
          tiers,
          to,
        )}`;
        const changes = {
          tier: { prev: from, current: to },
          wallet: accountType.name,
        };
        const metadata = {
          tierLogId: log._id,
          accountTypeId: accountType._id,
          ownerType: account.ownerType,
          targetId: via.targetId,
          targetType: via.targetType,
        };

        createActivityLog(
          [
            {
              activityType: TIER_ACTIVITY,
              target: { _id: account.ownerId, createdVia: via.createdVia },
              action: { type: TIER_ACTIVITY, description },
              changes,
              metadata,
            },
            ...(via.targetId && via.targetType
              ? [
                  {
                    activityType: TIER_ACTIVITY,
                    target: { _id: via.targetId, createdVia: via.createdVia },
                    action: {
                      type: TIER_ACTIVITY,
                      description: `${description} of the ${account.ownerType}`,
                    },
                    changes,
                    metadata: { ...metadata, ownerId: account.ownerId },
                  },
                ]
              : []),
          ],
          actorId,
        );
      }

      return log;
    }

    // One account's changes, or those one record (a deal, an order) made.
    public static async getTierLogs({
      accountId,
      targetId,
      accountTypeId,
      limit = 50,
    }: Parameters<ILoyaltyTierLogModel['getTierLogs']>[0]) {
      if (!accountId && !targetId) {
        throw new Error('Tier logs need an account or a target');
      }

      return models.LoyaltyTierLogs.find({
        ...(accountId ? { accountId } : {}),
        ...(targetId ? { targetId } : {}),
        ...(accountTypeId ? { accountTypeId } : {}),
      })
        .sort({ createdAt: -1 })
        .limit(Math.min(Math.max(limit, 1), MAX_LOGS))
        .lean();
    }
  }

  loyaltyTierLogSchema.loadClass(LoyaltyTierLog);

  return loyaltyTierLogSchema;
};
