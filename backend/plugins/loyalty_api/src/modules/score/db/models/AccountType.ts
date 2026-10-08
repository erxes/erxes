import {
  ILoyaltyAccountType,
  ILoyaltyAccountTypeDocument,
  ILoyaltyAccountTypeExpiry,
  ILoyaltyAccountTypeReset,
  ILoyaltyAccountTypeResetState,
  ILoyaltyTier,
  ILoyaltyTierInput,
  TLoyaltyEarnEligibility,
  TLoyaltyOwnerType,
} from '@/score/@types/accountType';
import { IScoreCampaign } from '@/score/@types/scoreCampaign';
import { LOYALTY_ACCOUNT_TYPE_STATUSES } from '@/score/constants';
import { loyaltyAccountTypeSchema } from '@/score/db/definitions/accountType';
import {
  adoptAccountBalanceField,
  ensureAccountFields,
  setAccountBalanceFieldArchived,
} from '@/score/services/accountBalance';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { getLotExpiry } from '@/score/services/lotPolicy';
import { syncPeriodSchedule } from '@/score/services/periodSchedule';
import { earnEligibilityIssue } from '@/score/services/earnEligibility';
import { IModels } from '~/connectionResolvers';

const generateTierKey = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  8,
);

type TAccountTypeUpdate = Pick<
  ILoyaltyAccountType,
  | 'name'
  | 'frozenBlocks'
  | 'tiers'
  | 'reset'
  | 'expiry'
  | 'pendingDays'
  | 'currencyRatio'
  | 'pointValue'
  | 'earnEligibility'
>;

// "Everyone" keeps no segment behind it.
const normalizeEligibility = (
  eligibility: TLoyaltyEarnEligibility | undefined,
  ownerType: TLoyaltyOwnerType,
) => {
  const issue = earnEligibilityIssue(eligibility, ownerType);

  if (issue) {
    throw new Error(issue);
  }

  return eligibility?.who === 'segment'
    ? { who: eligibility.who, segmentId: eligibility.segmentId }
    : { who: eligibility?.who || 'all' };
};

// Keys stay with their tier across renames and reorders: records hold keys.
// Tiers left out are kept as deprecated; listing one again by name revives it.
const normalizeTiers = (
  input: ILoyaltyTierInput[],
  existing: ILoyaltyTier[] = [],
): ILoyaltyTier[] => {
  const byKey = new Map(existing.map((tier) => [tier.key, tier]));
  const byName = new Map(
    existing.map((tier) => [tier.name.toLowerCase(), tier]),
  );
  const names = new Set<string>();

  const listed = input.map(({ key, name }, order) => {
    const trimmed = name?.trim();

    if (!trimmed) {
      throw new Error('Tier name is required');
    }

    if (names.has(trimmed.toLowerCase())) {
      throw new Error(`Tier "${trimmed}" is listed twice`);
    }

    names.add(trimmed.toLowerCase());

    const match = (key && byKey.get(key)) || byName.get(trimmed.toLowerCase());

    return { key: match?.key || generateTierKey(), name: trimmed, order };
  });

  const listedKeys = new Set(listed.map(({ key }) => key));
  const removed = existing
    .filter(({ key }) => !listedKeys.has(key))
    .map(({ key, name }, index) => ({
      key,
      name,
      order: listed.length + index,
      deprecated: true,
    }));

  return [...listed, ...removed];
};

const normalizeReset = (
  input: ILoyaltyAccountTypeReset | undefined,
  prev?: ILoyaltyAccountTypeResetState,
): ILoyaltyAccountTypeResetState | undefined => {
  if (!input) {
    return prev;
  }

  const period = input.period || 'never';
  const periodChanged = period !== (prev?.period || 'never');

  return {
    period,
    tierTo: input.tierTo || 'keep',
    since:
      period === 'never' ? undefined : periodChanged ? new Date() : prev?.since,
    lastBoundary: periodChanged ? undefined : prev?.lastBoundary,
  };
};

const normalizeExpiry = (
  input: ILoyaltyAccountTypeExpiry | undefined,
  prev: ILoyaltyAccountTypeExpiry | undefined,
  reset: ILoyaltyAccountTypeResetState | undefined,
): ILoyaltyAccountTypeExpiry => {
  const expiry = input || prev || { mode: 'none' };

  if (expiry.mode === 'calendar' && (reset?.period || 'never') === 'never') {
    throw new Error('Calendar expiry needs a monthly or yearly reset period');
  }

  if (expiry.mode === 'rolling') {
    const months = Math.floor(Number(expiry.months));

    if (!(months >= 1)) {
      throw new Error('Rolling expiry needs a number of months');
    }

    return { mode: 'rolling', months };
  }

  return { mode: expiry.mode || 'none' };
};

const normalizePendingDays = (value: number | undefined, prev = 0) => {
  if (value === undefined || value === null) {
    return prev;
  }

  const days = Math.floor(Number(value));

  if (!(days >= 0)) {
    throw new Error('Pending days must be zero or more');
  }

  return days;
};

