import {
  GetExportData,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { buildCouponExportRow } from './buildCouponExportRow';

const buildExportQuery = (
  ids: string[] | undefined,
  cursor: string | undefined,
  filters: Record<string, any> | undefined,
  limit: number,
): any => {
  if (ids && ids.length > 0) {
    const processedCount = cursor ? Number.parseInt(cursor, 10) || 0 : 0;
    const remainingIds = ids.slice(processedCount);
    return { _id: { $in: remainingIds.slice(0, limit) } };
  }

  const query: any = {};
  if (filters && Object.keys(filters).length > 0) {
    if (filters.campaignId) query.campaignId = filters.campaignId;
    if (filters.status) query.status = filters.status;
    if (filters.ownerType) query.ownerType = filters.ownerType;
    if (filters.ownerId) query.ownerId = filters.ownerId;
  }
  if (cursor) query._id = { $gt: cursor };
  return query;
};

const fetchCampaignMap = async (
  models: IModels,
  coupons: any[],
): Promise<Map<string, string>> => {
  const allCampaignIds = new Set<string>();
  for (const c of coupons) {
    if (c.campaignId) allCampaignIds.add(String(c.campaignId));
  }

  const campaignMap = new Map<string, string>();
  if (allCampaignIds.size) {
    const campaigns = await models.CouponCampaigns.find({
      _id: { $in: Array.from(allCampaignIds) },
    })
      .select('_id title')
      .lean();
    campaigns.forEach((c: any) =>
      campaignMap.set(String(c._id), c.title || ''),
    );
  }
  return campaignMap;
};

export async function getCouponExportData(
  data: GetExportData,
  { models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const query = buildExportQuery(ids, cursor, filters, limit);
  const coupons = await models.Coupons.find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const campaignMap = await fetchCampaignMap(models, coupons);

  return coupons.map((c) =>
    buildCouponExportRow(c, selectedFields, { campaignMap }),
  );
}
