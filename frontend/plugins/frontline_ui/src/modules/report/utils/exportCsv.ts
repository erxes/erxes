import { TicketExportItem } from '@/report/hooks/useTicketExport';
import ExcelJS from 'exceljs';

export interface TicketExportColumn {
  key: string;
  header: string;
  getValue: (ticket: TicketExportItem) => string;
}

export async function generateTicketExcel(
  tickets: TicketExportItem[],
  columns: TicketExportColumn[],
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tickets');

  sheet.columns = columns.map((col) => ({
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
      Object.fromEntries(columns.map((col) => [col.key, col.getValue(ticket)])),
    );
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export function downloadExcel(
  buffer: ArrayBuffer | ExcelJS.Buffer,
  filename: string,
) {
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
