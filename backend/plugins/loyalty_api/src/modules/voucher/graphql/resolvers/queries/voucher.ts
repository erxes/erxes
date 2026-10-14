import {
  IVoucher,
  IVoucherDocument,
  IVoucherParams,
} from '@/voucher/@types/voucher';
import { cursorPaginate, sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext, IModels } from '~/connectionResolvers';
import { CAMPAIGN_STATUS } from '~/constants';
import { voucherExpiresAt } from '@/voucher/services/voucherTerm';
import {
  voucherExpiresWithinSelector,
  voucherStatusSelector,
} from '@/voucher/services/voucherStatusFilter';

const generateFilter = async (models: IModels, params: IVoucherParams) => {
  let filter: FilterQuery<IVoucher> = {};

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
    filter = { ...filter, ...(await voucherStatusSelector(models, status)) };
  }

  // Ending soon, read from the same dates as expiry.
  if (params.expiresWithin) {
    filter = {
      ...filter,
      $and: [
        ...(filter.$and || []),
        await voucherExpiresWithinSelector(models, params.expiresWithin),
      ],
    };
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
// A portal user is their customer: vouchers are only ever the customer's.
const customerOfPortalUser = async (subdomain: string, ownerId: string) => {
  const cpUser = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'cpUsers',
    action: 'get',
    input: { id: ownerId },
    defaultValue: null,
  });

  return cpUser?.erxesCustomerId || ownerId;
};

const getOwnerVouchers = async (
  models: IContext['models'],
  ownerId: string,
  ownerType = 'customer',
) => {
  const ownerVouchers = await models.Vouchers.find({
    ownerId,
    ownerType,
  }).lean();

  const campaignVoucherMap = new Map<string, { voucherIds: string[] }>();

  for (const voucher of ownerVouchers) {
    if (!voucher.campaignId) continue;

    if (!campaignVoucherMap.has(voucher.campaignId)) {
      campaignVoucherMap.set(voucher.campaignId, { voucherIds: [] });
    }

    campaignVoucherMap
      .get(voucher.campaignId)!
      .voucherIds.push(voucher._id.toString());
  }

  const campaignIds = Array.from(campaignVoucherMap.keys());
  const now = new Date();

  // A voucher outlives its campaign's issuing window, so each is judged alone.
  const campaigns = await models.VoucherCampaigns.find({
    _id: { $in: campaignIds },
    status: CAMPAIGN_STATUS.ACTIVE,
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
    const voucherData = campaignVoucherMap.get(campaign._id.toString());

    if (!voucherData) continue;

    voucherData.voucherIds = voucherData.voucherIds.filter((id) => {
      const voucher = ownerVouchers.find((v) => v._id.toString() === id);
      const expiresAt = voucher && voucherExpiresAt(voucher, campaign);

      return !!voucher && (!expiresAt || expiresAt >= now);
    });

    if (!voucherData.voucherIds.length) continue;

    vouchers.push({
      campaign,
      count: voucherData.voucherIds.length,
      voucherIds: voucherData.voucherIds,
      vouchers: voucherData.voucherIds.flatMap((id) => {
        const voucher = ownerVouchers.find((v) => v._id.toString() === id);

        if (!voucher) return [];

        return [
          {
            _id: voucher._id,
            status: voucher.status,
            ownerId: voucher.ownerId,
            ownerType: voucher.ownerType,
            createdAt: voucher.createdAt,
          },
        ];
      }),
    });
  }

  return vouchers;
};
export const voucherQueries = {
  async vouchers(
    _parent: undefined,
    params: IVoucherParams,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('voucherView');
    const filter = await generateFilter(models, params);

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
    const filter = await generateFilter(models, params);

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
    { models }: IContext,
  ) {
    return getOwnerVouchers(models, params.ownerId, params.ownerType);
  },

  async cpOwnerVouchers(
    _parent: undefined,
    params: { ownerId: string; ownerType?: string },
    { models, subdomain }: IContext,
  ) {
    return getOwnerVouchers(
      models,
      await customerOfPortalUser(subdomain, params.ownerId),
    );
  },
};
(voucherQueries.cpOwnerVouchers as any).wrapperConfig = {
  skipPermission: true,
};
