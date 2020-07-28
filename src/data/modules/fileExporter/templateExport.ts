import { createXlsFile, generateXlsx } from '../../utils';

export const templateExport = async (args: any) => {
  const { configs, contentType } = args;

  const { workbook, sheet } = await createXlsFile();

  let rowIndex: number = 1;

  const addCell = (value: string, index: number): void => {
    sheet.cell(1, index).value(value);
  };

  switch (contentType) {
    case 'lead':
      addCell('state', rowIndex);
      sheet.cell(2, rowIndex).value('lead');

      rowIndex++;
      break;
    case 'customer':
      addCell('state', rowIndex);
      sheet.cell(2, rowIndex).value('customer');

      rowIndex++;
      break;
  }

  for (const config of configs) {
    addCell(config, rowIndex);
    rowIndex++;
  }

  return {
    name: `import-template`,
    response: await generateXlsx(workbook),
  };
};
