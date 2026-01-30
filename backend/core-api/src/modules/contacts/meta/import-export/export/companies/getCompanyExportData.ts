import { GetExportData, IImportExportContext } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { generateFilter } from '~/modules/contacts/utils';
import { buildCompanyExportRow } from './buildCompanyExportRow';

export async function getCompanyExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;
  const effectiveLimit = limit && limit > 0 ? limit : 100;

  if (!models) {
    throw new Error('Models not available in context');
  }

  let query: any = {};

  if (filters && Object.keys(filters).length > 0) {
    query = await generateFilter(subdomain, filters, models);
  }

  if (ids && ids.length > 0 && !cursor) {
    query._id = { $in: ids };
  }

  if (cursor) {
    if (ids && ids.length > 0) {
      const processedCount = Number.parseInt(cursor, 10) || 0;
      const remainingIds = ids.slice(processedCount);
      if (remainingIds.length === 0) return [];
      query._id = { $in: remainingIds.slice(0, effectiveLimit) };
    } else {
      query._id = query._id ? { ...query._id, $gt: cursor } : { $gt: cursor };
    }
  }

  const companies = await models.Companies.find(query)
    .sort({ _id: 1 })
    .limit(effectiveLimit)
    .lean();

  const allTagIds = new Set<string>();
  const allOwnerIds = new Set<string>();
  const allParentCompanyIds = new Set<string>();

  for (const c of companies) {
    (c.tagIds || []).forEach((id: string) => allTagIds.add(id));
    if (c.ownerId) allOwnerIds.add(c.ownerId);
    if (c.parentCompanyId) allParentCompanyIds.add(c.parentCompanyId);
  }

  const tagMap = new Map<string, string>();
  if (allTagIds.size > 0) {
    const tags = await models.Tags.find({ _id: { $in: Array.from(allTagIds) } })
      .select('_id name')
      .lean();

    for (const t of tags) {
      tagMap.set(String(t._id), t.name || '');
    }
  }

  const ownerMap = new Map<string, string>();
  if (allOwnerIds.size > 0 && (models as any).Users) {
    const users = await (models as any).Users.find({ _id: { $in: Array.from(allOwnerIds) } })
      .select('_id firstName lastName email username')
      .lean();

    for (const u of users) {
      const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ');
      ownerMap.set(String(u._id), fullName || u.email || u.username || '');
    }
  }

  const parentCompanyMap = new Map<string, string>();
  if (allParentCompanyIds.size > 0) {
    const parents = await models.Companies.find({ _id: { $in: Array.from(allParentCompanyIds) } })
      .select('_id primaryName')
      .lean();

    for (const p of parents) {
      parentCompanyMap.set(String(p._id), p.primaryName || '');
    }
  }

  return companies.map((company) =>
    buildCompanyExportRow(company as any, selectedFields, {
      tagMap,
      ownerMap,
      parentCompanyMap,
    }),
  );
}
