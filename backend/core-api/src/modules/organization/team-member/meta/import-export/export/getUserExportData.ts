import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
  normalizeExportLimit,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { buildUserExportRow } from './buildUserExportRow';
import { escapeRegExp } from 'erxes-api-shared/utils';
import { activeMembershipFilter } from '@/organization/structure/utils';
import { getStructureMemberIds } from '../../../utils';

const getStructureEntityTitles = async (models: IModels, userIds: string[]) => {
  const memberships = await models.StructureEntityMembers.find(
    { userId: { $in: userIds }, ...activeMembershipFilter() },
    { userId: 1, entityId: 1 },
  )
    .sort({ isPrimary: -1, startsAt: 1 })
    .lean();

  const entities = await models.StructureEntities.find(
    { _id: { $in: memberships.map((membership) => membership.entityId) } },
    { title: 1 },
  ).lean();

  const titles = new Map<string, string[]>();

  for (const membership of memberships) {
    const entity = entities.find((item) => item._id === membership.entityId);

    if (entity) {
      titles.set(membership.userId, [
        ...(titles.get(membership.userId) || []),
        entity.title,
      ]);
    }
  }

  return titles;
};

export async function getUserExportData(
  data: GetExportData & {
    isActive?: boolean;
    searchValue?: string;
    brandIds?: string[];
    entityIds?: string[];
    status?: string;
  },
  { models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, ids, selectedFields } = data;

  const effectiveLimit = normalizeExportLimit(limit, 100);

  if (!models) throw new Error('Models not available in context');

  const query: any = { role: { $ne: 'system' } };

  if (typeof data.isActive === 'boolean') query.isActive = data.isActive;
  if (data.brandIds?.length) query.brandIds = { $in: data.brandIds };
  if (data.entityIds?.length)
    query._id = { $in: await getStructureMemberIds(models, data.entityIds) };
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

  for (const u of users) {
    collect(u.brandIds).forEach((id) => {
      brandIds.add(id);
    });
  }
  const [brands, structureEntityMap] = await Promise.all([
    brandIds.size
      ? models.Brands?.find?.({ _id: { $in: Array.from(brandIds) } })
          .select('_id name')
          .lean()
      : [],
    getStructureEntityTitles(
      models,
      users.map((u) => u._id),
    ),
  ]);
  const brandMap = new Map<string, string>();
  (brands || []).forEach((b: any) => {
    brandMap.set(String(b._id), b.name || '');
  });

  return users.map((u: any) =>
    buildUserExportRow(u, selectedFields, {
      brandMap,
      structureEntityMap,
    }),
  );
}
