import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getTeamEstimateChoises } from '~/modules/team/utils';
import { ITask, ITaskImportRow } from '../../../@types/task';
import { ITeam } from '~/modules/team/@types/team';
import { randomBytes } from 'crypto';

/**
 * Safely parses and converts a raw value to a string array.
 * Delimited string values (by comma or semicolon) will be split.
 * 
 * @param val - The raw value to parse.
 * @returns An array of string tokens.
 */
const toArray = (val: unknown): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    return val
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [String(val).trim()];
};

/**
 * Resolves the team document by name or ID.
 */
async function resolveImportTeam(
  models: IModels,
  row: ITaskImportRow,
  errors: string[],
): Promise<(ITeam & { _id: string }) | null> {
  const teamValue = row.team || row.Team || '';
  if (!teamValue) {
    errors.push('Team is required');
    return null;
  }
  const teamQuery: Record<string, unknown> = {};
  if (typeof teamValue === 'string' && teamValue.match(/^[0-9a-fA-F]{24}$/)) {
    teamQuery._id = teamValue;
  } else {
    teamQuery.name = teamValue;
  }
  const team = (await models.Team.findOne(teamQuery).lean()) as (ITeam & { _id: string }) | null;
  if (!team) {
    errors.push(`Team not found: "${teamValue}"`);
  }
  return team;
}

/**
 * Resolves the project ID for the task.
 */
async function resolveImportProject(
  models: IModels,
  row: ITaskImportRow,
  team: (ITeam & { _id: string }) | null,
  errors: string[],
): Promise<string | undefined> {
  const projectValue = row.project || row.Project || '';
  if (!projectValue) {
    return undefined;
  }
  const projectQuery: Record<string, unknown> = {};
  if (typeof projectValue === 'string' && projectValue.match(/^[0-9a-fA-F]{24}$/)) {
    projectQuery._id = projectValue;
  } else {
    projectQuery.name = projectValue;
  }
  const project = await models.Project.findOne(projectQuery).lean();
  if (!project) {
    errors.push(`Project not found: "${projectValue}"`);
    return undefined;
  }
  if (team && project.teamIds && !project.teamIds.map(String).includes(String(team._id))) {
    errors.push(`Team "${team.name}" is not associated with Project "${project.name}"`);
  }
  return String(project._id);
}

/**
 * Resolves the status ID for the task, falling back to the team's default backlog status if none is specified.
 */
async function resolveImportStatus(
  models: IModels,
  row: ITaskImportRow,
  team: (ITeam & { _id: string }) | null,
  errors: string[],
): Promise<string | undefined> {
  if (!team) {
    return undefined;
  }
  const statusValue = row.status || row.Status || '';
  let statusId: string | undefined;
  if (statusValue) {
    const statusQuery: Record<string, unknown> = { teamId: team._id };
    if (typeof statusValue === 'string' && statusValue.match(/^[0-9a-fA-F]{24}$/)) {
      statusQuery._id = statusValue;
    } else {
      statusQuery.name = statusValue;
    }
    const statusDoc = await models.Status.findOne(statusQuery).lean();
    if (statusDoc) {
      statusId = String(statusDoc._id);
    } else {
      errors.push(`Status not found: "${statusValue}" for Team "${team.name}"`);
    }
  }

  if (!statusId) {
    // Find default backlog status of the team
    const defaultStatus = await models.Status.findOne({
      teamId: team._id,
    }).sort({ order: 1 }).lean();
    if (!defaultStatus) {
      errors.push(`No statuses configured for Team "${team.name}"`);
    } else {
      statusId = String(defaultStatus._id);
    }
  }
  return statusId;
}

/**
 * Resolves the assignee ID for the task using the core users service.
 */
