import { IEarnContext, IEarnTable } from '@/score/@types/earnTable';
import { IScoreCampaignDocument } from '@/score/@types/scoreCampaign';
import { SCORE_ACTION } from '@/score/constants';
import { hasProductConditions } from '@/score/services/earnTable';
import { resolveBalanceOwner } from '@/score/services/scoreLedger';
import { IModels } from '~/connectionResolvers';
import {
  generateTargetTotalAmountDeal,
  getAllowedProductIdsByRestrictions,
} from '~/utils/utils';

type TProductRows = NonNullable<
  Parameters<typeof generateTargetTotalAmountDeal>[0]
>;

export type TEarnProductScope = {
  rows: TProductRows;
  allowedProductIds?: Set<string>;
  discountCheck: boolean;
  requireTickUsed: boolean;
};

// "First purchase" = no earning from this campaign on another target that was
// not refunded; stable when the same target is recalculated.
const isFirstPurchase = async ({
  models,
  campaignId,
  ownerType,
  ownerId,
  targetId,
}: {
  models: IModels;
  campaignId: string;
  ownerType: string;
  ownerId: string;
  targetId?: string;
}) => {
  const earlier = models.ScoreLogs.find(
    {
      campaignId,
      ownerType,
      ownerId,
      action: SCORE_ACTION.ADD,
      ...(targetId ? { targetId: { $ne: targetId } } : {}),
    },
    { _id: 1 },
  ).cursor();

  for await (const log of earlier) {
    const refunded = await models.ScoreLogs.exists({
      sourceScoreLogId: log._id,
      action: { $in: [SCORE_ACTION.REFUND, SCORE_ACTION.RETURN] },
    });

    if (!refunded) {
      return false;
    }
  }

  return true;
};

// The tier the owner holds before this purchase counts.
const getTier = async ({
  models,
  subdomain,
  accountTypeId,
  ownerType,
  ownerId,
}: {
  models: IModels;
  subdomain: string;
  accountTypeId?: string;
  ownerType: string;
  ownerId: string;
}) => {
  if (!accountTypeId) {
    return null;
  }

  const { accountOwnerType, recordId } = await resolveBalanceOwner(
    subdomain,
    ownerType,
    ownerId,
  );
  const account = await models.LoyaltyAccounts.findOne(
    { ownerType: accountOwnerType, ownerId: recordId },
    { [`balances.${accountTypeId}.tier`]: 1 },
  ).lean();

  return account?.balances?.[accountTypeId]?.tier ?? null;
};

export const buildEarnContext = async ({
  models,
  subdomain,
  campaign,
  ownerType,
  ownerId,
  targetId,
  serviceName,
  table,
  totalAmount,
  paidAmount,
  productScope,
}: {
  models: IModels;
  subdomain: string;
  campaign: IScoreCampaignDocument;
  ownerType: string;
  ownerId: string;
  targetId?: string;
  serviceName?: string;
  table: IEarnTable;
  totalAmount: number;
  paidAmount: number;
  productScope?: TEarnProductScope;
}): Promise<IEarnContext> => {
  const scopedAmounts: Record<string, number> = {};

  for (const row of table.rows || []) {
    if (!productScope || !hasProductConditions(row.conditions)) {
      continue;
    }

    const rowAllowed = await getAllowedProductIdsByRestrictions({
      subdomain,
      restrictions: { ...row.conditions.products },
      productsData: productScope.rows,
    });
    // The campaign's own restrictions still bound every row.
    const allowedProductIds = new Set(
      [...(rowAllowed || [])].filter(
        (productId) =>
          !productScope.allowedProductIds ||
          productScope.allowedProductIds.has(productId),
      ),
    );

    scopedAmounts[row.key] = generateTargetTotalAmountDeal(productScope.rows, {
      ...productScope,
      allowedProductIds,
    });
  }

  const [accountType, tier, firstPurchase] = await Promise.all([
    campaign.accountTypeId
      ? models.LoyaltyAccountTypes.findOne(
          { _id: campaign.accountTypeId },
          { currencyRatio: 1 },
        ).lean()
      : Promise.resolve(null),
    getTier({
      models,
      subdomain,
      accountTypeId: campaign.accountTypeId,
      ownerType,
      ownerId,
    }),
    table.rows?.some((row) => row.conditions?.firstPurchase)
      ? isFirstPurchase({
          models,
          campaignId: campaign._id,
          ownerType,
          ownerId,
          targetId,
        })
      : Promise.resolve(false),
  ]);

  return {
    ratio: Number(accountType?.currencyRatio) || 1,
    tier,
    totalAmount: Number(totalAmount) || 0,
    paidAmount: Number(paidAmount) || 0,
    scopedAmounts,
    source: serviceName,
    firstPurchase,
  };
};
