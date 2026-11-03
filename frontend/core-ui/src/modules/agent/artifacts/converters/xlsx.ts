const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export const tableToXlsxBlob = async (
  rows: (string | number)[][],
): Promise<Blob> => {
  const ExcelJS = (await import('exceljs')).default;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');

  sheet.addRows(rows.length ? rows : [['']]);

  if (rows.length) {
    const header = sheet.getRow(1);
    header.font = { bold: true };
    header.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE9ECEF' },
    };
  }

  sheet.columns.forEach((column) => {
    let width = 10;

    column.eachCell?.({ includeEmpty: false }, (cell) => {
      width = Math.max(width, String(cell.value ?? '').length + 2);
    });
    column.width = Math.min(width, 50);
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Blob([buffer], { type: XLSX_MIME });
};
