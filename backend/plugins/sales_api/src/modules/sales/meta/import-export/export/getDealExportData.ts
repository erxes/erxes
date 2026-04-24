import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildDealExportRow } from './buildDealExportRow';

export async function getDealExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, any>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const query: any = {};

  if (filters && Object.keys(filters).length > 0) {
    if ((filters as any).name) {
      query.name = { $regex: (filters as any).name, $options: 'i' };
    }
    if ((filters as any).stageId) query.stageId = (filters as any).stageId;
    if ((filters as any).status) query.status = (filters as any).status;
    if ((filters as any).priority) query.priority = (filters as any).priority;
    if ((filters as any).assignedUserId) {
      query.assignedUserIds = { $in: [(filters as any).assignedUserId] };
    }

    // Pipeline filter → resolve stageIds
    if ((filters as any).pipelineId) {
      const stages = await models.Stages.find({
        pipelineId: (filters as any).pipelineId,
      })
        .select('_id')
        .lean();
      query.stageId = { $in: stages.map((s) => s._id) };
    }
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

  const deals = await models.Deals.find(exportQuery)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  const stageIds = new Set<string>();
  const userIds = new Set<string>();
  const tagIds = new Set<string>();
  const labelIds = new Set<string>();

  for (const d of deals) {
    if (d.stageId) stageIds.add(d.stageId);
    (d.assignedUserIds || []).forEach((id: string) => userIds.add(id));
    (d.tagIds || []).forEach((id: string) => tagIds.add(id));
    (d.labelIds || []).forEach((id: string) => labelIds.add(id));
  }

  const stages = stageIds.size
    ? await models.Stages.find({ _id: { $in: Array.from(stageIds) } })
        .select('_id name pipelineId')
        .lean()
    : [];

  const pipelineIds = new Set<string>();
  stages.forEach((s: any) => s.pipelineId && pipelineIds.add(s.pipelineId));

  const pipelines = pipelineIds.size
    ? await models.Pipelines.find({ _id: { $in: Array.from(pipelineIds) } })
        .select('_id name')
        .lean()
    : [];

  const labels = labelIds.size
    ? await models.PipelineLabels.find({ _id: { $in: Array.from(labelIds) } })
        .select('_id name')
        .lean()
    : [];

  const [users, tags] = await Promise.all([
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
    tagIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'tags',
          action: 'find',
          input: { query: { _id: { $in: Array.from(tagIds) } } },
        })
      : [],
  ]);

  const stageMap = new Map<string, string>();
  const stagePipelineMap = new Map<string, string>();
  for (const s of stages as any[]) {
    stageMap.set(String(s._id), s.name || '');
    if (s.pipelineId) stagePipelineMap.set(String(s._id), s.pipelineId);
  }

  const pipelineMap = new Map<string, string>();
  for (const p of pipelines as any[]) {
    pipelineMap.set(String(p._id), p.name || '');
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

  const tagMap = new Map<string, string>();
  for (const t of tags as any[]) {
    tagMap.set(String(t._id), t.name || '');
  }

  const labelMap = new Map<string, string>();
  for (const l of labels as any[]) {
    labelMap.set(String(l._id), l.name || '');
  }

  return deals.map((d: any) => {
    // Attach resolved pipelineId for the row builder
    d._pipelineId = d.stageId ? stagePipelineMap.get(String(d.stageId)) : '';
    return buildDealExportRow(d, selectedFields, {
      stageMap,
      pipelineMap,
      userMap,
      tagMap,
      labelMap,
    });
  });
}
