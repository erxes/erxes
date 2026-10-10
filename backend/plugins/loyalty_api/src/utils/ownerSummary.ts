import { resolveAccountBalances } from '@/score/services/accountBalances';
import { TLoyaltyAccountOwnerType } from '@/score/@types/account';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

// Bonus and discount vouchers apply to a sale by themselves; reward ones are picked.
const AUTO_VOUCHER_TYPES = ['bonus', 'discount'];
const SALE_VOUCHER_TYPES = [...AUTO_VOUCHER_TYPES, 'reward'];

export interface IOwnerSummaryVoucher {
  _id: string;
  campaignId: string;
  title: string;
  voucherType: string;
  kind?: string;
  value?: number;
  expiresAt?: Date;
  autoApplied: boolean;
  applicable: boolean;
  reason?: string;
}

// A customer's vouchers may sit on their client portal user.
const voucherOwners = async (
  subdomain: string,
  ownerType: TLoyaltyAccountOwnerType,
  ownerId: string,
) => {
  const owners = [{ ownerType: ownerType as string, ownerId }];

  if (ownerType !== 'customer') {
    return owners;
  }

  const cpUser = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'cpUsers',
    action: 'get',
    input: { erxesCustomerId: ownerId },
    defaultValue: null,
  });

  return cpUser?._id
    ? [...owners, { ownerType: 'cpUser', ownerId: cpUser._id }]
    : owners;
};

const saleVouchers = async (
  models: IModels,
  subdomain: string,
  ownerType: TLoyaltyAccountOwnerType,
  ownerId: string,
  totalAmount?: number,
): Promise<IOwnerSummaryVoucher[]> => {
  const owners = await voucherOwners(subdomain, ownerType, ownerId);
  const vouchers = await models.Vouchers.find({
    $or: owners,
    status: 'new',
  }).lean();

  if (!vouchers.length) {
    return [];
  }

  const now = new Date();
  const campaigns = await models.VoucherCampaigns.find({
    _id: { $in: [...new Set(vouchers.map((v) => v.campaignId))] },
    voucherType: { $in: SALE_VOUCHER_TYPES },
    status: 'active',
  }).lean();
  const campaignById = new Map(campaigns.map((c) => [c._id, c]));

  const result: IOwnerSummaryVoucher[] = [];

  for (const voucher of vouchers) {
    const campaign = campaignById.get(voucher.campaignId);

    if (!campaign) {
      continue;
    }

    const expiresAt =
      voucher.config?.endDate || campaign.finishDateOfUse || campaign.endDate;

    if (expiresAt && new Date(expiresAt) < now) {
      continue;
    }

    const autoApplied = AUTO_VOUCHER_TYPES.includes(campaign.voucherType);
    let reason: string | undefined;

    // Reward vouchers go through the same check the sale itself runs.
    if (!autoApplied) {
      try {
        await models.Vouchers.checkVoucher({
          voucherId: voucher._id,
          ownerType: voucher.ownerType,
          ownerId: voucher.ownerId,
          totalAmount,
        });
      } catch (e) {
        reason = e instanceof Error ? e.message : String(e);
      }
    }

    result.push({
      _id: voucher._id,
      campaignId: campaign._id,
      title: campaign.title,
      voucherType: campaign.voucherType,
      kind: campaign.kind,
      value: campaign.value,
      expiresAt,
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
  subdomain: string,
  {
    ownerType,
    ownerId,
    totalAmount,
  }: {
    ownerType: TLoyaltyAccountOwnerType;
    ownerId: string;
    totalAmount?: number;
  },
) => {
  const account = await models.LoyaltyAccounts.getOwnerAccount({
    ownerType,
    ownerId,
  });

  const noBalances: Awaited<ReturnType<typeof resolveAccountBalances>> = [];
  const [balances, vouchers] = await Promise.all([
    account ? resolveAccountBalances(models, account) : noBalances,
    saleVouchers(models, subdomain, ownerType, ownerId, totalAmount),
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
