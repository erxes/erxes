import { GetExportData, IImportExportContext } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { generateFilter } from '~/modules/contacts/utils';
import { buildCompanyExportRow } from './buildCompanyExportRow';

export async function getCompanyExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

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
      query._id = { $in: remainingIds.slice(0, limit) };
    } else {
      query._id = query._id ? { ...query._id, $gt: cursor } : { $gt: cursor };
    }
  }

  const companies = await models.Companies.find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  // Build tag map
  const allTagIds = new Set<string>();
  for (const { tagIds = [] } of companies) {
    for (const tagId of tagIds) allTagIds.add(tagId);
  }

  const tagMap = new Map<string, string>();
  if (allTagIds.size > 0) {
    const tags = await models.Tags.find({ _id: { $in: Array.from(allTagIds) } })
      .select('_id name')
      .lean();
    for (const tag of tags) {
      tagMap.set(String(tag._id), tag.name || '');
    }
  }

  return companies.map((company) =>
    buildCompanyExportRow(company as any, selectedFields, tagMap),
  );
}
