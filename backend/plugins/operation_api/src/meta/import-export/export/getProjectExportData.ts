import {
  GetExportData,
  IImportExportContext,
  buildExportCursorQuery,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildProjectExportRow, IProject } from './buildProjectExportRow';
import { stringifyId, buildIdNameMap, buildUserMap } from '../utils';

/**
 * Builds the project query object based on the active filters.
 */
function buildProjectQuery(filters?: Record<string, unknown>): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  if (!filters || Object.keys(filters).length === 0) {
    return query;
  }
  if (filters.name) {
    query.name = { $regex: filters.name, $options: 'i' };
  }
  if (filters.teamIds) {
    query.teamIds = { $in: Array.isArray(filters.teamIds) ? filters.teamIds : [filters.teamIds] };
  }
  if (filters.leadId) {
    query.leadId = filters.leadId;
  }
  if (filters.memberId) {
    query.$or = [
      { memberIds: { $in: [filters.memberId] } },
      { leadId: filters.memberId },
    ];
  }
  if (filters.priority !== undefined && filters.priority !== null) {
    query.priority = Number(filters.priority);
  }
  if (filters.status !== undefined && filters.status !== null) {
    query.status = Number(filters.status);
  }
  if (filters.tagIds) {
    query.tagIds = { $in: Array.isArray(filters.tagIds) ? filters.tagIds : [filters.tagIds] };
  }
  return query;
}

/**
 * Extracts unique team, user, and tag IDs from projects array.
 */
function extractProjectIds(projects: IProject[]) {
  const allTeamIds = new Set<string>();
  const allUserIds = new Set<string>();
  const allTagIds = new Set<string>();

  for (const project of projects) {
    if (Array.isArray(project.teamIds)) {
      project.teamIds.forEach((id) => allTeamIds.add(stringifyId(id)));
    }
    if (project.leadId) {
      allUserIds.add(stringifyId(project.leadId));
    }
    if (Array.isArray(project.memberIds)) {
      project.memberIds.forEach((id) => allUserIds.add(stringifyId(id)));
    }
    if (Array.isArray(project.tagIds)) {
      project.tagIds.forEach((id) => allTagIds.add(stringifyId(id)));
    }
  }

  return { allTeamIds, allUserIds, allTagIds };
}



/**
 * Retrieves and formats projects for export.
 *
 * @param data Parameters specifying limits, cursor position, selected fields, and filters.
 * @param context The import/export handler context containing models and subdomain.
 * @returns A promise resolving to an array of formatted project records.
 */
export async function getProjectExportData(
  data: GetExportData,
  { subdomain, models }: IImportExportContext<IModels>,
): Promise<Record<string, string>[]> {
  const { cursor, limit, filters, ids, selectedFields } = data;

  if (!models) {
    throw new Error('Models not available in context');
  }

  const query = buildProjectQuery(filters);

  const { query: exportQuery, isIdsMode } = buildExportCursorQuery({
    baseQuery: query,
    cursor,
    ids,
    limit,
  });

  if (isIdsMode && exportQuery._id?.$in?.length === 0) {
    return [];
  }

  const projects = await models.Project.find(exportQuery)
    .sort({ _id: 1 })
    .limit(limit)
    .lean();

  if (!projects.length) return [];

  const { allTeamIds, allUserIds, allTagIds } = extractProjectIds(
    projects as IProject[],
  );

  const [teams, members, tags] = await Promise.all([
    allTeamIds.size
      ? models.Team.find({ _id: { $in: Array.from(allTeamIds) } })
          .select('_id name')
          .lean()
      : [],
    allUserIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'users',
          action: 'find',
          input: { query: { _id: { $in: Array.from(allUserIds) } } },
          defaultValue: [],
        })
      : [],
    allTagIds.size
      ? sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'tags',
          action: 'find',
          input: { query: { _id: { $in: Array.from(allTagIds) } } },
          defaultValue: [],
        })
      : [],
  ]);

  const teamMap = buildIdNameMap(teams);
  const userMap = buildUserMap(members);
  const tagMap = buildIdNameMap(tags);

  return projects.map((p) =>
    buildProjectExportRow(p as IProject, selectedFields, {
      teamMap,
      leadMap: userMap,
      memberMap: userMap,
      tagMap,
    }),
  );
}
