import { IModels } from '~/connectionResolvers';
import { SALES_STATUSES } from '~/modules/sales/constants';

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/[;,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function prepareDealDoc(row: any): any {
  const doc: any = {
    name: row.name || row.Name || '',
    description: row.description || row.Description || '',
  };

  if (row.stageId || row['Stage ID']) {
    doc.stageId = row.stageId || row['Stage ID'];
  }

  const amountVal = row.amount || row.Amount || row.totalAmount || row['Total Amount'];
  if (amountVal !== undefined && amountVal !== '') {
    const num = Number(amountVal);
    if (!isNaN(num)) doc.totalAmount = num;
  }

  const priorityVal = row.priority || row.Priority;
  if (priorityVal) doc.priority = String(priorityVal);

  const statusVal = row.status || row.Status;
  if (statusVal && SALES_STATUSES.ALL.includes(String(statusVal).toLowerCase())) {
    doc.status = String(statusVal).toLowerCase();
  }

  if (row.startDate || row['Start Date']) {
    const d = new Date(row.startDate || row['Start Date']);
    if (!isNaN(d.getTime())) doc.startDate = d;
  }

  if (row.closeDate || row['Close Date']) {
    const d = new Date(row.closeDate || row['Close Date']);
    if (!isNaN(d.getTime())) doc.closeDate = d;
  }

  const assigned = parseList(row.assignedUserIds || row['Assigned Users']);
  if (assigned.length) doc.assignedUserIds = assigned;

  const tags = parseList(row.tagIds || row.Tags);
  if (tags.length) doc.tagIds = tags;

  const labels = parseList(row.labelIds || row.Labels);
  if (labels.length) doc.labelIds = labels;

  const branches = parseList(row.branchIds || row.Branches);
  if (branches.length) doc.branchIds = branches;

  const departments = parseList(row.departmentIds || row.Departments);
  if (departments.length) doc.departmentIds = departments;

  if (row.number || row.Number) doc.number = row.number || row.Number;

  return doc;
}

export async function processDealRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  for (const row of rows) {
    try {
      const doc = prepareDealDoc(row);

      if (!doc.name) {
        errorRows.push({ ...row, error: 'Name is required' });
        continue;
      }

      if (!doc.stageId) {
        errorRows.push({ ...row, error: 'Stage ID is required' });
        continue;
      }

      const stage = await models.Stages.findOne({ _id: doc.stageId }).lean();
      if (!stage) {
        errorRows.push({ ...row, error: `Stage "${doc.stageId}" not found` });
        continue;
      }

      // Idempotency: if `number` is provided, dedup on it.
      if (doc.number) {
        const existing = await models.Deals.findOne({ number: doc.number })
          .select('_id')
          .lean();
        if (existing) {
          errorRows.push({
            ...row,
            error: `Duplicate deal with number "${doc.number}"`,
          });
          continue;
        }
      }

      try {
        const deal = await models.Deals.createDeal(doc);
        successRows.push({ ...row, _id: deal._id });
      } catch (e: any) {
        if (e?.name === 'ValidationError' || e?.message?.includes('validation failed')) {
          errorRows.push({
            ...row,
            error: `Validation error: ${e.message}`,
          });
        } else if (e?.code === 11000) {
          errorRows.push({
            ...row,
            error: `Duplicate value: ${e.message}`,
          });
        } else {
          errorRows.push({
            ...row,
            error: e?.message || 'Failed to import deal',
          });
        }
      }
    } catch (e: any) {
      errorRows.push({ ...row, error: e?.message || 'Failed to import deal' });
    }
  }

  return { successRows, errorRows };
}