const normalizePositive = (
  value: number | undefined,
  prev: number | undefined,
  label: string,
) => {
  if (value === undefined || value === null) {
    return prev ?? 1;
  }

  const number = Number(value);

  if (!(number > 0)) {
    throw new Error(`${label} must be more than zero`);
  }

  return number;
};

export interface ILoyaltyAccountTypeModel
  extends Model<ILoyaltyAccountTypeDocument> {
  getAccountType(_id: string): Promise<ILoyaltyAccountTypeDocument>;
  getActiveAccountType(_id: string): Promise<ILoyaltyAccountTypeDocument>;
  createAccountType(
    doc: ILoyaltyAccountType,
    user?: IUserDocument,
  ): Promise<ILoyaltyAccountTypeDocument>;
  updateAccountType(
    _id: string,
    doc: TAccountTypeUpdate,
  ): Promise<ILoyaltyAccountTypeDocument>;
  setAccountTypeArchived(
    _id: string,
    archived: boolean,
  ): Promise<ILoyaltyAccountTypeDocument>;
  adoptCampaignFields(
    user?: IUserDocument,
  ): Promise<IAdoptCampaignFieldsResult>;
}

export interface IAdoptCampaignFieldsResult {
  adopted: {
    accountTypeId: string;
    name: string;
    campaigns: number;
    recast: number;
    unreadable: number;
  }[];
  skipped: { fieldId: string; reason: string }[];
}

