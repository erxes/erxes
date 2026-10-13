import {
  ILoyaltyAccountDocument,
  TLoyaltyAccountOwnerType,
} from '@/score/@types/account';
import { loyaltyAccountSchema } from '@/score/db/definitions/account';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { IModels } from '~/connectionResolvers';

const generateNumber = customAlphabet('0123456789', 10);

const DUPLICATE_KEY = 11000;

type TOwnerRef = { ownerType: TLoyaltyAccountOwnerType; ownerId: string };

export interface ILoyaltyAccountModel extends Model<ILoyaltyAccountDocument> {
  getOwnerAccount(owner: TOwnerRef): Promise<ILoyaltyAccountDocument | null>;
  ensureOwnerAccount(owner: TOwnerRef): Promise<ILoyaltyAccountDocument>;
  setBalances(
    accountId: string,
    balances: Record<string, number>,
    pending?: Record<string, number>,
  ): Promise<void>;
  changePending(accountId: string, key: string, change: number): Promise<void>;
  releasePending(
    accountId: string,
    key: string,
    amount: number,
  ): Promise<{ previous: number; next: number } | null>;
  markLotsBacked(accountId: string, key: string): Promise<number | null>;
  seedBalance(accountId: string, key: string, balance: number): Promise<void>;
  setFrozen(args: {
    accountId: string;
    frozen: boolean;
    reason?: string;
    userId?: string;
  }): Promise<ILoyaltyAccountDocument>;
  setTier(args: {
    accountId: string;
    accountTypeId: string;
    tier: string | null;
  }): Promise<{ from: string | null; to: string | null; changed: boolean }>;
  markReset(
    accountId: string,
    accountTypeId: string,
    boundary: Date,
  ): Promise<void>;
  applyBalanceChange(args: {
    accountId: string;
    key: string;
    change: number;
    absolute: boolean;
    floor?: number;
  }): Promise<{ previous: number; next: number } | null>;
}

