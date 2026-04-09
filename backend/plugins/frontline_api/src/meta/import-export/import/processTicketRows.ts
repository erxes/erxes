import { IModels } from '~/connectionResolvers';
import {
  TICKET_PRIORITY_TYPES,
  TICKET_DEFAULT_STATUSES,
} from '@/ticket/constants/types';

const priorityByName = new Map(
  TICKET_PRIORITY_TYPES.map((p) => [p.name.toLowerCase(), p.type]),
);

const statusByName = new Map(
  TICKET_DEFAULT_STATUSES.map((s) => [s.name.toLowerCase(), s.type]),
);

function prepareTicketDoc(row: any): any {
  const doc: any = {
    name: row.name || row.Name || '',
    description: row.description || row.Description || '',
    type: row.type || row.Type || 'ticket',
    state: row.state || row.State || '',
  };

  const priorityVal = row.priority || row.Priority || '';
  if (priorityVal) {
    const num = Number(priorityVal);
    if (Number.isNaN(num)) {
      doc.priority = priorityByName.get(priorityVal.toLowerCase()) || 0;
    } else {
      doc.priority = num;
    }
  }

  const statusVal = row.statusType || row['Status'] || '';
  if (statusVal) {
    const num = Number(statusVal);
    if (Number.isNaN(num)) {
      doc.statusType = statusByName.get(statusVal.toLowerCase()) || 0;
    } else {
      doc.statusType = num;
    }
  }

  if (row.pipelineId || row['Pipeline ID']) {
    doc.pipelineId = row.pipelineId || row['Pipeline ID'];
  }

  if (row.assigneeId || row['Assignee ID']) {
    doc.assigneeId = row.assigneeId || row['Assignee ID'];
  }

  if (row.channelId || row['Channel ID']) {
    doc.channelId = row.channelId || row['Channel ID'];
  }

  if (row.startDate || row['Start Date']) {
    const d = new Date(row.startDate || row['Start Date']);
    if (!Number.isNaN(d.getTime())) doc.startDate = d;
  }

  if (row.targetDate || row['Due Date']) {
    const d = new Date(row.targetDate || row['Due Date']);
    if (!Number.isNaN(d.getTime())) doc.targetDate = d;
  }

  if (row.tags || row.Tags) {
    doc._tagNames = (row.tags || row.Tags || '')
      .split(';')
      .map((t: string) => t.trim())
      .filter(Boolean);
  }

  return doc;
}

export async function processTicketRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    const operations: any[] = [];
    const rowDocs: any[] = [];

    for (const row of rows) {
      try {
        const doc = prepareTicketDoc(row);

        if (!doc.name) {
          errorRows.push({ ...row, error: 'Name is required' });
          continue;
        }

        delete doc._tagNames;
        operations.push({ insertOne: { document: doc } });
        rowDocs.push({ row, doc });
      } catch (e: any) {
        errorRows.push({
          ...row,
          error: e?.message || 'Failed to prepare row',
        });
      }
    }

    if (operations.length) {
      const result = await models.Ticket.bulkWrite(operations);

      for (let i = 0; i < rowDocs.length; i++) {
        const { row } = rowDocs[i];
        successRows.push({
          ...row,
          _id: result.insertedIds[i],
        });
      }
    }

    return { successRows, errorRows };
  } catch (e: any) {
    return {
      successRows: [],
      errorRows: rows.map((r) => ({
        ...r,
        error: e?.message || 'Failed to process rows',
      })),
    };
  }
}
