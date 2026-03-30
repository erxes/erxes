import { TicketExportItem } from '@/report/hooks/useTicketExport';
import { formatDate } from 'date-fns';
import ExcelJS from 'exceljs';

const EXPORT_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'state', header: 'State' },
  { key: 'priorityLabel', header: 'Priority' },
  { key: 'statusLabel', header: 'Status' },
  { key: 'assigneeName', header: 'Assignee' },
  { key: 'pipelineName', header: 'Pipeline' },
  { key: 'tagNames', header: 'Tags' },
  { key: 'createdAt', header: 'Created At' },
  { key: 'startDate', header: 'Start Date' },
  { key: 'targetDate', header: 'Due Date' },
  { key: 'updatedAt', header: 'Updated At' },
] as const;

function formatDateValue(value?: string): string {
  if (!value) return '';
  try {
    return formatDate(new Date(value), 'yyyy-MM-dd HH:mm');
  } catch {
    return value;
  }
}

export async function generateTicketExcel(tickets: TicketExportItem[]) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tickets');

  sheet.columns = EXPORT_COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.key === 'name' ? 30 : 18,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE9ECEF' },
  };

  for (const ticket of tickets) {
    sheet.addRow(
      EXPORT_COLUMNS.reduce(
        (row, col) => {
          const value = ticket[col.key as keyof TicketExportItem];
          if (col.key === 'tagNames') {
            row[col.key] = ((value as string[]) || []).join(', ');
          } else if (
            ['createdAt', 'startDate', 'targetDate', 'updatedAt'].includes(
              col.key,
            )
          ) {
            row[col.key] = formatDateValue(value as string);
          } else {
            row[col.key] = String(value ?? '');
          }
          return row;
        },
        {} as Record<string, string>,
      ),
    );
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export function downloadExcel(buffer: ArrayBuffer | ExcelJS.Buffer, filename: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