async function resolveImportAssignee(
  subdomain: string,
  row: ITaskImportRow,
  errors: string[],
): Promise<string | undefined> {
  const assigneeValue = row.assignee || row.Assignee || '';
  if (!assigneeValue) {
    return undefined;
  }
  const userOrFilters: Record<string, unknown>[] = [
    { email: assigneeValue },
    { username: assigneeValue },
    { 'details.fullName': assigneeValue },
  ];
  if (typeof assigneeValue === 'string' && assigneeValue.match(/^[0-9a-fA-F]{24}$/)) {
    userOrFilters.push({ _id: assigneeValue });
  }

  try {
    const user: unknown = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'users',
      action: 'findOne',
      input: {
        query: {
          $or: userOrFilters,
        },
      },
    });

    if (user && typeof user === 'object' && '_id' in user) {
      return String((user as { _id: unknown })._id);
    } else {
      errors.push(`Assignee not found: "${assigneeValue}"`);
    }
  } catch (err) {
    errors.push(
      `Failed to resolve assignee "${assigneeValue}": ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
  return undefined;
}

/**
 * Resolves the cycle ID for the task.
 */
async function resolveImportCycle(
  models: IModels,
  row: ITaskImportRow,
  team: (ITeam & { _id: string }) | null,
  errors: string[],
): Promise<string | undefined> {
  const cycleValue = row.cycle || row.Cycle || '';
  if (cycleValue && team) {
    const cycleQuery: Record<string, unknown> = { teamId: team._id };
    if (typeof cycleValue === 'string' && cycleValue.match(/^[0-9a-fA-F]{24}$/)) {
      cycleQuery._id = cycleValue;
    } else {
      cycleQuery.name = cycleValue;
    }
    const cycle = await models.Cycle.findOne(cycleQuery).lean();
    if (cycle) {
      return String(cycle._id);
    } else {
      errors.push(`Cycle not found: "${cycleValue}" for Team "${team.name}"`);
    }
  }
  return undefined;
}

/**
 * Resolves the milestone ID for the task.
 */
async function resolveImportMilestone(
  models: IModels,
  row: ITaskImportRow,
  errors: string[],
): Promise<string | undefined> {
  const milestoneValue = row.milestone || row.Milestone || '';
  if (milestoneValue) {
    const milestoneQuery: Record<string, unknown> = {};
    if (typeof milestoneValue === 'string' && milestoneValue.match(/^[0-9a-fA-F]{24}$/)) {
      milestoneQuery._id = milestoneValue;
    } else {
      milestoneQuery.name = milestoneValue;
    }
    const milestone = await models.Milestone.findOne(milestoneQuery).lean();
    if (milestone) {
      return String(milestone._id);
    } else {
      errors.push(`Milestone not found: "${milestoneValue}"`);
    }
  }
  return undefined;
}

/**
 * Resolves the priority level from number or text name.
 */
function resolveImportPriority(
  row: ITaskImportRow,
  errors: string[],
): number {
  let priority = 0;
  const priorityValue = row.priority || row.Priority || '';
  if (priorityValue !== undefined && priorityValue !== null && priorityValue !== '') {
    const num = Number(priorityValue);
    if (!isNaN(num)) {
      if (num < 0 || num > 3 || !Number.isInteger(num)) {
        errors.push(`Priority must be between 0 and 3 (0: Minor, 1: Medium, 2: High, 3: Critical)`);
      } else {
        priority = num;
      }
    } else {
      const lowerPriority = String(priorityValue).toLowerCase().trim();
      if (lowerPriority === 'minor') priority = 0;
      else if (lowerPriority === 'medium') priority = 1;
      else if (lowerPriority === 'high') priority = 2;
      else if (lowerPriority === 'critical') priority = 3;
      else {
        errors.push(`Invalid priority: "${priorityValue}". Must be Minor, Medium, High, Critical or a number 0-3.`);
      }
    }
  }
  return priority;
}

/**
 * Resolves the estimate points based on team configuration.
 */
async function resolveImportEstimatePoint(
  team: (ITeam & { _id: string }) | null,
  row: ITaskImportRow,
  errors: string[],
): Promise<number> {
  let estimatePoint = 0;
  const estimatePointValue = row.estimatePoint || row['Estimate Point'] || '';
  if (estimatePointValue !== undefined && estimatePointValue !== null && estimatePointValue !== '') {
    const inputStr = String(estimatePointValue).trim().toLowerCase();
    if (team) {
      const estimateChoices = await getTeamEstimateChoises(team.estimateType);
      if (!estimateChoices) {
        if (inputStr !== '0' && inputStr !== 'no estimate' && inputStr !== 'no estimate points' && inputStr !== 'no estimate point') {
          errors.push(`Estimate points are not enabled for Team "${team.name}"`);
        } else {
          estimatePoint = 0;
        }
      } else {
        const num = Number(inputStr);
        const foundChoice = estimateChoices.find((c) => {
          if (!isNaN(num) && c.value === num) {
            return true;
          }
          const labelLower = c.label.toLowerCase();
          if (labelLower === inputStr) {
            return true;
          }
          const cleanLabel = labelLower.replace(/\s+/g, '').replace(/s$/, '');
          const cleanInput = inputStr.replace(/\s+/g, '').replace(/s$/, '');
          if (cleanLabel === cleanInput) {
            return true;
          }
          return false;
        });

        if (foundChoice) {
          estimatePoint = foundChoice.value;
        } else {
          const allowedStr = estimateChoices.map((c) => `${c.value} (${c.label})`).join(', ');
          errors.push(`Invalid estimate point: "${estimatePointValue}". Allowed values for Team "${team.name}" are: ${allowedStr}`);
        }
      }
    } else {
      const num = Number(estimatePointValue);
      if (isNaN(num)) {
        errors.push(`Estimate point must be a number: "${estimatePointValue}"`);
      } else if (!Number.isInteger(num)) {
        errors.push(`Estimate point must be an integer: "${estimatePointValue}"`);
      } else {
        estimatePoint = num;
      }
    }
  }
  return estimatePoint;
}

/**
 * Resolves and validates start and target dates.
 */
function resolveImportDates(
  row: ITaskImportRow,
  errors: string[],
): { startDate?: Date; targetDate?: Date } {
  let startDate: Date | undefined;
  const startDateValue = row.startDate || row['Start Date'] || '';
  if (startDateValue) {
    const d = new Date(startDateValue);
    if (!isNaN(d.getTime())) {
      startDate = d;
    } else {
      errors.push(`Invalid Start Date: "${startDateValue}"`);
    }
  }

  let targetDate: Date | undefined;
  const targetDateValue = row.targetDate || row['Target Date'] || '';
  if (targetDateValue) {
    const d = new Date(targetDateValue);
    if (!isNaN(d.getTime())) {
      targetDate = d;
    } else {
      errors.push(`Invalid Target Date: "${targetDateValue}"`);
    }
  }

  if (startDate && targetDate && targetDate < startDate) {
    errors.push('Target Date must be after Start Date');
  }

  return { startDate, targetDate };
}

/**
 * Formats task description into BlockNote JSON format if not already valid JSON.
 */
function resolveImportDescription(row: ITaskImportRow): string {
  const rawDescription = row.description || row.Description || '';
  if (!rawDescription) {
    return '';
  }
  try {
    JSON.parse(rawDescription);
    return rawDescription;
  } catch {
    const block = {
      id: randomBytes(5).toString('hex'),
      type: 'paragraph',
      props: {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      },
      content: [
        {
          type: 'text',
          text: rawDescription,
          styles: {},
        },
      ],
      children: [],
    };
    return JSON.stringify([block]);
  }
}

/**
 * Resolves tag names or IDs to their corresponding tag document IDs.
 */
async function resolveImportTags(
  subdomain: string,
  row: ITaskImportRow,
  errors: string[],
): Promise<string[]> {
  let tagIds: string[] = [];
  const tagsValue = row.tags || row.Tags || '';
  if (tagsValue) {
    const tagNamesOrIds = toArray(tagsValue);
    if (tagNamesOrIds.length) {
      try {
        const fetchedTags: unknown = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'tags',
          action: 'find',
          input: {
            query: {
              type: 'operation:task',
              $or: [
                { name: { $in: tagNamesOrIds } },
                { _id: { $in: tagNamesOrIds } },
              ],
            },
          },
        });
        if (fetchedTags && Array.isArray(fetchedTags)) {
          tagIds = fetchedTags.map((tag: unknown) => {
            if (tag && typeof tag === 'object' && '_id' in tag) {
              return String((tag as { _id: unknown })._id);
            }
            return '';
          }).filter(Boolean);
          if (tagIds.length < tagNamesOrIds.length) {
            const resolvedNames = fetchedTags.map((t: unknown) => {
              if (t && typeof t === 'object' && 'name' in t) {
                return String((t as { name: unknown }).name);
              }
              return '';
            }).filter(Boolean);
            const resolvedIds = fetchedTags.map((t: unknown) => {
              if (t && typeof t === 'object' && '_id' in t) {
                return String((t as { _id: unknown })._id);
              }
              return '';
            }).filter(Boolean);
            const missing = tagNamesOrIds.filter(
              (item) => !resolvedNames.includes(item) && !resolvedIds.includes(item)
            );
            errors.push(`Tags not found: ${missing.join(', ')}`);
          }
        } else {
          errors.push(`Tags not found: ${tagNamesOrIds.join(', ')}`);
        }
      } catch (err) {
        errors.push(
          `Failed to resolve tags "${tagNamesOrIds.join(', ')}": ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }
  return tagIds;
}

