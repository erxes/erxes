import { IModels } from '~/connectionResolvers';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getTeamEstimateChoises } from '~/modules/team/utils';
import { ITask, ITaskImportRow } from '../../../@types/task';

const toArray = (val: any) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [String(val).trim()];
};

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

  const teamValue = row.team || row.Team || '';
  let team: any = null;
  if (!teamValue) {
    errors.push('Team is required');
  } else {
    const teamQuery: any = {};
    if (typeof teamValue === 'string' && teamValue.match(/^[0-9a-fA-F]{24}$/)) {
      teamQuery._id = teamValue;
    } else {
      teamQuery.name = teamValue;
    }
    team = await models.Team.findOne(teamQuery).lean();
    if (!team) {
      errors.push(`Team not found: "${teamValue}"`);
    }
  }

  let projectId;
  const projectValue = row.project || row.Project || '';
  if (projectValue) {
    const projectQuery: any = {};
    if (typeof projectValue === 'string' && projectValue.match(/^[0-9a-fA-F]{24}$/)) {
      projectQuery._id = projectValue;
    } else {
      projectQuery.name = projectValue;
    }
    const project = await models.Project.findOne(projectQuery).lean();
    if (!project) {
      errors.push(`Project not found: "${projectValue}"`);
    } else {
      if (team && project.teamIds && !project.teamIds.map(String).includes(String(team._id))) {
        errors.push(`Team "${team.name}" is not associated with Project "${project.name}"`);
      }
      projectId = project._id;
    }
  }

  let statusId;
  const statusValue = row.status || row.Status || '';
  if (team) {
    if (statusValue) {
      const statusQuery: any = { teamId: team._id };
      if (typeof statusValue === 'string' && statusValue.match(/^[0-9a-fA-F]{24}$/)) {
        statusQuery._id = statusValue;
      } else {
        statusQuery.name = statusValue;
      }
      const statusDoc = await models.Status.findOne(statusQuery).lean();
      if (statusDoc) {
        statusId = statusDoc._id;
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
        statusId = defaultStatus._id;
      }
    }
  }

  let assigneeId;
  const assigneeValue = row.assignee || row.Assignee || '';
  if (assigneeValue) {
    const userOrFilters: any[] = [
      { email: assigneeValue },
      { username: assigneeValue },
      { 'details.fullName': assigneeValue },
    ];
    if (typeof assigneeValue === 'string' && assigneeValue.match(/^[0-9a-fA-F]{24}$/)) {
      userOrFilters.push({ _id: assigneeValue });
    }

    try {
      const user = await sendTRPCMessage({
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

      if (user) {
        assigneeId = user._id;
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
  }

  let cycleId;
  const cycleValue = row.cycle || row.Cycle || '';
  if (cycleValue && team) {
    const cycleQuery: any = { teamId: team._id };
    if (typeof cycleValue === 'string' && cycleValue.match(/^[0-9a-fA-F]{24}$/)) {
      cycleQuery._id = cycleValue;
    } else {
      cycleQuery.name = cycleValue;
    }
    const cycle = await models.Cycle.findOne(cycleQuery).lean();
    if (cycle) {
      cycleId = cycle._id;
    } else {
      errors.push(`Cycle not found: "${cycleValue}" for Team "${team.name}"`);
    }
  }

  let milestoneId;
  const milestoneValue = row.milestone || row.Milestone || '';
  if (milestoneValue) {
    const milestoneQuery: any = {};
    if (typeof milestoneValue === 'string' && milestoneValue.match(/^[0-9a-fA-F]{24}$/)) {
      milestoneQuery._id = milestoneValue;
    } else {
      milestoneQuery.name = milestoneValue;
    }
    const milestone = await models.Milestone.findOne(milestoneQuery).lean();
    if (milestone) {
      milestoneId = milestone._id;
    } else {
      errors.push(`Milestone not found: "${milestoneValue}"`);
    }
  }

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

  // Dates
  let startDate;
  const startDateValue = row.startDate || row['Start Date'] || '';
  if (startDateValue) {
    const d = new Date(startDateValue);
    if (!isNaN(d.getTime())) {
      startDate = d;
    } else {
      errors.push(`Invalid Start Date: "${startDateValue}"`);
    }
  }

  let targetDate;
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

  // Convert plain text description to BlockNote JSON format if not already valid JSON
  const rawDescription = row.description || row.Description || '';
  let description = '';
  if (rawDescription) {
    try {
      JSON.parse(rawDescription);
      description = rawDescription;
    } catch {
      const block = {
        id: Math.random().toString(36).substring(2, 11),
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
      description = JSON.stringify([block]);
    }
  }

  // Resolve Tags (Optional)
  let tagIds: string[] = [];
  const tagsValue = row.tags || row.Tags || '';
  if (tagsValue) {
    const tagNamesOrIds = toArray(tagsValue);
    if (tagNamesOrIds.length) {
      try {
        const fetchedTags = await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          method: 'query',
          module: 'tags',
          action: 'find',
          input: {
            query: {
              type: { $in: ['operation:task', null] },
              $or: [
                { name: { $in: tagNamesOrIds } },
                { _id: { $in: tagNamesOrIds } },
              ],
            },
          },
        });
        if (fetchedTags && Array.isArray(fetchedTags)) {
          tagIds = fetchedTags.map((tag) => String(tag._id));
          if (tagIds.length < tagNamesOrIds.length) {
            const resolvedNames = fetchedTags.map((t) => t.name);
            const resolvedIds = fetchedTags.map((t) => t._id);
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

  // Resolve Labels (Optional)
  let labelIds: string[] = [];
  const labelsValue = row.labels || row.Labels || '';
  if (labelsValue) {
    const labelNamesOrIds = toArray(labelsValue);
    if (labelNamesOrIds.length) {
      try {
        const fetchedLabels = await sendTRPCMessage({
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
          labelIds = fetchedLabels.map((lbl) => String(lbl._id));
          if (labelIds.length < labelNamesOrIds.length) {
            const resolvedNames = fetchedLabels.map((l) => l.name);
            const resolvedIds = fetchedLabels.map((l) => l._id);
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

  if (errors.length > 0) {
    throw new Error(errors.join(' | '));
  }

  // Build task document
  return {
    name,
    description,
    status: statusId,
    teamId: team?._id,
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
