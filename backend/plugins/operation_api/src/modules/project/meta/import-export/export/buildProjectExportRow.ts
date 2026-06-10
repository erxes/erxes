import { IProjectDocument } from '../../../@types/project';
import { defaultProjectFieldFormatter, cleanDescription } from '../utils';


/**
 * Safely extracts a nested value from an object given a dot-notated string path.
 * 
 * @param obj - The object to traverse.
 * @param path - The dot-notated path (e.g. "metadata.title").
 * @returns The resolved value, or undefined if the path does not exist.
 */
const getDeepValue = (obj: unknown, path: string): unknown => {
  if (!obj) {
    return undefined;
  }
  if (!path.includes('.')) {
    return (obj as Record<string, unknown>)[path];
  }
  return path.split('.').reduce<unknown>((acc, key) => {
    if (typeof acc === 'object' && acc !== null) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};

/**
 * Builds a formatted export row for a project document.
 * 
 * @param project - The project document.
 * @param selectedFields - Optional list of fields to export.
 * @param maps - Optional maps for resolving status, team, lead, members, creator, and tag IDs to names.
 * @param formatter - Formatting function for values.
 * @returns Record of formatted values.
 */
export const buildProjectExportRow = (
  project: IProjectDocument,
  selectedFields?: string[],
  maps?: {
    statusMap?: Map<string, string>;
    teamMap?: Map<string, string>;
    leadMap?: Map<string, string>;
    membersMap?: Map<string, string>;
    creatorMap?: Map<string, string>;
    tagMap?: Map<string, string>;
  },
  formatter = defaultProjectFieldFormatter,
): Record<string, string> => {
  const formatValue = formatter || defaultProjectFieldFormatter;

  const {
    statusMap,
    teamMap,
    leadMap,
    membersMap,
    creatorMap,
    tagMap,
  } = maps || {};

  /** Resolves team IDs to a comma-separated list of names. */
  const formatTeams = (teamIds?: string[]): string => {
    if (!teamIds || !teamIds.length) {
      return '';
    }
    return teamIds.map(id => teamMap?.get(String(id)) || String(id)).join(', ');
  };

  /** Resolves member IDs to a comma-separated list of names. */
  const formatMembers = (memberIds?: string[]): string => {
    if (!memberIds || !memberIds.length) {
      return '';
    }
    return memberIds.map(id => membersMap?.get(String(id)) || String(id)).join(', ');
  };

  /** Resolves tag IDs to a comma-separated list of names. */
  const formatTags = (tagIds?: string[]): string => {
    if (!tagIds || !tagIds.length) {
      return '';
    }
    return tagIds.map(id => tagMap?.get(String(id)) || String(id)).join(', ');
  };

  const allFields: Record<string, string> = {
    _id: formatValue(project._id),
    name: formatValue(project.name),
    description: formatValue(cleanDescription(project.description)),
    status: formatValue(statusMap?.get(String(project.status)) || project.status),
    priority: formatValue(project.priority),
    teams: formatValue(formatTeams(project.teamIds)),
    tags: formatValue(formatTags(project.tagIds)),
    startDate: formatValue(project.startDate ? new Date(project.startDate) : ''),
    targetDate: formatValue(project.targetDate ? new Date(project.targetDate) : ''),
    lead: formatValue(leadMap?.get(String(project.leadId)) || project.leadId),
    members: formatValue(formatMembers(project.memberIds)),
    createdBy: formatValue(creatorMap?.get(String(project.createdBy)) || project.createdBy),
    createdAt: formatValue(project.createdAt ? new Date(project.createdAt) : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, string> = { _id: String(project._id || '') };

    for (const key of selectedFields) {
      if (key === 'description') {
        result[key] = formatValue(cleanDescription(project.description));
      } else if (key === 'status') {
        result[key] = formatValue(statusMap?.get(String(project.status)) || project.status);
      } else if (key === 'teams') {
        result[key] = formatValue(formatTeams(project.teamIds));
      } else if (key === 'tags') {
        result[key] = formatValue(formatTags(project.tagIds));
      } else if (key === 'lead') {
        result[key] = formatValue(leadMap?.get(String(project.leadId)) || project.leadId);
      } else if (key === 'members') {
        result[key] = formatValue(formatMembers(project.memberIds));
      } else if (key === 'createdBy') {
        result[key] = formatValue(creatorMap?.get(String(project.createdBy)) || project.createdBy);
      } else {
        result[key] = formatValue(getDeepValue(project, key));
      }
    }

    return result;
  }

  return allFields;
};
