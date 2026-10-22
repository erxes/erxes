import { resolveAccountBalances } from '@/score/services/accountBalances';
import { TLoyaltyAccountOwnerType } from '@/score/@types/account';
import { IModels } from '~/connectionResolvers';
import { VOUCHER_STATUS } from '@/voucher/constants';
import {
  AUTO_SALE_VOUCHER_TYPES,
  PICKED_SALE_VOUCHER_TYPES,
  voucherExpiresAt,
  voucherTerms,
} from '@/voucher/services/voucherTerm';

const SALE_VOUCHER_TYPES = [
  ...AUTO_SALE_VOUCHER_TYPES,
  ...PICKED_SALE_VOUCHER_TYPES,
];

export interface IOwnerSummaryVoucher {
  _id: string;
  campaignId: string;
  title: string;
  voucherType: string;
  kind?: string;
  value?: number;
  expiresAt?: Date;
  status: string;
  // The order or deal it is held for, when on hold.
  heldFor?: { targetType?: string; targetId?: string };
  autoApplied: boolean;
  applicable: boolean;
  reason?: string;
}

const saleVouchers = async (
  models: IModels,
  ownerType: TLoyaltyAccountOwnerType,
  ownerId: string,
  totalAmount?: number,
  targetId?: string,
): Promise<IOwnerSummaryVoucher[]> => {
  const vouchers = await models.Vouchers.find({
    ownerType,
    ownerId,
    status: { $in: [VOUCHER_STATUS.NEW, VOUCHER_STATUS.ONHOLD] },
  }).lean();

  if (!vouchers.length) {
    return [];
  }

  const now = new Date();
  const campaigns = await models.VoucherCampaigns.find({
    _id: { $in: [...new Set(vouchers.map((v) => v.campaignId))] },
    status: 'active',
  }).lean();
  const campaignById = new Map(campaigns.map((c) => [c._id, c]));

  const result: IOwnerSummaryVoucher[] = [];

  for (const voucher of vouchers) {
    const campaign = campaignById.get(voucher.campaignId);

    if (!campaign) {
      continue;
    }

    const terms = voucherTerms(voucher, campaign);
    const expiresAt = voucherExpiresAt(voucher, campaign);
    const voucherType = terms.voucherType || '';

    if (
      !SALE_VOUCHER_TYPES.includes(voucherType) ||
      (expiresAt && expiresAt < now)
    ) {
      continue;
    }

    const autoApplied = AUTO_SALE_VOUCHER_TYPES.includes(voucherType);
    let reason: string | undefined;

    // Picked vouchers go through the same check the sale itself runs.
    if (!autoApplied) {
      try {
        await models.Vouchers.checkVoucher({
          voucherId: voucher._id,
          ownerType: voucher.ownerType,
          ownerId: voucher.ownerId,
          totalAmount,
          targetId,
        });
      } catch (e) {
        reason = e instanceof Error ? e.message : String(e);
      }
    }

    result.push({
      _id: voucher._id,
      campaignId: campaign._id,
      title: terms.title || campaign.title,
      voucherType,
      kind: terms.kind,
      value: terms.value,
      expiresAt,
      status: voucher.status || VOUCHER_STATUS.NEW,
      ...(voucher.status === VOUCHER_STATUS.ONHOLD
        ? {
            heldFor: {
              targetType: voucher.usedIn?.targetType,
              targetId: voucher.usedIn?.targetId,
            },
          }
        : {}),
      autoApplied,
      applicable: !reason,
      reason,
    });
  }

  return result.sort(
    (a, b) => Number(a.expiresAt ?? Infinity) - Number(b.expiresAt ?? Infinity),
  );
};

// What a selling screen may show about the owner it is serving.
export const getOwnerSummary = async (
  models: IModels,
  _subdomain: string,
  {
    ownerType,
    ownerId,
    totalAmount,
    targetId,
  }: {
    ownerType: TLoyaltyAccountOwnerType;
    ownerId: string;
    totalAmount?: number;
    // The order being sold, so its own held voucher shows as applicable.
    targetId?: string;
  },
) => {
  const account = await models.LoyaltyAccounts.getOwnerAccount({
    ownerType,
    ownerId,
  });

  const noBalances: Awaited<ReturnType<typeof resolveAccountBalances>> = [];
  const [balances, vouchers] = await Promise.all([
    account ? resolveAccountBalances(models, account) : noBalances,
    saleVouchers(models, ownerType, ownerId, totalAmount, targetId),
  ]);

  return {
    accountNumber: account?.number ?? null,
    status: account?.status ?? null,
    wallets: balances
      .filter(({ accountType }) => accountType?.status !== 'archived')
      .map(
        ({
          accountTypeId,
          accountType,
          balance,
          pending,
          tier,
          expiringSoon,
        }) => ({
          accountTypeId,
          name: accountType?.name ?? null,
          balance,
          pending,
          tier: tier ? { key: tier.key, name: tier.name } : null,
          expiringSoon,
        }),
      ),
    vouchers,
  };
};

/**
 * What loyalty already settled on one order or deal: the vouchers it used
 * there, and whether a coupon was redeemed there. Settled, its pick is final.
 */
export const getTargetSettled = async (
  models: IModels,
  {
    ownerType,
    ownerId,
    targetId,
  }: {
    ownerType: TLoyaltyAccountOwnerType;
    ownerId: string;
    targetId: string;
  },
) => {
  const [used, couponRedeemed] = await Promise.all([
    models.Vouchers.find({
      ownerType,
      ownerId,
      status: VOUCHER_STATUS.LOSS,
      'usedIn.targetId': targetId,
    }).lean(),
    models.Coupons.exists({ 'usageLogs.targetId': targetId }),
  ]);
  const campaigns = used.length
    ? await models.VoucherCampaigns.find({
        _id: { $in: [...new Set(used.map((v) => v.campaignId))] },
      }).lean()
    : [];
  const campaignById = new Map(campaigns.map((c) => [c._id, c]));

  const vouchers: IOwnerSummaryVoucher[] = used.flatMap((voucher) => {
    const campaign = campaignById.get(voucher.campaignId);

    if (!campaign) {
      return [];
    }

    const terms = voucherTerms(voucher, campaign);

    return [
      {
        _id: voucher._id,
        campaignId: campaign._id,
        title: terms.title || campaign.title,
        voucherType: terms.voucherType || '',
        kind: terms.kind,
        value: terms.value,
        expiresAt: voucherExpiresAt(voucher, campaign),
        status: VOUCHER_STATUS.LOSS,
        autoApplied: false,
        applicable: false,
      },
    ];
  });

  return {
    vouchers,
    settled: !!vouchers.length || !!couponRedeemed,
  };
};
