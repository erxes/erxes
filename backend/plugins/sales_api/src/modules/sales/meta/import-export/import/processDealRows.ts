import { IModels } from '~/connectionResolvers';
import { SALES_STATUSES } from '~/modules/sales/constants';

function parseList(value: any): string[] {
  if (!value) return [];
  if (Array.isArray(value))
    return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/[;,]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function getRowValue(row: any, keys: string[]): any {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  return undefined;
}

function parseDate(value: any): Date | null {
  if (!value) return null;

  const native = new Date(value);
  if (!isNaN(native.getTime())) return native;

  const str = String(value).trim();

  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const d = new Date(
      `${slashMatch[3]}-${slashMatch[1].padStart(
        2,
        '0',
      )}-${slashMatch[2].padStart(2, '0')}`,
    );
    if (!isNaN(d.getTime())) return d;
  }

  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const d = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`);
    if (!isNaN(d.getTime())) return d;
  }

  return null;
}

function prepareDealDoc(row: any): { doc: any; dateErrors: string[] } {
  const doc: any = {
    name: getRowValue(row, ['name', 'Name']) || '',
    description: getRowValue(row, ['description', 'Description']) || '',
  };

  const stageId = getRowValue(row, ['stageId', 'Stage ID']);
  if (stageId) doc.stageId = stageId;

  const amountVal = getRowValue(row, [
    'amount',
    'Amount',
    'totalAmount',
    'Total Amount',
  ]);
  if (amountVal !== undefined) {
    const num = Number(amountVal);
    if (!isNaN(num)) doc.totalAmount = num;
  }

  const priorityVal = getRowValue(row, ['priority', 'Priority']);
  if (priorityVal) doc.priority = String(priorityVal);

  const statusVal = getRowValue(row, ['status', 'Status']);
  if (
    statusVal &&
    SALES_STATUSES.ALL.includes(String(statusVal).toLowerCase())
  ) {
    doc.status = String(statusVal).toLowerCase();
  }

  const dateErrors: string[] = [];

  const startDateRaw = getRowValue(row, ['startDate', 'Start Date']);
  if (startDateRaw) {
    const d = parseDate(startDateRaw);
    if (d) {
      doc.startDate = d;
    } else {
      dateErrors.push(`Unrecognised startDate format: "${startDateRaw}"`);
    }
  }

  const closeDateRaw = getRowValue(row, ['closeDate', 'Close Date']);
  if (closeDateRaw) {
    const d = parseDate(closeDateRaw);
    if (d) {
      doc.closeDate = d;
    } else {
      dateErrors.push(`Unrecognised closeDate format: "${closeDateRaw}"`);
    }
  }

  const assigned = parseList(
    getRowValue(row, ['assignedUserIds', 'Assigned Users']),
  );
  if (assigned.length) doc.assignedUserIds = assigned;

  const tags = parseList(getRowValue(row, ['tagIds', 'Tags']));
  if (tags.length) doc.tagIds = tags;

  const labels = parseList(getRowValue(row, ['labelIds', 'Labels']));
  if (labels.length) doc.labelIds = labels;

  const branches = parseList(getRowValue(row, ['branchIds', 'Branches']));
  if (branches.length) doc.branchIds = branches;

  const departments = parseList(
    getRowValue(row, ['departmentIds', 'Departments']),
  );
  if (departments.length) doc.departmentIds = departments;

  const number = getRowValue(row, ['number', 'Number']);
  if (number) doc.number = number;

  return { doc, dateErrors };
}

export async function processDealRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  for (const row of rows) {
    const { doc, dateErrors } = prepareDealDoc(row);

    if (dateErrors.length) {
      errorRows.push({ ...row, error: dateErrors.join('; ') });
      continue;
    }

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

    if (doc.number) {
      const existing = await models.Deals.findOne({ number: doc.number })
        .select('_id')
        .lean();
      if (existing) {
        errorRows.push({
          ...row,
          error: `Duplicate deal number "${doc.number}"`,
        });
        continue;
      }
    }

    try {
      const deal = await models.Deals.createDeal(doc);
      successRows.push({ ...row, _id: deal._id });
    } catch (e: any) {
      errorRows.push({
        ...row,
        error: e?.message || 'Failed to create deal',
      });
    }
  }

  return { successRows, errorRows };
}
