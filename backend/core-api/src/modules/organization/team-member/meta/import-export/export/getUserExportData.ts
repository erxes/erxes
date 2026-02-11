import { GetExportData, IImportExportContext } from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { buildUserExportRow } from './buildUserExportRow';
import { escapeRegExp } from 'erxes-api-shared/utils';

export async function getUserExportData(
  data: GetExportData & {
    isActive?: boolean;
    searchValue?: string;
    brandIds?: string[];
    departmentIds?: string[];
    branchIds?: string[];
    status?: string;
  },
  { models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, ids, selectedFields } = data;

  const effectiveLimit = limit && limit > 0 ? limit : 100;

  if (!models) throw new Error('Models not available in context');

  const query: any = { role: { $ne: 'system' } }; 

  if (typeof data.isActive === 'boolean') query.isActive = data.isActive;
  if (data.brandIds?.length) query.brandIds = { $in: data.brandIds };
  if (data.departmentIds?.length) query.departmentIds = { $in: data.departmentIds };
  if (data.branchIds?.length) query.branchIds = { $in: data.branchIds };
  if (data.status === 'Verified') {
    query.registrationToken = { $eq: null };
  } else if (data.status === 'Not verified') {
    query.registrationToken = { $ne: null };
  }

  if (data.searchValue?.trim()) {
    const sv = escapeRegExp(data.searchValue.trim());
    const re = new RegExp(sv, 'i');
    query.$or = [
      { email: re },
      { employeeId: re },
      { username: re },
      { 'details.fullName': re },
    ];
  }

  if (ids?.length && !cursor) {
    query._id = { $in: ids };
  }

  if (cursor) {
    if (ids?.length) {
      const processedCount = Number.parseInt(cursor, 10) || 0;
      const remainingIds = ids.slice(processedCount);
      if (remainingIds.length === 0) return [];
      query._id = { $in: remainingIds.slice(0, effectiveLimit) };
    } else {
      query._id = query._id ? { ...query._id, $gt: cursor } : { $gt: cursor };
    }
  }

  const users = await models.Users.find(query)
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
    brandIds.size ? models.Brands?.find?.({ _id: { $in: Array.from(brandIds) } }).select('_id name').lean() : [],
    departmentIds.size ? models.Departments?.find?.({ _id: { $in: Array.from(departmentIds) } })?.select('_id title')?.lean() : [],
    branchIds.size ? models.Branches?.find?.({ _id: { $in: Array.from(branchIds) } })?.select('_id title')?.lean() : [],
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
    buildUserExportRow(
      u,
      selectedFields,
      { brandMap, departmentMap, branchMap},
    ),
  );
}
