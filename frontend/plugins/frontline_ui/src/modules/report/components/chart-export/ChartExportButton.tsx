import { useCallback, useState } from 'react';
import { Button } from 'erxes-ui';
import { IconDownload } from '@tabler/icons-react';
import ExcelJS from 'exceljs';
import { downloadExcel } from '@/report/utils/exportCsv';

export interface ChartExportColumn<T> {
  key: keyof T;
  header: string;
  format?: (value: any) => string;
}

interface ChartExportButtonProps<T> {
  data: T[];
  columns: ChartExportColumn<T>[];
  filename: string;
}

export function ChartExportButton<T>({
  data,
  columns,
  filename,
}: ChartExportButtonProps<T>) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!data.length) return;
    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Data');

      sheet.columns = columns.map((col) => ({
        header: col.header,
        key: String(col.key),
        width: 18,
      }));

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE9ECEF' },
      };

      for (const row of data) {
        sheet.addRow(
          columns.reduce(
            (obj, col) => {
              const raw = row[col.key];
              obj[String(col.key)] = col.format
                ? col.format(raw)
                : String(raw ?? '');
              return obj;
            },
            {} as Record<string, string>,
          ),
        );
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const timestamp = new Date().toISOString().slice(0, 10);
      downloadExcel(buffer, `${filename}-${timestamp}.xlsx`);
    } finally {
      setExporting(false);
    }
  }, [data, columns, filename]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-7"
      onClick={handleExport}
      disabled={!data.length || exporting}
      title="Export Excel"
    >
      <IconDownload className="size-3.5" />
    </Button>
  );
}
