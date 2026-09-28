import ExcelJS from 'exceljs';

interface IReportExportMetadata {
  title: string;
  organizationName: string;
  dateRange: string;
}

interface IExtractedCell {
  value: string | number;
  colSpan: number;
  rowSpan: number;
  isHeader: boolean;
  isTotal: boolean;
  indent: number;
}

type ExtractedRow = IExtractedCell[];

const normalizeText = (value: string) =>
  value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseCellValue = (cell: HTMLTableCellElement): string | number => {
  const text = normalizeText(cell.textContent || '');

  if (!cell.classList.contains('text-right')) {
    return text;
  }

  const normalizedNumber = text.replace(/,/g, '');
  if (/^-?\d+(\.\d+)?$/.test(normalizedNumber)) {
    return Number(normalizedNumber);
  }

  return text;
};

const getDirectRows = (table: HTMLTableElement) =>
  Array.from(table.children).flatMap((section) =>
    section instanceof HTMLTableSectionElement
      ? Array.from(section.children).filter(
          (child): child is HTMLTableRowElement =>
            child instanceof HTMLTableRowElement,
        )
      : [],
  );

const extractTableRows = (table: HTMLTableElement): ExtractedRow[] => {
  const rows: ExtractedRow[] = [];

  getDirectRows(table).forEach((row) => {
    if (row.hidden || window.getComputedStyle(row).display === 'none') {
      return;
    }

    const directCells = Array.from(row.children).filter(
      (child): child is HTMLTableCellElement =>
        child instanceof HTMLTableCellElement,
    );
    const nestedTables = directCells.flatMap((cell) =>
      Array.from(cell.children).filter(
        (child): child is HTMLTableElement => child instanceof HTMLTableElement,
      ),
    );

    if (nestedTables.length) {
      nestedTables.forEach((nestedTable) => {
        rows.push(...extractTableRows(nestedTable));
      });
      return;
    }

    const isTotal = row.dataset.sumKey === 'footer';
    rows.push(
      directCells.map((cell) => ({
        value: parseCellValue(cell),
        colSpan: cell.colSpan || 1,
        rowSpan: cell.rowSpan || 1,
        isHeader: cell.tagName === 'TH',
        isTotal,
        indent: Math.max(
          0,
          Math.round(
            Number.parseFloat(window.getComputedStyle(cell).paddingLeft) / 25,
          ),
        ),
      })),
    );
  });

  return rows;
};

const sanitizeSheetName = (value: string) =>
  (value.replace(/[\\/*?:[\]]/g, ' ').trim() || 'Report').slice(0, 31);

const sanitizeFileName = (value: string) =>
  (value.replace(/[\\/:*?"<>|]/g, '-').trim() || 'accounting-report')
    .replace(/\s+/g, '-')
    .toLowerCase();

const downloadWorkbook = async (
  workbook: ExcelJS.Workbook,
  fileName: string,
) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const exportJournalReportExcel = async (
  container: HTMLElement,
  metadata: IReportExportMetadata,
) => {
  const table = container.querySelector('table[data-slot="table"]');
  if (!(table instanceof HTMLTableElement)) {
    throw new Error('Тайлангийн хүснэгт олдсонгүй');
  }

  const rows = extractTableRows(table);
  if (
    !rows.some((row) =>
      row.some((cell) => !cell.isHeader && !cell.isTotal && cell.value !== ''),
    )
  ) {
    throw new Error('Татах тайлангийн мэдээлэл алга');
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'erxes Accounting';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sanitizeSheetName(metadata.title));
  const tableStartRow = 5;
  const occupied = new Set<string>();
  let maxColumn = 1;

  rows.forEach((row, rowIndex) => {
    const excelRow = tableStartRow + rowIndex;
    let column = 1;

    row.forEach((sourceCell) => {
      while (occupied.has(`${excelRow}:${column}`)) {
        column += 1;
      }

      const endRow = excelRow + sourceCell.rowSpan - 1;
      const endColumn = column + sourceCell.colSpan - 1;
      const cell = worksheet.getCell(excelRow, column);

      cell.value = sourceCell.value;
      cell.alignment = {
        vertical: 'middle',
        horizontal: typeof sourceCell.value === 'number' ? 'right' : 'left',
        wrapText: true,
        indent: sourceCell.indent,
      };
      if (typeof sourceCell.value === 'number') {
        cell.numFmt = '#,##0.########';
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };

      if (sourceCell.isHeader || sourceCell.isTotal) {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: sourceCell.isHeader ? 'FFE5E7EB' : 'FFF3F4F6',
          },
        };
      }

      if (sourceCell.rowSpan > 1 || sourceCell.colSpan > 1) {
        worksheet.mergeCells(excelRow, column, endRow, endColumn);
      }

      for (
        let occupiedRow = excelRow;
        occupiedRow <= endRow;
        occupiedRow += 1
      ) {
        for (
          let occupiedColumn = column;
          occupiedColumn <= endColumn;
          occupiedColumn += 1
        ) {
          occupied.add(`${occupiedRow}:${occupiedColumn}`);
        }
      }

      maxColumn = Math.max(maxColumn, endColumn);
      column = endColumn + 1;
    });
  });

  worksheet.getCell('A1').value = metadata.title;
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A2').value = metadata.organizationName;
  worksheet.getCell('A3').value = metadata.dateRange;
  worksheet.mergeCells(1, 1, 1, maxColumn);
  worksheet.mergeCells(2, 1, 2, maxColumn);
  worksheet.mergeCells(3, 1, 3, maxColumn);
  worksheet.getRow(1).alignment = { horizontal: 'center' };
  worksheet.views = [{ state: 'frozen', ySplit: tableStartRow - 1 }];

  for (let column = 1; column <= maxColumn; column += 1) {
    let maxLength = 10;
    worksheet.getColumn(column).eachCell({ includeEmpty: false }, (cell) => {
      maxLength = Math.max(maxLength, String(cell.value ?? '').length + 2);
    });
    worksheet.getColumn(column).width = Math.min(maxLength, 36);
  }

  const dateSuffix = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(
    workbook,
    `${sanitizeFileName(metadata.title)}-${dateSuffix}.xlsx`,
  );
};
