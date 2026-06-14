import { blockNoteToPlainText } from '../blockNoteToPlainText';
import {
  joinNames,
  formatValue,
  formatDate,
  stringifyId,
  getMapValue,
  getStatusLabel,
  getPriorityLabel,
  finalizeExportRow,
} from '../utils';

type Maps = {
  teamMap: Map<string, string>;
  leadMap: Map<string, string>;
  memberMap: Map<string, string>;
  tagMap: Map<string, string>;
};

export interface IProject {
  _id?: unknown;
  name?: unknown;
  description?: unknown;
  status?: unknown;
  priority?: unknown;
  teamIds?: unknown[];
  leadId?: unknown;
  memberIds?: unknown[];
  tagIds?: unknown[];
  startDate?: Date | string;
  targetDate?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  propertiesData?: Record<string, unknown>;
}







/**
 * Builds a key-value record for exporting a project, converting all fields to display strings.
 *
 * @param project The project object to export.
 * @param selectedFields The list of field keys selected for export. If empty or undefined, all fields are exported.
 * @param maps A partial collection of ID-to-name lookup maps for teams, leads, members, tags, etc.
 * @returns A record containing the exported project fields.
 */
export const buildProjectExportRow = (
  project: IProject,
  selectedFields?: string[],
  maps?: Partial<Maps>,
): Record<string, string> => {
  const teamNames = joinNames(project.teamIds, maps?.teamMap || new Map());
  const leadName = getMapValue(project.leadId, maps?.leadMap);
  const memberNames = joinNames(project.memberIds, maps?.memberMap || new Map());
  const tagNames = joinNames(project.tagIds, maps?.tagMap || new Map());
  const statusLabel = getStatusLabel(project.status);
  const priorityLabel = getPriorityLabel(project.priority);

  const allFields: Record<string, string> = {
    _id: stringifyId(project._id),
    name: formatValue(project.name),
    description: blockNoteToPlainText(project.description),
    status: statusLabel,
    priority: priorityLabel,
    teamIds: teamNames,
    leadId: leadName,
    memberIds: memberNames,
    tagIds: tagNames,
    startDate: formatDate(project.startDate),
    targetDate: formatDate(project.targetDate),
    createdAt: formatDate(project.createdAt),
    updatedAt: formatDate(project.updatedAt),
  };

  return finalizeExportRow(project._id, allFields, project.propertiesData, selectedFields);
};
