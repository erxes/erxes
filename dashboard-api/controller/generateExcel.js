const xlsxPopulate = require('xlsx-populate');

const createXlsFile = async () => {
  // Generating blank workbook
  const workbook = await xlsxPopulate.fromBlankAsync();

  return { workbook, sheet: workbook.sheet(0) };
};

const generateXlsx = async workbook => {
  return workbook.outputAsync();
};

const generateExcel = async result => {
  const { workbook, sheet } = await createXlsFile();

  const columns = result.tableColumns;
  const datas = result.tablePivot;

  let rowIndex = 1;
  const columnNames = [];

  for (const data of datas) {
    rowIndex++;
    for (const column of columns) {
      if (columnNames.includes(column.shortTitle)) {
        // If column already exists adding cell

        sheet
          .cell(rowIndex, columnNames.indexOf(column.shortTitle) + 1)
          .value(data[column.key]);
      } else {
        // Creating column
        sheet.cell(1, columnNames.length + 1).value(column.shortTitle);
        // Creating cell

        sheet
          .cell(rowIndex, columnNames.indexOf(column.shortTitle) + 1)
          .value(data[column.key]);

        columnNames.push(column.shortTitle);
      }
    }
  }

  return {
    response: await generateXlsx(workbook)
  };
};

module.exports = generateExcel;
