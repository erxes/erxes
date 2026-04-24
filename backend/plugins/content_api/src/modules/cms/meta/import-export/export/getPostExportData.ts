import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildPostExportRow } from './buildPostExportRow';

export async function getPostExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const query: any = {};

  if (filters && Object.keys(filters).length > 0) {
    const f = filters as Record<string, any>;
    if (f.title) query.title = { $regex: f.title, $options: 'i' };
    if (f.status) query.status = f.status;
    if (f.type) query.type = f.type;
    if (f.clientPortalId) query.clientPortalId = f.clientPortalId;
    if (f.authorId) query.authorId = f.authorId;
    if (f.categoryId) query.categoryIds = { $in: [f.categoryId] };
    if (f.tagId) query.tagIds = { $in: [f.tagId] };
    if (f.featured !== undefined) query.featured = !!f.featured;
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

  const posts = await models.Posts.find(exportQuery)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const categoryIds = new Set<string>();
  const tagIds = new Set<string>();
  const userIds = new Set<string>();

  for (const p of posts as any[]) {
    (p.categoryIds || []).forEach((id: string) => categoryIds.add(id));
    (p.tagIds || []).forEach((id: string) => tagIds.add(id));
    if (p.authorId && p.authorKind === 'user') userIds.add(p.authorId);
  }

  const [categories, tags, users] = await Promise.all([
    categoryIds.size
      ? models.Categories.find({ _id: { $in: Array.from(categoryIds) } })
          .select('_id name')
          .lean()
      : [],
    tagIds.size
      ? models.PostTags.find({ _id: { $in: Array.from(tagIds) } })
          .select('_id name')
          .lean()
      : [],
    userIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: { query: { _id: { $in: Array.from(userIds) } } },
        })
      : [],
  ]);

  const categoryMap = new Map<string, string>();
  for (const c of categories as any[]) {
    categoryMap.set(String(c._id), c.name || '');
  }

  const tagMap = new Map<string, string>();
  for (const t of tags as any[]) {
    tagMap.set(String(t._id), t.name || '');
  }

  const userMap = new Map<string, string>();
  for (const u of users as any[]) {
    const name =
      u.details?.fullName ||
      `${u.details?.firstName || ''} ${u.details?.lastName || ''}`.trim() ||
      u.email ||
      '';
    userMap.set(String(u._id), name);
  }

  return posts.map((p: any) =>
    buildPostExportRow(p, selectedFields, { categoryMap, tagMap, userMap }),
  );
}
