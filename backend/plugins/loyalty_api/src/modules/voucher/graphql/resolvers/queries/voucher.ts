import {
  IVoucher,
  IVoucherDocument,
  IVoucherParams,
} from '@/voucher/@types/voucher';
import { cursorPaginate, sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';

const generateFilter = (params: IVoucherParams) => {
  const filter: FilterQuery<IVoucher> = {};

  const { campaignId, ownerId, ownerType, status, fromDate, toDate } =
    params || {};

  if (campaignId) {
    filter.campaignId = campaignId;
  }

  if (ownerId) {
    filter.ownerId = ownerId;
  }

  if (ownerType) {
    filter.ownerType = ownerType;
  }

  if (status) {
    filter.status = status;
  }

  if (fromDate || toDate) {
    filter.createdAt = {};

    if (fromDate) {
      filter.createdAt.$gte = new Date(fromDate);
    }

    if (toDate) {
      filter.createdAt.$lte = new Date(toDate);
    }
  }

  return filter;
};

export const voucherQueries = {
  async vouchers(
    _parent: undefined,
    params: IVoucherParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('voucherView');
    const filter = generateFilter(params);

    return await cursorPaginate<IVoucherDocument>({
      model: models.Vouchers,
      params,
      query: filter,
    });
  },

  async vouchersMain(
    _parent: undefined,
    params: IVoucherParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('voucherView');
    const {
      page = 1,
      perPage = 20,
      sortField = 'createdAt',
      sortDirection = -1,
    } = params;
    const filter = generateFilter(params);

    const totalCount = await models.Vouchers.countDocuments(filter);
    const list = await models.Vouchers.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return { list, totalCount };
  },

  async ownerVouchers(
    _parent: undefined,
    params: { ownerId: string; ownerType?: string },
    { models, subdomain }: IContext,
  ) {
    let { ownerId, ownerType } = params || {};

    if (!ownerType || ownerType === 'customer') {
      const cpUserById = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'cpUsers',
        action: 'get',
        input: { id: ownerId },
        defaultValue: null,
      });
      const cpUser =
        cpUserById ||
        (await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'cpUsers',
          action: 'get',
          input: { erxesCustomerId: ownerId },
          defaultValue: null,
        }));

      if (cpUser) {
        ownerId = cpUser._id;
        ownerType = 'cpUser';
      }
    }

    const ownerVouchers = await models.Vouchers.find({
      ownerId,
      ...(ownerType && { ownerType }),
    }).lean();

    const campaignVoucherMap = new Map<string, { voucherIds: string[] }>();

    for (const voucher of ownerVouchers) {
      const { _id, campaignId } = voucher;

      if (!campaignId) continue;

      if (!campaignVoucherMap.has(campaignId)) {
        campaignVoucherMap.set(campaignId, { voucherIds: [] });
      }

      campaignVoucherMap.get(campaignId)!.voucherIds.push(_id.toString());
    }

    const campaignIds = Array.from(campaignVoucherMap.keys());

    const campaigns = await models.VoucherCampaigns.find({
      _id: { $in: campaignIds },
      status: CAMPAIGN_STATUS.ACTIVE,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    }).lean();

    const vouchers: Array<{
      campaign: (typeof campaigns)[number];
      count: number;
      voucherIds: string[];
      vouchers: Array<{
        _id: string;
        status?: string;
        ownerId?: string;
        ownerType?: string;
        createdAt?: Date;
      }>;
    }> = [];

    for (const campaign of campaigns) {
      const { _id } = campaign;

      const campaignId = _id.toString();
      const voucherData = campaignVoucherMap.get(campaignId);

      if (voucherData) {
        vouchers.push({
          campaign,
          count: voucherData.voucherIds.length,
          voucherIds: voucherData.voucherIds,
          vouchers: voucherData.voucherIds.flatMap((id) => {
              const voucher = ownerVouchers.find(
                (ownerVoucher) => ownerVoucher._id.toString() === id,
              );

              if (!voucher) return [];

              return [{
                _id: voucher._id,
                status: voucher.status,
                ownerId: voucher.ownerId,
                ownerType: voucher.ownerType,
                createdAt: voucher.createdAt,
              }];
            }),
        });
      }
    }

    return vouchers;
  },
};