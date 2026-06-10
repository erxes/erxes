import { ITaskDocument } from '../../../@types/task';
import { defaultTaskFieldFormatter, cleanDescription } from '../utils';


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
 * Builds a formatted export row for a task document.
 * 
 * @param task - The task document.
 * @param selectedFields - Optional list of fields to export.
 * @param maps - Optional maps for resolving status, project, cycle, milestone, assignee, creator, team, tag, and label IDs to names.
 * @param formatter - Formatting function for values.
 * @returns Record of formatted values.
 */
export const buildTaskExportRow = (
  task: ITaskDocument & { number?: number },
  selectedFields?: string[],
  maps?: {
    statusMap?: Map<string, string>;
    projectMap?: Map<string, string>;
    cycleMap?: Map<string, string>;
    milestoneMap?: Map<string, string>;
    assigneeMap?: Map<string, string>;
    creatorMap?: Map<string, string>;
    teamMap?: Map<string, string>;
    tagMap?: Map<string, string>;
    labelMap?: Map<string, string>;
  },
  formatter = defaultTaskFieldFormatter,
): Record<string, string> => {
  const formatValue = formatter || defaultTaskFieldFormatter;

  const {
    statusMap,
    projectMap,
    cycleMap,
    milestoneMap,
    assigneeMap,
    creatorMap,
    teamMap,
    tagMap,
    labelMap,
  } = maps || {};

  /** Resolves tag IDs to a comma-separated list of names. */
  const formatTags = (tagIds?: string[]): string => {
    if (!tagIds || !tagIds.length) {
      return '';
    }
    return tagIds.map((id) => tagMap?.get(String(id)) || String(id)).join(', ');
  };

  /** Resolves label IDs to a comma-separated list of names. */
  const formatLabels = (labelIds?: string[]): string => {
    if (!labelIds || !labelIds.length) {
      return '';
    }
    return labelIds.map((id) => labelMap?.get(String(id)) || String(id)).join(', ');
  };

  const allFields: Record<string, string> = {
    _id: formatValue(task._id),
    name: formatValue(task.name),
    description: formatValue(cleanDescription(task.description)),

    status: formatValue(statusMap?.get(String(task.status)) || task.status),
    team: formatValue(teamMap?.get(String(task.teamId)) || task.teamId),
    priority: formatValue(task.priority),
    labels: formatValue(formatLabels(task.labelIds)),
    tags: formatValue(formatTags(task.tagIds)),
    assignee: formatValue(assigneeMap?.get(String(task.assigneeId)) || task.assigneeId),
    createdBy: formatValue(creatorMap?.get(String(task.createdBy)) || task.createdBy),

    startDate: formatValue(task.startDate ? new Date(task.startDate) : ''),
    targetDate: formatValue(task.targetDate ? new Date(task.targetDate) : ''),

    cycle: formatValue(cycleMap?.get(String(task.cycleId)) || task.cycleId),
    project: formatValue(projectMap?.get(String(task.projectId)) || task.projectId),
    milestone: formatValue(milestoneMap?.get(String(task.milestoneId)) || task.milestoneId),

    estimatePoint: formatValue(task.estimatePoint),
    statusChangedDate: formatValue(task.statusChangedDate ? new Date(task.statusChangedDate) : ''),
    number: formatValue(task.number),
    statusType: formatValue(task.statusType),
    createdAt: formatValue(task.createdAt ? new Date(task.createdAt) : ''),
  };

  if (selectedFields?.length) {
    const result: Record<string, string> = { _id: String(task._id || '') };

    for (const key of selectedFields) {
      if (key in allFields) {
        result[key] = allFields[key];
      } else {
        result[key] = formatValue(getDeepValue(task, key));
      }
    }

    return result;
  }

  return allFields;
};
