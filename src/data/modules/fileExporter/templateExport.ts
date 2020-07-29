import { createXlsFile, generateXlsx } from '../../utils';

export const templateExport = async (args: any) => {
  const { configs, contentType } = args;

  const { workbook, sheet } = await createXlsFile();

  let rowIndex: number = 1;

  const addCell = (value: string, index: number): void => {
    sheet.cell(1, index).value(value);
  };

  for (const config of configs) {
    addCell(config, rowIndex);
    rowIndex++;
  }

  return {
    name: `${contentType}-import-template`,
    response: await generateXlsx(workbook),
  };
};