/**
 * Resolves pipeline label names or IDs to label document IDs.
 */
async function resolveImportLabels(
  subdomain: string,
  row: ITaskImportRow,
  errors: string[],
): Promise<string[]> {
  let labelIds: string[] = [];
  const labelsValue = row.labels || row.Labels || '';
  if (labelsValue) {
    const labelNamesOrIds = toArray(labelsValue);
    if (labelNamesOrIds.length) {
      try {
        const fetchedLabels: unknown = await sendTRPCMessage({
          subdomain,
          pluginName: 'sales',
          method: 'query',
          module: 'pipelineLabel',
          action: 'find',
          input: {
            $or: [
              { name: { $in: labelNamesOrIds } },
              { _id: { $in: labelNamesOrIds } },
            ],
          },
        });
        if (fetchedLabels && Array.isArray(fetchedLabels)) {
          labelIds = fetchedLabels.map((lbl: unknown) => {
            if (lbl && typeof lbl === 'object' && '_id' in lbl) {
              return String((lbl as { _id: unknown })._id);
            }
            return '';
          }).filter(Boolean);
          if (labelIds.length < labelNamesOrIds.length) {
            const resolvedNames = fetchedLabels.map((l: unknown) => {
              if (l && typeof l === 'object' && 'name' in l) {
                return String((l as { name: unknown }).name);
              }
              return '';
            }).filter(Boolean);
            const resolvedIds = fetchedLabels.map((l: unknown) => {
              if (l && typeof l === 'object' && '_id' in l) {
                return String((l as { _id: unknown })._id);
              }
              return '';
            }).filter(Boolean);
            const missing = labelNamesOrIds.filter(
              (item) => !resolvedNames.includes(item) && !resolvedIds.includes(item)
            );
            errors.push(`Labels not found: ${missing.join(', ')}`);
          }
        } else {
          errors.push(`Labels not found: ${labelNamesOrIds.join(', ')}`);
        }
      } catch (err) {
        errors.push(
          `Failed to resolve labels "${labelNamesOrIds.join(', ')}": ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
    }
  }
  return labelIds;
}

/**
 * Prepares and validates a task document from a raw import row.
 * 
 * @param models - Mongoose database models connection resolver.
 * @param row - The raw task import row data.
 * @param subdomain - Subdomain tenant identifier.
 * @returns The prepared task document.
 */
export async function prepareTaskDoc(
  models: IModels,
  row: ITaskImportRow,
  subdomain: string,
): Promise<ITask> {
  const errors: string[] = [];

  const name = row.name || row.Name || '';
  if (!name) {
    errors.push('Name is required');
  }

  const team = await resolveImportTeam(models, row, errors);
  const projectId = await resolveImportProject(models, row, team, errors);
  const statusId = await resolveImportStatus(models, row, team, errors);
  const assigneeId = await resolveImportAssignee(subdomain, row, errors);
  const cycleId = await resolveImportCycle(models, row, team, errors);
  const milestoneId = await resolveImportMilestone(models, row, errors);
  const priority = resolveImportPriority(row, errors);
  const estimatePoint = await resolveImportEstimatePoint(team, row, errors);
  const { startDate, targetDate } = resolveImportDates(row, errors);
  const description = resolveImportDescription(row);
  const tagIds = await resolveImportTags(subdomain, row, errors);
  const labelIds = await resolveImportLabels(subdomain, row, errors);

  if (errors.length > 0) {
    throw new Error(errors.join(' | '));
  }

  return {
    name,
    description,
    status: statusId,
    teamId: team ? team._id : '',
    priority,
    estimatePoint,
    ...(assigneeId && { assigneeId }),
    ...(projectId && { projectId }),
    ...(cycleId && { cycleId }),
    ...(milestoneId && { milestoneId }),
    ...(startDate && { startDate }),
    ...(targetDate && { targetDate }),
    ...(tagIds.length && { tagIds }),
    ...(labelIds.length && { labelIds }),
  };
}
