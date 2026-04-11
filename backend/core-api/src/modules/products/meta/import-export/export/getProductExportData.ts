import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { generateFilter } from '~/modules/contacts/utils';
import { buildProductExportRow } from './buildProductExportRow';

export async function getProductExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  let query: any = {};

  if (
    (!ids || ids.length === 0) &&
    filters &&
    Object.keys(filters).length > 0
  ) {
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

  const products = await models.Products.find(exportQuery)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const allTagIds = new Set<string>();
  const allCategoryIds = new Set<string>();
  const allVendorIds = new Set<string>();

  for (const p of products) {
    (p.tagIds || []).forEach((t: string) => allTagIds.add(t));
    if (p.categoryId) allCategoryIds.add(p.categoryId);
    if (p.vendorId) allVendorIds.add(p.vendorId);
  }

  const tagMap = new Map<string, string>();
  if (allTagIds.size) {
    const tags = await models.Tags.find({ _id: { $in: Array.from(allTagIds) } })
      .select('_id name')
      .lean();
    tags.forEach((t) => tagMap.set(String(t._id), t.name || ''));
  }

  const categoryMap = new Map<string, string>();
  if (allCategoryIds.size) {
    const cats = await models.ProductCategories.find({
      _id: { $in: Array.from(allCategoryIds) },
    })
      .select('_id name')
      .lean();
    cats.forEach((c) => categoryMap.set(String(c._id), c.name || ''));
  }

  const vendorMap = new Map<string, string>();
  if (allVendorIds.size) {
    const vendors = await models.Companies.find({
      _id: { $in: Array.from(allVendorIds) },
    })
      .select('_id primaryName')
      .lean();
    vendors.forEach((v) => vendorMap.set(String(v._id), v.primaryName || ''));
  }

  const brandMap = new Map<string, string>();
  const brandsModel = (models as any).Brands;
  if (brandsModel) {
    const allBrandIds = new Set<string>();
    for (const p of products) {
      (p.scopeBrandIds || []).forEach((b: string) => allBrandIds.add(b));
    }

    if (allBrandIds.size) {
      const brands = await brandsModel
        .find({ _id: { $in: Array.from(allBrandIds) } })
        .select('_id name')
        .lean();

      brands.forEach((b: any) => brandMap.set(String(b._id), b.name || ''));
    }
  }

  return products.map((p) =>
    buildProductExportRow(p as any, selectedFields, {
      tagMap,
      categoryMap,
      vendorMap,
      brandMap,
    }),
  );
}
