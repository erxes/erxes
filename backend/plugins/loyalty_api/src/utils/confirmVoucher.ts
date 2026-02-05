import { VOUCHER_STATUS } from '@/voucher/constants';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

export const confirmVoucherSale = async (
  models: IModels,
  subdomain: string,
  checkInfo: {
    [productId: string]: {
      voucherId: string;
      count: number;
    };
  },
  extraInfo?: {
    couponCode?: string;
    voucherId?: string;
    ownerType?: string;
    ownerId?: string;
    targetid?: string;
    serviceName?: string;
    totalAmount?: string;
  },
) => {
  const { couponCode, voucherId, totalAmount, ...usageInfo } = extraInfo || {};

  if (extraInfo?.ownerType === 'customer' && extraInfo?.ownerId) {
    const customerRelatedClientPortalUser = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'clientPortalUsers',
      action: 'findOne',
      input: {
        erxesCustomerId: extraInfo.ownerId,
      },
      defaultValue: null,
    });

    if (customerRelatedClientPortalUser) {
      usageInfo.ownerId = customerRelatedClientPortalUser._id;
      usageInfo.ownerType = 'cpUser';
    }
  }

  if (couponCode) {
    await models.Coupons.redeemCoupon({
      code: couponCode,
      usageInfo,
    });
  }

  if (voucherId) {
    await models.Vouchers.redeemVoucher({
      voucherId,
      usageInfo,
    });
  }

  for (const productId of Object.keys(checkInfo)) {
    const rule = checkInfo[productId];

    if (!rule.voucherId) {
      continue;
    }

    if (rule.count) {
      const voucher = await models.Vouchers.findOne({
        _id: rule.voucherId,
      }).lean();
      if (!voucher) {
        continue;
      }

      const campaign = await models.VoucherCampaigns.findOne({
        _id: voucher.campaignId,
      });
      if (!campaign) {
        continue;
      }

      const oldBonusCount = (voucher.bonusInfo || []).reduce(
        (sum, i) => sum + i.usedCount,
        0,
      );

      const updateInfo: any = {
        $push: { bonusInfo: { usedCount: rule.count } },
      };
      if (campaign.bonusCount - oldBonusCount <= rule.count) {
        updateInfo.$set = { status: VOUCHER_STATUS.LOSS };
      }

      await models.Vouchers.updateOne({ _id: rule.voucherId }, updateInfo);
    }
  }
};