// Account types are never deleted: the ledger keeps pointing at them.
export const loadLoyaltyAccountTypeClass = (
  models: IModels,
  subdomain: string,
  { sendDbEventLog }: EventDispatcherReturn,
) => {
  // Saving a wallet must not fail because its nightly run could not be
  // queued; the next save or run puts it right.
  const keepPeriodSchedule = () =>
    syncPeriodSchedule(models, subdomain).catch((error) =>
      console.error(
        `[loyalty periods] ${subdomain} schedule: ${
          error instanceof Error ? error.message : String(error)
        }`,
      ),
    );

  class LoyaltyAccountType {
    public static async getAccountType(_id: string) {
      const accountType = await models.LoyaltyAccountTypes.findOne({ _id });

      if (!accountType) {
        throw new Error('Loyalty wallet not found');
      }

      return accountType;
    }

    public static async getActiveAccountType(_id: string) {
      const accountType = await models.LoyaltyAccountTypes.getAccountType(_id);

      if (accountType.status !== LOYALTY_ACCOUNT_TYPE_STATUSES.ACTIVE) {
        throw new Error(`Loyalty wallet "${accountType.name}" is archived`);
      }

      return accountType;
    }

    public static async createAccountType(
      doc: ILoyaltyAccountType,
      user?: IUserDocument,
    ) {
      const name = doc.name?.trim();

      if (!name) {
        throw new Error('Wallet name is required');
      }

      const reset = normalizeReset(doc.reset);
      const accountType = await models.LoyaltyAccountTypes.create({
        ...doc,
        name,
        earnEligibility: normalizeEligibility(
          doc.earnEligibility,
          doc.ownerType,
        ),
        tiers: normalizeTiers(doc.tiers || []),
        reset,
        expiry: normalizeExpiry(doc.expiry, undefined, reset),
        pendingDays: normalizePendingDays(doc.pendingDays),
        currencyRatio: normalizePositive(
          doc.currencyRatio,
          undefined,
          'Money per earned point',
        ),
        pointValue: normalizePositive(
          doc.pointValue,
          undefined,
          'Money a point pays',
        ),
        createdUserId: user?._id,
      });

      try {
        const { fieldId, tierFieldId } = await ensureAccountFields(
          subdomain,
          accountType,
        );

        accountType.fieldId = fieldId;
        accountType.tierFieldId = tierFieldId;
      } catch (error) {
        // No field means no account type: nothing could ever show its balance.
        await models.LoyaltyAccountTypes.deleteOne({ _id: accountType._id });
        throw error;
      }

      await accountType.save();

      sendDbEventLog({
        action: 'create',
        docId: accountType._id,
        currentDocument: accountType.toObject(),
      });

      await keepPeriodSchedule();

      return accountType;
    }

    public static async updateAccountType(
      _id: string,
      {
        name,
        frozenBlocks,
        tiers,
        reset,
        expiry,
        pendingDays,
        currencyRatio,
        pointValue,
        earnEligibility,
      }: TAccountTypeUpdate,
    ) {
      const prev = await models.LoyaltyAccountTypes.getAccountType(_id);
      const trimmed = name?.trim();

      if (!trimmed) {
        throw new Error('Wallet name is required');
      }

      const prevTiers = prev.toObject().tiers || [];
      const nextTiers = tiers ? normalizeTiers(tiers, prevTiers) : prevTiers;
      const { tierFieldId } = await ensureAccountFields(subdomain, {
        ...prev.toObject(),
        name: trimmed,
        tiers: nextTiers,
      });

      const nextReset = normalizeReset(reset, prev.reset);
      const nextExpiry = normalizeExpiry(expiry, prev.expiry, nextReset);
      const updated = await models.LoyaltyAccountTypes.findOneAndUpdate(
        { _id },
        {
          $set: {
            name: trimmed,
            tiers: nextTiers,
            tierFieldId,
            reset: nextReset,
            expiry: nextExpiry,
            pendingDays: normalizePendingDays(pendingDays, prev.pendingDays),
            currencyRatio: normalizePositive(
              currencyRatio,
              prev.currencyRatio,
              'Money per earned point',
            ),
            pointValue: normalizePositive(
              pointValue,
              prev.pointValue,
              'Money a point pays',
            ),
            ...(frozenBlocks ? { frozenBlocks } : {}),
            ...(earnEligibility
              ? {
                  earnEligibility: normalizeEligibility(
                    earnEligibility,
                    prev.ownerType,
                  ),
                }
              : {}),
          },
        },
        { new: true, runValidators: true },
      );

      if (!updated) {
        throw new Error('Loyalty wallet not found');
      }

      const wasRolling = prev.expiry?.mode === 'rolling';
      const isRolling = nextExpiry.mode === 'rolling';

      // Open lots follow the policy from now on: turning rolling expiry on
      // gives undated lots the full period from today, not a past date.
      if (wasRolling !== isRolling) {
        await models.LoyaltyLots.retime(_id, getLotExpiry(updated));
      }

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updated.toObject(),
        prevDocument: prev.toObject(),
      });

      await keepPeriodSchedule();

      return updated;
    }

    public static async setAccountTypeArchived(_id: string, archived: boolean) {
      const prev = await models.LoyaltyAccountTypes.getAccountType(_id);

      await setAccountBalanceFieldArchived(subdomain, _id, archived);

      const updated = await models.LoyaltyAccountTypes.findOneAndUpdate(
        { _id },
        {
          $set: {
            status: archived
              ? LOYALTY_ACCOUNT_TYPE_STATUSES.ARCHIVED
              : LOYALTY_ACCOUNT_TYPE_STATUSES.ACTIVE,
          },
        },
        { new: true },
      );

      if (!updated) {
        throw new Error('Loyalty wallet not found');
      }

      sendDbEventLog({
        action: 'update',
        docId: _id,
        currentDocument: updated.toObject(),
        prevDocument: prev.toObject(),
      });

      await keepPeriodSchedule();

      return updated;
    }

    // Turns the custom fields legacy campaigns write into account types, keeping
    // the field ids so balances already on records stay where they are.
    public static async adoptCampaignFields(user?: IUserDocument) {
      const result: IAdoptCampaignFieldsResult = { adopted: [], skipped: [] };
      const campaigns = await models.ScoreCampaigns.find({
        fieldId: { $nin: [null, ''] },
        accountTypeId: { $in: [null, ''] },
      }).lean<(IScoreCampaign & { _id: string })[]>();

      const byField = new Map<string, typeof campaigns>();

      for (const campaign of campaigns) {
        const fieldId = campaign.fieldId as string;
        byField.set(fieldId, [...(byField.get(fieldId) || []), campaign]);
      }

      for (const [fieldId, group] of byField) {
        const ownerTypes = new Set(group.map(({ ownerType }) => ownerType));

        if (ownerTypes.size > 1) {
          result.skipped.push({
            fieldId,
            reason: `shared by ${[...ownerTypes].join(' and ')} campaigns`,
          });
          continue;
        }

        const field = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'fields',
          action: 'findOne',
          input: { query: { _id: fieldId } },
          defaultValue: null,
        });

        if (!field) {
          result.skipped.push({ fieldId, reason: 'field no longer exists' });
          continue;
        }

        const accountType =
          (await models.LoyaltyAccountTypes.findOne({ fieldId })) ||
          (await models.LoyaltyAccountTypes.create({
            name: field.name,
            ownerType: group[0].ownerType,
            fieldId,
            createdUserId: user?._id,
          }));

        let adoption: { recast: number; unreadable: number };

        try {
          const { recast, unreadable } = await adoptAccountBalanceField(
            subdomain,
            accountType,
            fieldId,
          );
          adoption = { recast, unreadable };
        } catch (error) {
          result.skipped.push({
            fieldId,
            reason: error instanceof Error ? error.message : String(error),
          });
          continue;
        }

        const campaignIds = group.map(({ _id }) => _id);

        await models.ScoreCampaigns.updateMany(
          { _id: { $in: campaignIds } },
          { $set: { accountTypeId: accountType._id } },
        );
        await models.ScoreLogs.updateMany(
          { campaignId: { $in: campaignIds } },
          { $set: { accountTypeId: accountType._id } },
        );

        result.adopted.push({
          accountTypeId: accountType._id,
          name: accountType.name,
          campaigns: campaignIds.length,
          ...adoption,
        });
      }

      return result;
    }
  }

  loyaltyAccountTypeSchema.loadClass(LoyaltyAccountType);

  return loyaltyAccountTypeSchema;
};
