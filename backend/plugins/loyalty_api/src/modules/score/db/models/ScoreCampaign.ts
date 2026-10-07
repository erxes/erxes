import {
  IScoreCampaign,
  IScoreCampaignDocument,
} from '@/score/@types/scoreCampaign';
import {
  IEarnInput,
  ILoyaltyPurchaseItem,
  ILoyaltyScoreSource,
  ISpendInput,
  TEarnRulePreview,
  TEarnRulesPreviewInput,
} from '@/score/@types/purchase';
import { IScoreLogDocument } from '@/score/@types/scoreLog';
import { SCORE_ACTION, SCORE_CAMPAIGN_STATUSES } from '@/score/constants';
import { scoreCampaignSchema } from '@/score/db/definitions/scoreCampaign';
import { bindCampaignAccountType } from '@/score/utils';
import {
  applyScoreChange,
  changeBalance,
  getOwnerBalance,
  fixScoreNumber,
  getLogChangeScore,
  prepareScoreLogChange,
  refundScoreChange,
  getScoreValueBeforeLog,
  ScoreOwner,
  updateOwnerScoreCache,
} from '@/score/services/scoreLedger';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import {
  generateTargetTotalAmountDeal,
  getAllowedProductIdsByRestrictions,
} from '~/utils/utils';
import {
  IEarnBreakdownItem,
  IEarnTable,
  TScoreSkip,
} from '@/score/@types/earnTable';
import { heldPastReset } from '@/score/services/earnWindow';
import {
  buildEarnContext,
  TEarnProductScope,
} from '@/score/services/earnContext';
import {
  evaluateEarnTable,
  explainEmptyEarn,
  normalizeEarnTable,
} from '@/score/services/earnTable';
import {
  checkSpendRules,
  maxSpendMoney,
  normalizeSpendRules,
  TSpendBlock,
} from '@/score/services/spendRules';

type TSpendLimitInput = Pick<
  ISpendInput,
  'ownerType' | 'ownerId' | 'campaignId' | 'totalAmount' | 'targetId'
>;

/** What an order may pay with points, for the paying screen to show. */
export type TSpendLimit = {
  balance: number;
  pointValue: number;
  maxAmount: number;
  step: number | null;
  blocked: TSpendBlock | null;
};

