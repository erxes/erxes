import mongoose from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { STATUS_TYPES } from '@/status/constants/types';

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value))
    return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/[;,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function prepareTaskDoc(row: any): any {
  const doc: any = {
    name: row.name || row.Name || '',
    description: row.description || row.Description || '',
  };

  if (row.teamId || row['Team ID']) doc.teamId = row.teamId || row['Team ID'];
  if (row.status || row.Status) doc.status = row.status || row.Status;
  if (row.projectId || row['Project ID'])
    doc.projectId = row.projectId || row['Project ID'];
  if (row.cycleId || row['Cycle ID'])
    doc.cycleId = row.cycleId || row['Cycle ID'];
  if (row.milestoneId || row['Milestone ID'])
    doc.milestoneId = row.milestoneId || row['Milestone ID'];
  if (row.assigneeId || row['Assignee ID'])
    doc.assigneeId = row.assigneeId || row['Assignee ID'];

  const priorityVal = row.priority || row.Priority;
  if (priorityVal !== undefined && priorityVal !== '') {
    const num = Number(priorityVal);
    if (!isNaN(num)) doc.priority = num;
  }

  const estimateVal = row.estimatePoint || row['Estimate Point'];
  if (estimateVal !== undefined && estimateVal !== '') {
    const num = Number(estimateVal);
    if (!isNaN(num)) doc.estimatePoint = num;
  }

  const labels = parseList(row.labelIds || row.Labels);
  if (labels.length) doc.labelIds = labels;

  const tags = parseList(row.tagIds || row.Tags);
  if (tags.length) doc.tagIds = tags;

  if (row.startDate || row['Start Date']) {
    const d = new Date(row.startDate || row['Start Date']);
    if (!isNaN(d.getTime())) doc.startDate = d;
  }

  if (row.targetDate || row['Target Date']) {
    const d = new Date(row.targetDate || row['Target Date']);
    if (!isNaN(d.getTime())) doc.targetDate = d;
  }

  return doc;
}

export async function processTaskRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  // Cache per-team status lookups within a single batch
  const backlogCache = new Map<string, string | null>();
  const getBacklogStatus = async (teamId: string): Promise<string | null> => {
    if (backlogCache.has(teamId)) return backlogCache.get(teamId)!;
    const s = await models.Status.findOne({
      teamId,
      type: STATUS_TYPES.BACKLOG,
    })
      .select('_id')
      .lean();
    const id = s ? String(s._id) : null;
    backlogCache.set(teamId, id);
    return id;
  };

  // Cache next-number per team for this batch
  const nextNumberCache = new Map<string, number>();
  const getNextNumber = async (teamId: string): Promise<number> => {
    if (!nextNumberCache.has(teamId)) {
      const [result] = await models.Task.aggregate([
        { $match: { teamId } },
        { $group: { _id: null, maxNumber: { $max: '$number' } } },
      ]);
      nextNumberCache.set(teamId, (result?.maxNumber || 0) + 1);
    }
    const next = nextNumberCache.get(teamId)!;
    nextNumberCache.set(teamId, next + 1);
    return next;
  };

  for (const row of rows) {
    try {
      const doc = prepareTaskDoc(row);

      if (!doc.name) {
        errorRows.push({ ...row, error: 'Name is required' });
        continue;
      }
      if (!doc.teamId) {
        errorRows.push({ ...row, error: 'Team ID is required' });
        continue;
      }

      const team = await models.Team.findOne({ _id: doc.teamId })
        .select('_id')
        .lean();
      if (!team) {
        errorRows.push({ ...row, error: `Team "${doc.teamId}" not found` });
        continue;
      }

      // Resolve status: use provided if valid for this team, else default to BACKLOG
      if (doc.status) {
        const status = await models.Status.findOne({
          _id: doc.status,
          teamId: doc.teamId,
        })
          .select('_id type')
          .lean();
        if (!status) {
          errorRows.push({
            ...row,
            error: `Status "${doc.status}" not found for team`,
          });
          continue;
        }
        doc.statusType = status.type;
      } else {
        const backlogId = await getBacklogStatus(doc.teamId);
        if (!backlogId) {
          errorRows.push({
            ...row,
            error: 'No default (backlog) status configured for team',
          });
          continue;
        }
        doc.status = backlogId;
        doc.statusType = STATUS_TYPES.BACKLOG;
      }

      // Validate project/team consistency
      if (doc.projectId) {
        const project = await models.Project.findOne({ _id: doc.projectId })
          .select('teamIds')
          .lean();
        if (!project) {
          errorRows.push({
            ...row,
            error: `Project "${doc.projectId}" not found`,
          });
          continue;
        }
        if (!project.teamIds?.includes(doc.teamId)) {
          errorRows.push({
            ...row,
            error: 'Task project is not in this team',
          });
          continue;
        }
      }

      // Reject completed cycles
      if (doc.cycleId) {
        const cycle = await models.Cycle.findOne({ _id: doc.cycleId })
          .select('isCompleted')
          .lean();
        if (cycle?.isCompleted) {
          errorRows.push({
            ...row,
            error: 'Cannot add task to completed cycle',
          });
          continue;
        }
      }

      doc.number = await getNextNumber(doc.teamId);
      doc._id = new mongoose.Types.ObjectId();

      try {
        const task = await models.Task.create(doc);
        successRows.push({ ...row, _id: task._id });
      } catch (e: any) {
        if (e?.name === 'ValidationError') {
          errorRows.push({ ...row, error: `Validation error: ${e.message}` });
        } else if (e?.code === 11000) {
          errorRows.push({ ...row, error: `Duplicate value: ${e.message}` });
        } else {
          errorRows.push({
            ...row,
            error: e?.message || 'Failed to import task',
          });
        }
      }
    } catch (e: any) {
      errorRows.push({ ...row, error: e?.message || 'Failed to import task' });
    }
  }

  return { successRows, errorRows };
}
