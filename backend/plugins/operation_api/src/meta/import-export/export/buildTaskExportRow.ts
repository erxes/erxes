import { blockNoteToPlainText } from '../blockNoteToPlainText';
import {
  joinNames,
  formatValue,
  formatDate,
  stringifyId,
  getMapValue,
  getStatusLabel as getStatusTypeLabel,
  getPriorityLabel,
  finalizeExportRow,
} from '../utils';

type Maps = {
  teamMap: Map<string, string>;
  assigneeMap: Map<string, string>;
  statusMap: Map<string, string>;
  projectMap: Map<string, string>;
  cycleMap: Map<string, string>;
  milestoneMap: Map<string, string>;
  tagMap: Map<string, string>;
};

interface ITask {
  _id?: unknown;
  name?: unknown;
  description?: unknown;
  status?: unknown;
  statusType?: unknown;
  priority?: unknown;
  teamId?: unknown;
  assigneeId?: unknown;
  createdBy?: unknown;
  projectId?: unknown;
  cycleId?: unknown;
  milestoneId?: unknown;
  tagIds?: unknown[];
  estimatePoint?: unknown;
  number?: unknown;
  startDate?: Date | string;
  targetDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  propertiesData?: Record<string, unknown>;
}





/**
 * Helper to look up a team name from a map by ID, returning formatted team ID as fallback.
 */
const getTeamValue = (teamId: unknown, teamMap?: Map<string, string>): string => {
  if (!teamId) return '';
  return teamMap?.get(stringifyId(teamId)) || stringifyId(teamId);
};





/**
 * Builds a key-value record for exporting a task, converting all fields to display strings.
 *
 * @param task The task object to export.
 * @param selectedFields The list of field keys selected for export. If empty or undefined, all fields are exported.
 * @param maps A partial collection of ID-to-name lookup maps for teams, assignees, projects, tags, etc.
 * @returns A record containing the exported task fields.
 */
export const buildTaskExportRow = (
  task: ITask,
  selectedFields?: string[],
  maps?: Partial<Maps>,
): Record<string, string> => {
  const teamName = getTeamValue(task.teamId, maps?.teamMap);
  const assigneeName = getMapValue(task.assigneeId, maps?.assigneeMap);
  const createdByName = getMapValue(task.createdBy, maps?.assigneeMap);
  const statusName = getMapValue(task.status, maps?.statusMap);
  const statusTypeLabel = getStatusTypeLabel(task.statusType);
  const priorityLabel = getPriorityLabel(task.priority);
  const projectName = getMapValue(task.projectId, maps?.projectMap);
  const cycleName = getMapValue(task.cycleId, maps?.cycleMap);
  const milestoneName = getMapValue(task.milestoneId, maps?.milestoneMap);
  const tagNames = joinNames(task.tagIds, maps?.tagMap || new Map());

  const allFields: Record<string, string> = {
    _id: stringifyId(task._id),
    name: formatValue(task.name),
    description: blockNoteToPlainText(task.description),
    status: statusName,
    statusType: statusTypeLabel,
    priority: priorityLabel,
    teamId: teamName,
    assigneeId: assigneeName,
    createdBy: createdByName,
    projectId: projectName,
    cycleId: cycleName,
    milestoneId: milestoneName,
    tagIds: tagNames,
    estimatePoint: formatValue(task.estimatePoint),
    number: formatValue(task.number),
    startDate: formatDate(task.startDate),
    targetDate: formatDate(task.targetDate),
    createdAt: formatDate(task.createdAt),
    updatedAt: formatDate(task.updatedAt),
  };

  return finalizeExportRow(task._id, allFields, task.propertiesData, selectedFields);
};
