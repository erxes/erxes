import {
  GetExportData,
  IImportExportContext,
} from 'erxes-api-shared/core-modules';
import { buildExportCursorQuery } from 'erxes-api-shared/core-modules/import-export/utils/exportCursor';
import { IModels } from '~/connectionResolvers';
import { generateFilter } from '~/modules/contacts/utils';
import { buildCustomerExportRow } from './buildCustomerExportRow';

export async function getCustomerExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  let query: any = {};

  if (filters && Object.keys(filters).length > 0) {
    query = await generateFilter(subdomain, filters, models);
  }

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: query,
    cursor,
    ids,
    limit,
  });

  if (isIdsMode && exportQuery._id?.$in?.length === 0) {
    return [];
  }

  const customers = await models.Customers.find(exportQuery)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const allTagIds = new Set<string>();
  for (const { tagIds = [] } of customers) {
    for (const tagId of tagIds) {
      allTagIds.add(tagId);
    }
  }

  const tagMap = new Map<string, string>();
  if (allTagIds.size > 0) {
    const tags = await models.Tags.find({
      _id: { $in: Array.from(allTagIds) },
    })
      .select('_id name')
      .lean();
    for (const tag of tags) {
      tagMap.set(String(tag._id), tag.name || '');
    }
  }

  const selectedFields = data.selectedFields;
  return customers.map((customer) =>
    buildCustomerExportRow(customer, selectedFields, tagMap),
  );
}
