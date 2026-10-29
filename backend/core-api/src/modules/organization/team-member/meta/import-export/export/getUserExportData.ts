import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
  normalizeExportLimit,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { buildUserExportRow } from './buildUserExportRow';
import { escapeRegExp } from 'erxes-api-shared/utils';

export async function getUserExportData(
  data: GetExportData & {
    filters?: {
      isActive?: boolean;
      searchValue?: string;
      brandIds?: string[];
      departmentIds?: string[];
      branchIds?: string[];
      status?: string;
    };
  },
  { models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, ids, selectedFields, filters = {} } = data;

  const effectiveLimit = normalizeExportLimit(limit, 100);

  if (!models) throw new Error('Models not available in context');

  const query: any = { role: { $ne: 'system' } };

  if (typeof filters.isActive === 'boolean') query.isActive = filters.isActive;
  if (filters.brandIds?.length) query.brandIds = { $in: filters.brandIds };
  if (filters.departmentIds?.length)
    query.departmentIds = { $in: filters.departmentIds };
  if (filters.branchIds?.length) query.branchIds = { $in: filters.branchIds };
  if (filters.status === 'Verified') {
    query.registrationToken = { $eq: null };
  } else if (filters.status === 'Not verified') {
    query.registrationToken = { $ne: null };
  }

  if (filters.searchValue?.trim()) {
    const sv = escapeRegExp(filters.searchValue.trim());
    const re = new RegExp(sv, 'i');
    query.$or = [
      { email: re },
      { employeeId: re },
      { username: re },
      { 'details.fullName': re },
    ];
  }

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: query,
    cursor,
    ids,
    limit: effectiveLimit,
  });

  if (isIdsMode && exportQuery._id?.$in?.length === 0) {
    return [];
  }

  const users = await models.Users.find(exportQuery)
    .sort({ _id: 1 })
    .limit(effectiveLimit)
    .lean();

  const collect = (arr?: string[]) => (arr || []).filter(Boolean);

  const brandIds = new Set<string>();
  const departmentIds = new Set<string>();
  const branchIds = new Set<string>();

  for (const u of users) {
    collect(u.brandIds).forEach((id) => {
      brandIds.add(id);
    });
    collect(u.departmentIds).forEach((id) => {
      departmentIds.add(id);
    });
    collect(u.branchIds).forEach((id) => {
      branchIds.add(id);
    });
  }
  const [brands, departments, branches] = await Promise.all([
    brandIds.size
      ? models.Brands?.find?.({ _id: { $in: Array.from(brandIds) } })
          .select('_id name')
          .lean()
      : [],
    departmentIds.size
      ? models.Departments?.find?.({ _id: { $in: Array.from(departmentIds) } })
          ?.select('_id title')
          ?.lean()
      : [],
    branchIds.size
      ? models.Branches?.find?.({ _id: { $in: Array.from(branchIds) } })
          ?.select('_id title')
          ?.lean()
      : [],
  ]);
  const brandMap = new Map<string, string>();
  const departmentMap = new Map<string, string>();
  const branchMap = new Map<string, string>();
  (brands || []).forEach((b: any) => {
    brandMap.set(String(b._id), b.name || '');
  });
  (departments || []).forEach((d: any) => {
    departmentMap.set(String(d._id), d.title || '');
  });
  (branches || []).forEach((b: any) => {
    branchMap.set(String(b._id), b.title || '');
  });

  return users.map((u: any) =>
    buildUserExportRow(u, selectedFields, {
      brandMap,
      departmentMap,
      branchMap,
    }),
  );
}
