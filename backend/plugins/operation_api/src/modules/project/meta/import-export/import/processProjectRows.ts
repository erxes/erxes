import { IModels } from '~/connectionResolvers';

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value))
    return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/[;,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function prepareProjectDoc(row: any): any {
  const doc: any = {
    name: row.name || row.Name || '',
    description: row.description || row.Description || '',
  };

  const teams = parseList(row.teamIds || row.Teams || row['Team IDs']);
  if (teams.length) doc.teamIds = teams;

  const tags = parseList(row.tagIds || row.Tags);
  if (tags.length) doc.tagIds = tags;

  const members = parseList(row.memberIds || row.Members || row['Member IDs']);
  if (members.length) doc.memberIds = members;

  const priorityVal = row.priority || row.Priority;
  if (priorityVal !== undefined && priorityVal !== '') {
    const num = Number(priorityVal);
    if (!isNaN(num)) doc.priority = num;
  }

  const statusVal = row.status || row.Status;
  if (statusVal !== undefined && statusVal !== '') {
    const num = Number(statusVal);
    if (!isNaN(num)) doc.status = num;
  }

  if (row.leadId || row['Lead ID']) doc.leadId = row.leadId || row['Lead ID'];

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

export async function processProjectRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  for (const row of rows) {
    try {
      const doc = prepareProjectDoc(row);

      if (!doc.name) {
        errorRows.push({ ...row, error: 'Name is required' });
        continue;
      }
      if (!doc.teamIds || doc.teamIds.length === 0) {
        errorRows.push({ ...row, error: 'At least one team ID is required' });
        continue;
      }
      if (doc.priority === undefined) {
        errorRows.push({ ...row, error: 'Priority is required' });
        continue;
      }
      if (doc.status === undefined) {
        errorRows.push({ ...row, error: 'Status is required' });
        continue;
      }

      // Validate teams exist
      const existingTeams = await models.Team.find({
        _id: { $in: doc.teamIds },
      })
        .select('_id')
        .lean();
      if (existingTeams.length !== doc.teamIds.length) {
        const found = new Set(existingTeams.map((t: any) => String(t._id)));
        const missing = doc.teamIds.filter((id: string) => !found.has(id));
        errorRows.push({
          ...row,
          error: `Teams not found: ${missing.join(', ')}`,
        });
        continue;
      }

      try {
        const project = await models.Project.create(doc);
        successRows.push({ ...row, _id: project._id });
      } catch (e: any) {
        if (e?.name === 'ValidationError') {
          errorRows.push({ ...row, error: `Validation error: ${e.message}` });
        } else if (e?.code === 11000) {
          errorRows.push({ ...row, error: `Duplicate value: ${e.message}` });
        } else {
          errorRows.push({
            ...row,
            error: e?.message || 'Failed to import project',
          });
        }
      }
    } catch (e: any) {
      errorRows.push({
        ...row,
        error: e?.message || 'Failed to import project',
      });
    }
  }

  return { successRows, errorRows };
}