export const loadLoyaltyAccountClass = (
  models: IModels,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  class LoyaltyAccount {
    public static async getOwnerAccount({ ownerType, ownerId }: TOwnerRef) {
      return models.LoyaltyAccounts.findOne({ ownerType, ownerId });
    }

    // An owner gets an account the first time a balance is written for them.
    public static async ensureOwnerAccount(owner: TOwnerRef) {
      const existing = await models.LoyaltyAccounts.getOwnerAccount(owner);

      if (existing) {
        return existing;
      }

      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const account = await models.LoyaltyAccounts.create({
            ...owner,
            number: generateNumber(),
          });

          sendDbEventLog({
            action: 'create',
            docId: account._id,
            currentDocument: account.toObject(),
          });

          return account;
        } catch (error) {
          if ((error as { code?: number })?.code !== DUPLICATE_KEY) {
            throw error;
          }

          // Either a concurrent write created this owner's account, or the
          // number collided; the first case resolves on re-read.
          const created = await models.LoyaltyAccounts.getOwnerAccount(owner);

          if (created) {
            return created;
          }
        }
      }

      throw new Error('Could not open a loyalty account');
    }

    public static async setBalances(
      accountId: string,
      balances: Record<string, number>,
      pending: Record<string, number> = {},
    ) {
      const updatedAt = new Date();
      // Per field: the tier and reset marks beside a balance must survive.
      const $set = Object.fromEntries(
        Object.entries(balances).flatMap(([accountTypeId, balance]) => [
          [`balances.${accountTypeId}.balance`, balance],
          [`balances.${accountTypeId}.updatedAt`, updatedAt],
          ...(pending[accountTypeId] !== undefined
            ? [[`balances.${accountTypeId}.pending`, pending[accountTypeId]]]
            : []),
        ]),
      );

      if (Object.keys($set).length) {
        await models.LoyaltyAccounts.updateOne({ _id: accountId }, { $set });
      }
    }

    public static async setFrozen({
      accountId,
      frozen,
      reason,
      userId,
    }: {
      accountId: string;
      frozen: boolean;
      reason?: string;
      userId?: string;
    }) {
      const prev = await models.LoyaltyAccounts.findOne({ _id: accountId });

      if (!prev) {
        throw new Error('Loyalty account not found');
      }

      if (prev.status === 'closed') {
        throw new Error('A closed loyalty account cannot change');
      }

      if (frozen && !reason?.trim()) {
        throw new Error('A reason is required to freeze an account');
      }

      const updated = await models.LoyaltyAccounts.findOneAndUpdate(
        { _id: accountId },
        frozen
          ? {
              $set: {
                status: 'frozen',
                frozenAt: new Date(),
                frozenBy: userId,
                frozenReason: reason?.trim(),
              },
            }
          : {
              $set: { status: 'active' },
              $unset: { frozenAt: '', frozenBy: '', frozenReason: '' },
            },
        { new: true },
      );

      if (!updated) {
        throw new Error('Loyalty account not found');
      }

      // The event log keeps who froze or unfroze the account and why.
      sendDbEventLog({
        action: 'update',
        docId: accountId,
        currentDocument: updated.toObject(),
        prevDocument: prev.toObject(),
      });

      return updated;
    }

    // A balance that predates the account starts from what the owner record
    // already shows; later writes never overwrite it.
    public static async seedBalance(
      accountId: string,
      key: string,
      balance: number,
    ) {
      await models.LoyaltyAccounts.updateOne(
        { _id: accountId, [`balances.${key}.balance`]: { $exists: false } },
        {
          $set: {
            [`balances.${key}.balance`]: balance,
            [`balances.${key}.updatedAt`]: new Date(),
          },
        },
      );
    }

    // Last write wins; `from` is what this write replaced, atomically.
    public static async setTier({
      accountId,
      accountTypeId,
      tier,
    }: {
      accountId: string;
      accountTypeId: string;
      tier: string | null;
    }) {
      const path = `balances.${accountTypeId}`;
      const prev = await models.LoyaltyAccounts.findOneAndUpdate(
        {
          _id: accountId,
          status: { $ne: 'closed' },
          [`${path}.tier`]: { $ne: tier },
        },
        tier
          ? {
              $set: {
                [`${path}.tier`]: tier,
                [`${path}.tierSince`]: new Date(),
              },
            }
          : { $unset: { [`${path}.tier`]: '', [`${path}.tierSince`]: '' } },
      ).lean();

      if (!prev) {
        const account = await models.LoyaltyAccounts.findOne({
          _id: accountId,
        }).lean();

        if (!account) {
          throw new Error('Loyalty account not found');
        }

        if (account.status === 'closed') {
          throw new Error(`Loyalty account ${account.number} is closed`);
        }

        return { from: tier, to: tier, changed: false };
      }

      const current = await models.LoyaltyAccounts.findOne({ _id: accountId });

      sendDbEventLog({
        action: 'update',
        docId: accountId,
        currentDocument: current?.toObject(),
        prevDocument: prev,
      });

      return {
        from: prev.balances?.[accountTypeId]?.tier ?? null,
        to: tier,
        changed: true,
      };
    }

    public static async changePending(
      accountId: string,
      key: string,
      change: number,
    ) {
      await models.LoyaltyAccounts.updateOne(
        { _id: accountId },
        {
          $inc: { [`balances.${key}.pending`]: change },
          $set: { [`balances.${key}.updatedAt`]: new Date() },
        },
      );
    }

    // Pending points become spendable in one update, so the total never
    // counts them twice or not at all.
    public static async releasePending(
      accountId: string,
      key: string,
      amount: number,
    ) {
      const before = await models.LoyaltyAccounts.findOneAndUpdate(
        { _id: accountId },
        {
          $inc: {
            [`balances.${key}.balance`]: amount,
            [`balances.${key}.pending`]: -amount,
          },
          $set: { [`balances.${key}.updatedAt`]: new Date() },
        },
        { new: false },
      ).lean();

      if (!before) {
        return null;
      }

      const previous = Number(before.balances?.[key]?.balance) || 0;

      return { previous, next: previous + amount };
    }

    // The first lot operation on a balance marks it backed by lots and
    // returns what it held before, so exactly one caller turns that into a
    // lot; null when the balance already was backed.
    public static async markLotsBacked(accountId: string, key: string) {
      const marked = await models.LoyaltyAccounts.findOneAndUpdate(
        { _id: accountId, [`balances.${key}.lots`]: { $ne: true } },
        { $set: { [`balances.${key}.lots`]: true } },
        { new: true },
      ).lean();

      if (!marked) {
        return null;
      }

      return Number(marked.balances?.[key]?.balance) || 0;
    }

    public static async markReset(
      accountId: string,
      accountTypeId: string,
      boundary: Date,
    ) {
      await models.LoyaltyAccounts.updateOne(
        { _id: accountId },
        { $set: { [`balances.${accountTypeId}.resetAt`]: boundary } },
      );
    }

    // One atomic update per change, so concurrent writers never read each
    // other's stale balance. Returns null when the floor would be crossed.
    public static async applyBalanceChange({
      accountId,
      key,
      change,
      absolute,
      floor,
    }: {
      accountId: string;
      key: string;
      change: number;
      absolute: boolean;
      floor?: number;
    }) {
      const path = `balances.${key}`;
      const updatedAt = new Date();

      if (absolute) {
        const before = await models.LoyaltyAccounts.findOneAndUpdate(
          { _id: accountId },
          {
            $set: {
              [`${path}.balance`]: change,
              [`${path}.updatedAt`]: updatedAt,
            },
          },
        ).lean();

        return {
          previous: Number(before?.balances?.[key]?.balance) || 0,
          next: change,
        };
      }

      const after = await models.LoyaltyAccounts.findOneAndUpdate(
        {
          _id: accountId,
          ...(floor !== undefined && change < 0
            ? { [`${path}.balance`]: { $gte: floor - change } }
            : {}),
        },
        {
          $inc: { [`${path}.balance`]: change },
          $set: { [`${path}.updatedAt`]: updatedAt },
        },
        { new: true },
      ).lean();

      if (!after) {
        return null;
      }

      const next = Number(after.balances?.[key]?.balance) || 0;

      return { previous: next - change, next };
    }
  }

  loyaltyAccountSchema.loadClass(LoyaltyAccount);

  return loyaltyAccountSchema;
};