export interface IScoreCampaignModel extends Model<IScoreCampaignDocument> {
  getScoreCampaign(_id: string): Promise<IScoreCampaignDocument>;
  createScoreCampaign(
    doc: IScoreCampaign,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  updateScoreCampaign(
    _id: string,
    doc: IScoreCampaign,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  removeScoreCampaign(
    _id: string,
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  removeScoreCampaigns(
    _ids: string[],
    user: IUserDocument,
  ): Promise<IScoreCampaignDocument>;
  checkSpend(input: ISpendInput): Promise<boolean>;
  spendLimit(input: TSpendLimitInput): Promise<TSpendLimit>;
  spend(input: ISpendInput): Promise<IScoreLogDocument | null>;
  earn(
    input: IEarnInput,
    onSkip?: (skips: TScoreSkip[]) => void,
  ): Promise<IScoreLogDocument | null>;
  previewEarn(
    input: IEarnInput,
  ): Promise<{ points: number; skips: TScoreSkip[] }>;
  previewEarnRules(input: TEarnRulesPreviewInput): Promise<TEarnRulePreview[]>;
  refundTarget(args: {
    targetId: string;
    ownerType?: string;
    ownerId?: string;
    actorId?: string;
    description?: string;
  }): Promise<IScoreLogDocument[]>;
  updateOwnerScore(args: {
    ownerId: string;
    ownerType: string;
    updatedCustomFieldsData?: Record<string, any>;
    updatedScore?: number;
  }): Promise<any>;
}

// Deal stages no longer grant or refund points (automations and the selling
// side do), so an old client's stage rules are not stored again.
const withoutStageRules = (
  additionalConfig: IScoreCampaign['additionalConfig'],
) => {
  if (!additionalConfig || typeof additionalConfig !== 'object') {
    return additionalConfig;
  }

  return Object.fromEntries(
    Object.entries(additionalConfig).filter(([key]) => key !== 'cardBasedRule'),
  );
};

const withNormalizedModes = (doc: IScoreCampaign): IScoreCampaign => ({
  ...doc,
  ...(doc.additionalConfig
    ? { additionalConfig: withoutStageRules(doc.additionalConfig) }
    : {}),
  ...(doc.add
    ? {
        add: {
          table: normalizeEarnTable(
            (doc.add.table || { rows: [] }) as IEarnTable,
          ),
        },
      }
    : {}),
  ...(doc.subtract
    ? { subtract: { rules: normalizeSpendRules(doc.subtract.rules) } }
    : {}),
});

/**
 * Points a purchase earned into a wallet and still holds. A purchase never
 * pays with them: refunding it would take them back from a payment that
 * relied on them, and taking the payment again would need points that only
 * come once the purchase is final.
 */
const earnedOnTarget = async ({
  models,
  targetId,
  ownerType,
  ownerId,
  accountTypeId,
}: {
  models: IModels;
  targetId?: string;
  ownerType: string;
  ownerId: string;
  accountTypeId?: string;
}) => {
  if (!targetId) {
    return 0;
  }

  const earned = await models.ScoreLogs.find(
    {
      targetId,
      ownerType,
      ownerId,
      action: SCORE_ACTION.ADD,
      accountTypeId: accountTypeId || { $exists: false },
    },
    { changeScore: 1 },
  ).lean();

  if (!earned.length) {
    return 0;
  }

  const undone = await models.ScoreLogs.find(
    {
      targetId,
      action: { $in: [SCORE_ACTION.REFUND, SCORE_ACTION.RETURN] },
      sourceScoreLogId: { $in: earned.map(({ _id }) => _id) },
    },
    { changeScore: 1 },
  ).lean();

  return Math.max(
    0,
    [...earned, ...undone].reduce(
      (sum, { changeScore }) => sum + (Number(changeScore) || 0),
      0,
    ),
  );
};

// Points a payment with points costs under the campaign's spending rules,
// as a negative change. `alreadySpent` is what this order took before, so a
// recalculated order is checked against the balance it started from; what
// the order itself earned is not spendable on it.
const spendByRules = async ({
  models,
  subdomain,
  campaign,
  pointsPaymentAmount,
  totalAmount,
  owner,
  ownerType,
  ownerId,
  alreadySpent,
  targetId,
}: {
  models: IModels;
  subdomain: string;
  campaign: IScoreCampaignDocument;
  pointsPaymentAmount: number;
  totalAmount: number;
  owner: ScoreOwner;
  ownerType: string;
  ownerId: string;
  alreadySpent: number;
  targetId?: string;
}) => {
  const [accountType, balance, earnedHere] = await Promise.all([
    campaign.accountTypeId
      ? models.LoyaltyAccountTypes.findOne(
          { _id: campaign.accountTypeId },
          { pointValue: 1 },
        ).lean()
      : Promise.resolve(null),
    getOwnerBalance({
      models,
      subdomain,
      ownerType,
      ownerId,
      fieldId: campaign.fieldId,
      owner,
    }),
    earnedOnTarget({
      models,
      targetId,
      ownerType,
      ownerId,
      accountTypeId: campaign.accountTypeId,
    }),
  ]);

  return -checkSpendRules({
    rules: campaign.subtract?.rules || {},
    paidMoney: Number(pointsPaymentAmount) || 0,
    orderTotal: Number(totalAmount) || 0,
    pointValue: Number(accountType?.pointValue) || 1,
    balance: Math.max(0, balance + alreadySpent - earnedHere),
  });
};

const findActiveScoreLog = async ({
  models,
  targetId,
  ownerId,
  ownerType,
  campaignId,
  action,
}: {
  models: IModels;
  targetId?: string;
  ownerId: string;
  ownerType: string;
  campaignId: string;
  action: 'add' | 'subtract';
}) => {
  if (!targetId) {
    return null;
  }

  const scoreLogs = await models.ScoreLogs.find({
    targetId,
    ownerId,
    ownerType,
    campaignId,
    action,
  }).sort({ createdAt: -1 });

  for (const scoreLog of scoreLogs) {
    const refundLog = await models.ScoreLogs.exists({
      targetId,
      ownerId,
      ownerType,
      campaignId,
      action: { $in: ['refund', 'return'] },
      sourceScoreLogId: scoreLog._id,
    });

    if (!refundLog) {
      return scoreLog;
    }
  }

  return null;
};

export const loadScoreCampaignClass = (
  models: IModels,
  subdomain: string,
  dispatcher: EventDispatcherReturn,
) => {
  const { sendDbEventLog } = dispatcher;

  // The published campaign a change is made under, and the owner it is for.
  const loadCampaignOwner = async ({
    ownerType,
    ownerId,
    campaignId,
  }: {
    ownerType: string;
    ownerId: string;
    campaignId: string;
  }) => {
    if (!ownerType || !ownerId) {
      throw new Error('You must provide a owner');
    }

    const owner = await getLoyaltyOwner(subdomain, { ownerType, ownerId });

    if (!owner) {
      throw new Error('Owner not found');
    }

    const campaign = await models.ScoreCampaigns.findOne({
      _id: campaignId,
      status: SCORE_CAMPAIGN_STATUSES.PUBLISHED,
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (campaign.ownerType !== ownerType) {
      throw new Error(
        'Owner type is not the same as the owner type of the campaign',
      );
    }

    return { campaign, owner };
  };

  // The items a campaign's own product restrictions let count.
  const buildPurchaseProductScope = async (
    campaign: IScoreCampaignDocument,
    items: ILoyaltyPurchaseItem[],
  ): Promise<TEarnProductScope> => {
    const rows = items.map(({ productId, amount, discounted }) => ({
      productId,
      amount: Number(amount) || 0,
      discount: discounted ? 1 : 0,
    }));

    return {
      rows,
      allowedProductIds: await getAllowedProductIdsByRestrictions({
        subdomain,
        restrictions: campaign.restrictions,
        productsData: rows,
      }),
      discountCheck: campaign.additionalConfig?.discountCheck === true,
      requireTickUsed: false,
    };
  };

  // What a purchase earns under a campaign's table; shared by earning and
  // by previewing, so a preview can never disagree with what is given.
  const evaluatePurchase = async (
    campaign: IScoreCampaignDocument,
    earnTable: IEarnTable,
    input: IEarnInput,
  ) => {
    const { purchase } = input;
    const productScope = purchase.items?.length
      ? await buildPurchaseProductScope(campaign, purchase.items)
      : undefined;
    const earnCtx = await buildEarnContext({
      models,
      subdomain,
      campaign,
      ownerType: input.ownerType,
      ownerId: input.ownerId,
      targetId: input.targetId,
      serviceName: input.serviceName,
      table: earnTable,
      totalAmount: productScope
        ? generateTargetTotalAmountDeal(productScope.rows, productScope)
        : Number(purchase.totalAmount) || 0,
      paidAmount: Number(purchase.paidAmount) || 0,
      productScope,
    });
    const earned = evaluateEarnTable({
      table: earnTable,
      ctx: earnCtx,
      activeRowKeys: input.earnRowKeys,
    });

    return {
      earned,
      skips: () =>
        explainEmptyEarn({
          table: earnTable,
          ctx: earnCtx,
          activeRowKeys: input.earnRowKeys,
        }),
    };
  };

  /**
   * One campaign's standing entry on a purchase: written the first time,
   * moved by the difference when the purchase is recalculated, taken back
   * when it comes to nothing.
   */
  const writeCampaignChange = async ({
    campaign,
    owner,
    input,
    action,
    changeScore,
    breakdown,
    activeScoreLog,
  }: {
    campaign: IScoreCampaignDocument;
    owner: ScoreOwner;
    input: ILoyaltyScoreSource & { ownerType: string; ownerId: string };
    action: 'add' | 'subtract';
    changeScore: number;
    breakdown?: IEarnBreakdownItem[];
    activeScoreLog: IScoreLogDocument | null;
  }) => {
    const { ownerType, ownerId, targetId } = input;

    if (!changeScore) {
      if (!activeScoreLog) {
        return null;
      }

      const { log } = await refundScoreChange({
        models,
        subdomain,
        doc: {
          targetId,
          ownerType,
          ownerId,
          sourceScoreLogId: activeScoreLog._id,
          netTargetAddsForSubtract: false,
          createdBy: input.actorId,
          description: 'Purchase no longer earns from this campaign',
        },
      });

      return log;
    }

    if (!activeScoreLog) {
      const { log } = await applyScoreChange({
        models,
        subdomain,
        doc: {
          owner,
          ownerId,
          ownerType,
          campaignId: campaign._id,
          fieldId: campaign.fieldId,
          serviceName: input.serviceName,
          targetId,
          targetType: input.targetType,
          action,
          changeScore,
          breakdown,
          createdBy: input.actorId,
          createdVia: input.createdVia,
        },
      });

      return log;
    }

    if (changeScore === Number(activeScoreLog.changeScore)) {
      return activeScoreLog;
    }

    const currentChangeScore = getLogChangeScore(activeScoreLog);
    const next = prepareScoreLogChange({ action, changeScore });
    const difference = fixScoreNumber(next.changeScore - currentChangeScore);
    // Only the difference to the log's current amount moves the balance.
    const balance = await changeBalance({
      models,
      subdomain,
      ownerType,
      ownerId,
      owner,
      fieldId: campaign.fieldId,
      change: difference,
      absolute: false,
      // The change belongs to this earning: its lots grow or shrink.
      logId: activeScoreLog._id,
      sourceLogId: activeScoreLog._id,
      purchaseEarn: action === SCORE_ACTION.ADD && !!targetId,
      // A smaller purchase takes back points that may be spent already.
      preventNegativeBalance: action !== SCORE_ACTION.ADD,
    });

    activeScoreLog.changeScore = next.changeScore;
    if (breakdown) {
      activeScoreLog.breakdown = breakdown;
    }
    if (activeScoreLog.preScore === undefined) {
      activeScoreLog.preScore = await getScoreValueBeforeLog(
        models,
        activeScoreLog,
      );
    }
    await activeScoreLog.save();

    await models.ScoreLogs.recordActivity({
      log: activeScoreLog,
      actorId: input.actorId,
      changeScore: difference,
      previousScore: balance.previous,
      newScore: balance.next,
      walletName: balance.accountType?.name,
    });

    return activeScoreLog;
  };

  class ScoreCampaign {
    public static async getScoreCampaign(_id: string) {
      const scoreCampaign = await models.ScoreCampaigns.findOne({ _id });

      if (!scoreCampaign) {
        throw new Error('Score campaign not found');
      }

      return scoreCampaign;
    }

    public static async createScoreCampaign(
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      doc = withNormalizedModes(await bindCampaignAccountType({ models, doc }));

      const created = await models.ScoreCampaigns.create({
        ...doc,
        createdUserId: user?._id,
      });

      sendDbEventLog?.({
        action: 'create',
        docId: created._id,
        currentDocument: created.toObject(),
      });

      return created;
    }

    public static async updateScoreCampaign(
      _id: string,
      doc: IScoreCampaign,
      user: IUserDocument,
    ) {
      const prevDoc = await models.ScoreCampaigns.findOne({ _id }).lean();
      const scoreCampaign = await this.getScoreCampaign(_id);

      doc = withNormalizedModes(
        await bindCampaignAccountType({
          models,
          doc,
          campaign: scoreCampaign,
        }),
      );

      const result = await models.ScoreCampaigns.updateOne(
        { _id },
        { $set: { ...doc } },
      );

      sendDbEventLog?.({
        action: 'update',
        docId: _id,
        currentDocument: doc,
        prevDocument: prevDoc,
      });

      return result;
    }

    public static async removeScoreCampaign(_id: string, user: IUserDocument) {
      const prevDoc = await models.ScoreCampaigns.findOne({ _id }).lean();
      await this.getScoreCampaign(_id);

      const result = await models.ScoreCampaigns.updateOne(
        { _id },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } },
      );

      sendDbEventLog?.({
        action: 'update', // soft delete (status change)
        docId: _id,
        currentDocument: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED },
        prevDocument: prevDoc,
      });

      return result;
    }

    public static async removeScoreCampaigns(
      _ids: string[],
      user: IUserDocument,
    ) {
      const idsArray = Array.isArray(_ids) ? _ids : [_ids];
      const prevDocs = await models.ScoreCampaigns.find({
        _id: { $in: idsArray },
      }).lean();

      const result = await models.ScoreCampaigns.updateMany(
        { _id: { $in: idsArray } },
        { $set: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED } },
      );

      for (const prev of prevDocs) {
        sendDbEventLog?.({
          action: 'update',
          docId: prev._id,
          currentDocument: { status: SCORE_CAMPAIGN_STATUSES.ARCHIVED },
          prevDocument: prev,
        });
      }

      return result;
    }

    public static async checkSpend(input: ISpendInput) {
      const { campaign, owner } = await loadCampaignOwner(input);
      const activeScoreLog = await findActiveScoreLog({
        models,
        targetId: input.targetId,
        ownerId: input.ownerId,
        ownerType: input.ownerType,
        campaignId: campaign._id,
        action: 'subtract',
      });

      await spendByRules({
        models,
        subdomain,
        campaign,
        pointsPaymentAmount: input.pointsPaymentAmount,
        totalAmount: input.totalAmount,
        owner,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        alreadySpent: activeScoreLog
          ? Math.abs(getLogChangeScore(activeScoreLog))
          : 0,
        targetId: input.targetId,
      });

      return true;
    }

    /**
     * The most this order may pay with points. What it already paid counts
     * as available, so an order being edited can keep it.
     */
    public static async spendLimit(input: TSpendLimitInput) {
      const { campaign, owner } = await loadCampaignOwner(input);
      const [activeScoreLog, accountType, balance, account] = await Promise.all(
        [
          findActiveScoreLog({
            models,
            targetId: input.targetId,
            ownerId: input.ownerId,
            ownerType: input.ownerType,
            campaignId: campaign._id,
            action: 'subtract',
          }),
          campaign.accountTypeId
            ? models.LoyaltyAccountTypes.findOne(
                { _id: campaign.accountTypeId },
                { pointValue: 1 },
              ).lean()
            : Promise.resolve(null),
          getOwnerBalance({
            models,
            subdomain,
            ownerType: input.ownerType,
            ownerId: input.ownerId,
            fieldId: campaign.fieldId,
            owner,
          }),
          models.LoyaltyAccounts.findOne(
            { ownerType: input.ownerType, ownerId: input.ownerId },
            { status: 1 },
          ).lean(),
        ],
      );

      const earnedHere = await earnedOnTarget({
        models,
        targetId: input.targetId,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        accountTypeId: campaign.accountTypeId,
      });
      const rules = campaign.subtract?.rules || {};
      const pointValue = Number(accountType?.pointValue) || 1;
      const available = Math.max(
        0,
        balance +
          (activeScoreLog ? Math.abs(getLogChangeScore(activeScoreLog)) : 0) -
          earnedHere,
      );
      const step = rules.step || null;

      // Freezing always stops spending, whatever else the account type blocks.
      if (account?.status === 'frozen') {
        return {
          balance: available,
          pointValue,
          maxAmount: 0,
          step,
          blocked: 'frozen' as const,
        };
      }

      return {
        balance: available,
        pointValue,
        step,
        ...maxSpendMoney({
          rules,
          orderTotal: Number(input.totalAmount) || 0,
          pointValue,
          balance: available,
        }),
      };
    }

    /**
     * Records what a purchase paid with points. The amount is the whole of
     * it, so sending it again after an edit moves only the difference.
     */
    public static async spend(input: ISpendInput) {
      const { campaign, owner } = await loadCampaignOwner(input);
      const activeScoreLog = await findActiveScoreLog({
        models,
        targetId: input.targetId,
        ownerId: input.ownerId,
        ownerType: input.ownerType,
        campaignId: campaign._id,
        action: 'subtract',
      });
      const changeScore = await spendByRules({
        models,
        subdomain,
        campaign,
        pointsPaymentAmount: input.pointsPaymentAmount,
        totalAmount: input.totalAmount,
        owner,
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        alreadySpent: activeScoreLog
          ? Math.abs(getLogChangeScore(activeScoreLog))
          : 0,
        targetId: input.targetId,
      });

      return writeCampaignChange({
        campaign,
        owner,
        input,
        action: 'subtract',
        changeScore,
        activeScoreLog,
      });
    }

    /**
     * What `earn` would give this purchase, written nowhere. A zero carries
     * its reasons, as a skipped earn would.
     */
    public static async previewEarn(
      input: IEarnInput,
    ): Promise<{ points: number; skips: TScoreSkip[] }> {
      const { campaign } = await loadCampaignOwner(input);
      const earnTable = campaign.add?.table;

      if (!earnTable?.rows?.length) {
        return { points: 0, skips: [{ reason: 'no-rows' }] };
      }

      const { earned, skips } = await evaluatePurchase(
        campaign,
        earnTable,
        input,
      );

      if (!earned.total) {
        return { points: 0, skips: skips() };
      }

      const held = await heldPastReset({
        models,
        subdomain,
        accountTypeId: campaign.accountTypeId,
      });

      return held
        ? {
            points: 0,
            skips: [
              {
                reason: 'held-past-reset',
                availableAt: held.availableAt.toISOString(),
                resetsAt: held.resetsAt.toISOString(),
              },
            ],
          }
        : { points: earned.total, skips: [] };
    }

    /**
     * Previews every rule a selling side says would earn on one purchase.
     * A rule that cannot earn (campaign gone, wrong owner type) says why
     * instead of failing the others.
     */
    public static async previewEarnRules({
      ownerType,
      ownerId,
      rules,
      purchase,
    }: TEarnRulesPreviewInput): Promise<TEarnRulePreview[]> {
      const campaigns = await models.ScoreCampaigns.find(
        { _id: { $in: rules.map(({ campaignId }) => campaignId) } },
        { title: 1, accountTypeId: 1 },
      ).lean();
      const accountTypes = await models.LoyaltyAccountTypes.find(
        {
          _id: {
            $in: campaigns.flatMap(({ accountTypeId }) =>
              accountTypeId ? [accountTypeId] : [],
            ),
          },
        },
        { name: 1 },
      ).lean();

      return Promise.all(
        rules.map(async ({ campaignId, earnRowKeys }) => {
          const campaign = campaigns.find(({ _id }) => _id === campaignId);
          const accountType = accountTypes.find(
            ({ _id }) => _id === campaign?.accountTypeId,
          );
          const base = {
            campaignId,
            campaignTitle: campaign?.title || '',
            accountTypeName: accountType?.name || '',
          };

          try {
            const preview = await models.ScoreCampaigns.previewEarn({
              ownerType,
              ownerId,
              campaignId,
              earnRowKeys,
              purchase,
            });

            return { ...base, ...preview };
          } catch (e) {
            return {
              ...base,
              points: 0,
              skips: [],
              error: e instanceof Error ? e.message : String(e),
            };
          }
        }),
      );
    }

    /** Points a purchase earns under the campaign's earning table. */
    public static async earn(
      input: IEarnInput,
      onSkip?: (skips: TScoreSkip[]) => void,
    ) {
      const { campaign, owner } = await loadCampaignOwner(input);
      const earnTable = campaign.add?.table;

      if (!earnTable?.rows?.length) {
        throw new Error('Set up the earning table of this campaign first');
      }

      const activeScoreLog = await findActiveScoreLog({
        models,
        targetId: input.targetId,
        ownerId: input.ownerId,
        ownerType: input.ownerType,
        campaignId: campaign._id,
        action: 'add',
      });
      const { earned, skips } = await evaluatePurchase(
        campaign,
        earnTable,
        input,
      );

      if (!earned.total && !activeScoreLog) {
        onSkip?.(skips());

        return null;
      }

      // Held back past the next reset, the points would be cleared before
      // they could ever be spent; the purchase is recorded as giving none.
      const held =
        earned.total && !activeScoreLog && input.targetId
          ? await heldPastReset({
              models,
              subdomain,
              accountTypeId: campaign.accountTypeId,
            })
          : null;

      if (held) {
        onSkip?.([
          {
            reason: 'held-past-reset',
            availableAt: held.availableAt.toISOString(),
            resetsAt: held.resetsAt.toISOString(),
          },
        ]);

        return null;
      }

      return writeCampaignChange({
        campaign,
        owner,
        input,
        action: 'add',
        changeScore: earned.total,
        breakdown: earned.breakdown,
        activeScoreLog,
      });
    }

    /**
     * Undoes every earning and spending still standing on a record: its points
     * are taken back and the points paid with are returned. The selling side
     * decides when a purchase is undone; loyalty only follows.
     */
    public static async refundTarget({
      targetId,
      ownerType,
      ownerId,
      actorId,
      description,
    }: {
      targetId: string;
      ownerType?: string;
      ownerId?: string;
      actorId?: string;
      description?: string;
    }) {
      const logs = await models.ScoreLogs.find({
        targetId,
        ...(ownerType && ownerId ? { ownerType, ownerId } : {}),
        action: { $in: [SCORE_ACTION.ADD, SCORE_ACTION.SUBTRACT] },
      });
      const refunded = new Set(
        (
          await models.ScoreLogs.find(
            {
              targetId,
              action: { $in: [SCORE_ACTION.REFUND, SCORE_ACTION.RETURN] },
              sourceScoreLogId: { $in: logs.map(({ _id }) => _id) },
            },
            { sourceScoreLogId: 1 },
          ).lean()
        ).map(({ sourceScoreLogId }) => sourceScoreLogId),
      );
      const results: IScoreLogDocument[] = [];

      // Points paid with go back first, so taking back what was earned never
      // runs into a balance the payment had emptied.
      const ordered = [...logs].sort(
        (a, b) =>
          Number(b.action === SCORE_ACTION.SUBTRACT) -
          Number(a.action === SCORE_ACTION.SUBTRACT),
      );

      for (const sourceLog of ordered) {
        if (refunded.has(sourceLog._id) || !getLogChangeScore(sourceLog)) {
          continue;
        }

        const { log } = await refundScoreChange({
          models,
          subdomain,
          doc: {
            targetId,
            ownerType: sourceLog.ownerType || '',
            ownerId: sourceLog.ownerId || '',
            sourceScoreLogId: sourceLog._id,
            netTargetAddsForSubtract: false,
            createdBy: actorId,
            description: description || 'Purchase refunded',
          },
        });

        results.push(log);
      }

      return results;
    }

    static async updateOwnerScore({
      ownerId,
      ownerType,
      updatedCustomFieldsData,
      updatedScore,
    }: {
      ownerId: string;
      ownerType: string;
      updatedCustomFieldsData?: Record<string, any>;
      updatedScore?: number;
    }) {
      return await updateOwnerScoreCache({
        models,
        subdomain,
        ownerId,
        ownerType,
        updatedCustomFieldsData,
        updatedScore,
      });
    }
  }

  scoreCampaignSchema.loadClass(ScoreCampaign);

  return scoreCampaignSchema;
};
